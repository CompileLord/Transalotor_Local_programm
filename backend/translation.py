import logging
from typing import List, Dict
from argostranslate import package, translate
import os

logger = logging.getLogger(__name__)


class TranslationService:
    def __init__(self):
        self.installed_languages = {}
        self._initialize_models()

    def _initialize_models(self):
        try:
            package.update_package_index()
            available_packages = package.get_available_packages()

            installed = package.get_installed_packages()

            if not installed:
                logger.info("No translation models installed. Installing default models...")
                self._install_default_models(available_packages)
            else:
                logger.info(f"Found {len(installed)} installed translation models")
                for pkg in installed:
                    key = f"{pkg.from_code}-{pkg.to_code}"
                    self.installed_languages[key] = pkg

        except Exception as e:
            logger.error(f"Failed to initialize translation models: {e}")
            logger.warning("Running without pre-installed models. Models will be installed on demand.")

    def _install_default_models(self, available_packages):
        default_pairs = [
            ("en", "ru"), ("ru", "en"),
            ("en", "de"), ("de", "en"),
            ("en", "fr"), ("fr", "en"),
            ("en", "es"), ("es", "en"),
            ("en", "ja"), ("ja", "en"),
            ("en", "it"), ("it", "en"),
            ("en", "zh"), ("zh", "en"),
            ("en", "ar"), ("ar", "en"),
            ("en", "pt"), ("pt", "en"),
        ]

        for from_code, to_code in default_pairs:
            package_to_install = next(
                (p for p in available_packages if p.from_code == from_code and p.to_code == to_code),
                None
            )
            if package_to_install:
                try:
                    logger.info(f"Installing {from_code}->{to_code} model...")
                    package.install_from_path(package_to_install.download())
                    key = f"{from_code}-{to_code}"
                    self.installed_languages[key] = package_to_install
                except Exception as e:
                    logger.warning(f"Failed to install {from_code}->{to_code}: {e}")

    def _ensure_model_installed(self, source_lang: str, target_lang: str):
        key = f"{source_lang}-{target_lang}"

        if key in self.installed_languages:
            return

        try:
            available_packages = package.get_available_packages()
            package_to_install = next(
                (p for p in available_packages if p.from_code == source_lang and p.to_code == target_lang),
                None
            )

            if package_to_install:
                logger.info(f"Installing translation model: {source_lang} -> {target_lang}")
                package.install_from_path(package_to_install.download())
                self.installed_languages[key] = package_to_install
            else:
                raise ValueError(f"Translation model not available: {source_lang} -> {target_lang}")

        except Exception as e:
            logger.error(f"Failed to install model {source_lang}->{target_lang}: {e}")
            raise

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        if source_lang == target_lang:
            return text

        try:
            self._ensure_model_installed(source_lang, target_lang)

            translation = translate.translate(text, source_lang, target_lang)

            if not translation:
                raise ValueError("Translation returned empty result")

            return translation

        except Exception as e:
            logger.error(f"Translation failed: {e}")
            raise

    def get_supported_languages(self) -> List[Dict[str, str]]:
        languages = [
            {"code": "en", "name": "English"},
            {"code": "ru", "name": "Russian"},
            {"code": "de", "name": "German"},
            {"code": "fr", "name": "French"},
            {"code": "es", "name": "Spanish"},
            {"code": "it", "name": "Italian"},
            {"code": "ja", "name": "Japanese"},
            {"code": "zh", "name": "Chinese"},
            {"code": "ar", "name": "Arabic"},
            {"code": "pt", "name": "Portuguese"},
        ]
        return languages

    def is_ready(self) -> bool:
        return len(self.installed_languages) > 0
