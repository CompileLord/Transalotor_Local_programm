# Local Translator & TTS Backend

Python FastAPI backend для локального перевода текста и синтеза речи с использованием Argos Translate и Kokoro TTS.

## Возможности

- **Локальный перевод**: Использует Argos Translate для offline перевода между множеством языков
- **Синтез речи**: Использует Kokoro TTS для высококачественной генерации речи
- **REST API**: Простой и понятный API для интеграции
- **Docker**: Готовый Docker-образ для быстрого развертывания

## Поддерживаемые языки

### Перевод
- English (en)
- Russian (ru)
- German (de)
- French (fr)
- Spanish (es)
- Italian (it)
- Japanese (ja)
- Chinese (zh)
- Arabic (ar)
- Portuguese (pt)

### TTS
- English (en)
- Russian (ru)
- German (de)
- French (fr)
- Spanish (es)
- Japanese (ja)

## Установка

### С использованием Docker (рекомендуется)

```bash
cd backend
docker-compose up -d
```

Backend будет доступен на `http://localhost:8000`

### Локальная установка

```bash
cd backend

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
python main.py
```

## API Endpoints

### GET /health
Проверка статуса сервисов

**Response:**
```json
{
  "status": "healthy",
  "translation": true,
  "tts": true
}
```

### GET /api/languages
Получить список поддерживаемых языков

**Response:**
```json
{
  "translation": [
    {"code": "en", "name": "English"},
    {"code": "ru", "name": "Russian"}
  ],
  "tts": [
    {"code": "en", "name": "English"}
  ]
}
```

### POST /api/translate
Перевести текст

**Request:**
```json
{
  "text": "Hello, world!",
  "source_lang": "en",
  "target_lang": "ru"
}
```

**Response:**
```json
{
  "translation": "Привет, мир!"
}
```

### POST /api/tts
Синтезировать речь из текста

**Request:**
```json
{
  "text": "Hello, world!",
  "lang": "en",
  "speed": 1.0,
  "volume": 1.0,
  "voice": "af_sarah"
}
```

**Response:** WAV audio file

## Голоса Kokoro TTS

Доступные голоса:
- `af_sarah` (женский)
- `af_nicole` (женский)
- `af_sky` (женский)
- `am_adam` (мужской)
- `am_michael` (мужской)
- `bf_emma` (женский, британский)
- `bf_isabella` (женский, британский)
- `bm_george` (мужской, британский)
- `bm_lewis` (мужской, британский)

## Конфигурация

Переменные окружения (опционально):
- `HOST` - хост для прослушивания (по умолчанию: 0.0.0.0)
- `PORT` - порт для прослушивания (по умолчанию: 8000)
- `LOG_LEVEL` - уровень логирования (по умолчанию: INFO)

## Производительность

При первом запуске модели перевода будут автоматически загружены. Это может занять некоторое время в зависимости от количества языковых пар.

Модели сохраняются в:
- Argos Translate: `~/.local/share/argos-translate`
- Kokoro TTS: `~/.cache/kokoro`

## Интеграция с фронтендом

Backend уже интегрирован через Supabase Edge Functions. Edge Functions автоматически проксируют запросы к Python backend.

Для прямого подключения используйте:
```
BACKEND_URL=http://localhost:8000
```
