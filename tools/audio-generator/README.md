# Audio Generator API (Reusable Plugin)

This folder turns your existing Janam Din Puja audio scripts into a reusable API service.

## Why this exists

Earlier, audio creation was script-by-script and manual:
- `generate_audio.py` for mantra audio
- `generate_narration.py` for English explanations
- `generate_sanskrit_audio.py` for model-based Sanskrit TTS

Now we expose a single interface so any app module can request audio generation in a standard way.

## Endpoints

- `GET /health`
- `POST /generate/mantra`
- `POST /generate/narration`
- `POST /generate/sanskrit`

## Request shape

```json
{
  "text": "om ganapataye namah",
  "filename": "a1_ganesh",
  "voice": "Kiyara",
  "rate": 120
}
```

Only `text` is required.

## Output

All generated files are written under:

`src/assets/audio/api-generated/`

Response includes `output_file` as a repo-relative path.

## Local run

```bash
cd tools/audio-generator
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn audio_api_server:app --host 0.0.0.0 --port 8010 --reload
```

## Curl examples

```bash
curl -s http://localhost:8010/health

curl -s -X POST http://localhost:8010/generate/mantra \
  -H "Content-Type: application/json" \
  -d '{"text":"om namah shivaya","filename":"shiv-mantra"}'

curl -s -X POST http://localhost:8010/generate/narration \
  -H "Content-Type: application/json" \
  -d '{"text":"Now offer flowers to the deity.","filename":"step-a5"}'
```

## Sanskrit model mode (remote)

Set environment variable before starting API:

```bash
export SANSKRIT_TTS_URL="http://192.168.86.29:8000"
```

`/generate/sanskrit` now proxies to your configured remote Sanskrit TTS host,
then downloads the generated audio into `src/assets/audio/api-generated/`.

Expected remote contract:
- `POST {SANSKRIT_TTS_URL}/generate/sanskrit` returns JSON with `output_file`
- `GET  {SANSKRIT_TTS_URL}/audio/{filename}` serves the audio binary

## Integration pattern in app code

Use a small client wrapper from any feature module:

```ts
await fetch('http://localhost:8010/generate/mantra', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text, filename, voice: 'Kiyara', rate: 120 }),
});
```

This makes audio generation reusable across Puja, Muhurat narration, onboarding, and future features.
