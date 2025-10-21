import logging
import numpy as np
import io
import wave
from typing import Optional, List, Dict
from kokoro import generate

logger = logging.getLogger(__name__)


class TTSService:
    def __init__(self):
        self.voice_map = {
            "en": "af_sarah",
            "ru": "af_sarah",
            "de": "af_sarah",
            "fr": "af_sarah",
            "es": "af_sarah",
            "ja": "af_sarah",
            "zh": "af_sarah",
            "ar": "af_sarah",
            "pt": "af_sarah",
            "it": "af_sarah",
        }

        self.available_voices = [
            "af_sarah", "af_nicole", "af_sky",
            "am_adam", "am_michael",
            "bf_emma", "bf_isabella",
            "bm_george", "bm_lewis"
        ]

        self._test_kokoro()

    def _test_kokoro(self):
        try:
            test_audio = generate("Test", voice="af_sarah", speed=1.0, lang="en-us")
            logger.info("Kokoro TTS initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Kokoro TTS: {e}")
            logger.warning("TTS service may not work correctly")

    async def synthesize(
        self,
        text: str,
        lang: str,
        speed: float = 1.0,
        volume: float = 1.0,
        voice: Optional[str] = None
    ) -> bytes:
        try:
            selected_voice = voice if voice and voice in self.available_voices else self.voice_map.get(lang, "af_sarah")

            lang_code = self._get_kokoro_lang_code(lang)

            speed = max(0.5, min(2.0, speed))
            volume = max(0.0, min(2.0, volume))

            logger.info(f"Generating TTS: text='{text[:50]}...', voice={selected_voice}, lang={lang_code}, speed={speed}")

            audio_samples = generate(
                text=text,
                voice=selected_voice,
                speed=speed,
                lang=lang_code
            )

            if volume != 1.0:
                audio_samples = audio_samples * volume
                audio_samples = np.clip(audio_samples, -1.0, 1.0)

            audio_int16 = (audio_samples * 32767).astype(np.int16)

            wav_buffer = io.BytesIO()
            with wave.open(wav_buffer, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)
                wav_file.setframerate(24000)
                wav_file.writeframes(audio_int16.tobytes())

            wav_buffer.seek(0)
            return wav_buffer.read()

        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            raise

    def _get_kokoro_lang_code(self, lang: str) -> str:
        lang_map = {
            "en": "en-us",
            "ru": "en-us",
            "de": "en-us",
            "fr": "en-us",
            "es": "en-us",
            "ja": "en-us",
            "zh": "en-us",
            "ar": "en-us",
            "pt": "en-us",
            "it": "en-us",
        }
        return lang_map.get(lang, "en-us")

    def get_supported_languages(self) -> List[Dict[str, str]]:
        languages = [
            {"code": "en", "name": "English"},
            {"code": "ru", "name": "Russian"},
            {"code": "de", "name": "German"},
            {"code": "fr", "name": "French"},
            {"code": "es", "name": "Spanish"},
            {"code": "ja", "name": "Japanese"},
        ]
        return languages

    def is_ready(self) -> bool:
        return True
