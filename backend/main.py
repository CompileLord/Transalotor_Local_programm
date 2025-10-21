from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io
import logging

from translation import TranslationService
from tts import TTSService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Local Translator & TTS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

translation_service = TranslationService()
tts_service = TTSService()


class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str


class TTSRequest(BaseModel):
    text: str
    lang: str
    speed: Optional[float] = 1.0
    volume: Optional[float] = 1.0
    voice: Optional[str] = None


@app.get("/")
async def root():
    return {
        "message": "Local Translator & TTS API",
        "endpoints": {
            "translation": "/api/translate",
            "tts": "/api/tts",
            "languages": "/api/languages",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "translation": translation_service.is_ready(),
        "tts": tts_service.is_ready()
    }


@app.get("/api/languages")
async def get_languages():
    return {
        "translation": translation_service.get_supported_languages(),
        "tts": tts_service.get_supported_languages()
    }


@app.post("/api/translate")
async def translate(request: TranslationRequest):
    try:
        if not request.text:
            raise HTTPException(status_code=400, detail="Text is required")

        translation = await translation_service.translate(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )

        return {"translation": translation}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail="Translation failed")


@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    try:
        if not request.text:
            raise HTTPException(status_code=400, detail="Text is required")

        audio_data = await tts_service.synthesize(
            text=request.text,
            lang=request.lang,
            speed=request.speed,
            volume=request.volume,
            voice=request.voice
        )

        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=speech.wav",
                "Content-Length": str(len(audio_data))
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail="TTS synthesis failed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
