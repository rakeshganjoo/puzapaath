#!/usr/bin/env python3
"""
Reusable Audio Generation API for Janthari / PuzaPaath.

Purpose:
- Expose existing script/tooling as a stable local API so any feature can request
  audio generation without re-implementing shell logic.

Supports 3 backends:
1) mantra     -> macOS say (Hindi voices)
2) narration  -> macOS say (English voice)
3) sanskrit   -> external ML host (optional; calls remote FastAPI if configured)

Run:
  uvicorn audio_api_server:app --host 0.0.0.0 --port 8010 --reload
"""

from __future__ import annotations

import os
import re
import json
import time
import uuid
import shutil
import pathlib
import subprocess
import urllib.request
import urllib.error
from typing import Optional, Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Janthari Audio Generator API", version="1.0.0")

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "src" / "assets" / "audio" / "api-generated"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Optional remote Sanskrit TTS host (the Mac mini model server)
SANSKRIT_REMOTE_URL = os.getenv("SANSKRIT_TTS_URL", "")


def _slug(text: str) -> str:
  cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip()).strip("-").lower()
  return cleaned or "audio"


def _ensure_tool(binary: str) -> None:
  if shutil.which(binary) is None:
    raise HTTPException(status_code=500, detail=f"Required tool not found: {binary}")


class GenerateRequest(BaseModel):
  text: str = Field(min_length=1, max_length=8000)
  filename: Optional[str] = None
  voice: Optional[str] = None
  rate: Optional[int] = Field(default=None, ge=80, le=260)


class GenerateResponse(BaseModel):
  ok: bool
  mode: Literal["mantra", "narration", "sanskrit"]
  output_file: str
  duration_ms: int
  details: dict


@app.get("/health")
def health():
  return {"ok": True, "service": "audio-generator", "output_dir": str(OUTPUT_DIR)}


@app.post("/generate/mantra", response_model=GenerateResponse)
def generate_mantra(req: GenerateRequest):
  _ensure_tool("say")
  _ensure_tool("afconvert")

  start = time.time()
  voice = req.voice or "Kiyara"
  rate = req.rate or 120
  base = _slug(req.filename or req.text[:40])
  token = uuid.uuid4().hex[:8]
  aiff = OUTPUT_DIR / f"{base}-{token}.aiff"
  m4a = OUTPUT_DIR / f"{base}-{token}.m4a"

  try:
    subprocess.run(
      ["say", "-v", voice, "-r", str(rate), "-o", str(aiff), req.text],
      check=True,
      capture_output=True,
      text=True,
    )
    subprocess.run(
      ["afconvert", "-f", "m4af", "-d", "aac", str(aiff), str(m4a)],
      check=True,
      capture_output=True,
      text=True,
    )
  except subprocess.CalledProcessError as exc:
    raise HTTPException(status_code=500, detail=f"Audio generation failed: {exc.stderr}") from exc
  finally:
    if aiff.exists():
      aiff.unlink(missing_ok=True)

  return GenerateResponse(
    ok=True,
    mode="mantra",
    output_file=str(m4a.relative_to(ROOT)),
    duration_ms=int((time.time() - start) * 1000),
    details={"voice": voice, "rate": rate},
  )


@app.post("/generate/narration", response_model=GenerateResponse)
def generate_narration(req: GenerateRequest):
  _ensure_tool("say")
  _ensure_tool("afconvert")

  start = time.time()
  voice = req.voice or "Ava (Premium)"
  rate = req.rate or 160
  base = _slug(req.filename or req.text[:40])
  token = uuid.uuid4().hex[:8]
  aiff = OUTPUT_DIR / f"narr-{base}-{token}.aiff"
  m4a = OUTPUT_DIR / f"narr-{base}-{token}.m4a"

  try:
    subprocess.run(
      ["say", "-v", voice, "-r", str(rate), "-o", str(aiff), req.text],
      check=True,
      capture_output=True,
      text=True,
    )
    subprocess.run(
      ["afconvert", "-f", "m4af", "-d", "aac", str(aiff), str(m4a)],
      check=True,
      capture_output=True,
      text=True,
    )
  except subprocess.CalledProcessError as exc:
    raise HTTPException(status_code=500, detail=f"Narration generation failed: {exc.stderr}") from exc
  finally:
    if aiff.exists():
      aiff.unlink(missing_ok=True)

  return GenerateResponse(
    ok=True,
    mode="narration",
    output_file=str(m4a.relative_to(ROOT)),
    duration_ms=int((time.time() - start) * 1000),
    details={"voice": voice, "rate": rate},
  )


@app.post("/generate/sanskrit", response_model=GenerateResponse)
def generate_sanskrit(req: GenerateRequest):
  if not SANSKRIT_REMOTE_URL:
    raise HTTPException(
      status_code=400,
      detail="SANSKRIT_TTS_URL is not set. Set it to your ML server URL, e.g. http://192.168.86.29:8020",
    )

  start = time.time()
  token = uuid.uuid4().hex[:8]
  base = _slug(req.filename or req.text[:40])
  m4a = OUTPUT_DIR / f"sanskrit-{base}-{token}.m4a"

  # Forward request to remote Sanskrit TTS server (Orpheus-3B on Mac mini)
  payload = json.dumps({
    "text": req.text,
    "filename": req.filename,
    "voice": req.voice,
    "rate": req.rate,
  }, ensure_ascii=False).encode("utf-8")

  remote_endpoint = SANSKRIT_REMOTE_URL.rstrip("/") + "/generate/sanskrit"
  http_req = urllib.request.Request(
    remote_endpoint,
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST",
  )

  try:
    with urllib.request.urlopen(http_req, timeout=120) as resp:
      remote_result = json.loads(resp.read())
  except urllib.error.HTTPError as exc:
    body = exc.read().decode(errors="replace")
    raise HTTPException(
      status_code=502,
      detail=f"Remote Sanskrit TTS returned {exc.code}: {body[:400]}",
    ) from exc
  except urllib.error.URLError as exc:
    raise HTTPException(
      status_code=503,
      detail=f"Cannot reach Sanskrit TTS server at {SANSKRIT_REMOTE_URL}: {exc.reason}",
    ) from exc

  # Remote server writes the audio file to its own disk and returns the path.
  # Download that file over the /audio/ static endpoint the remote server exposes.
  remote_file = remote_result.get("output_file", "")
  if not remote_file:
    raise HTTPException(status_code=502, detail="Remote server returned no output_file")

  audio_url = SANSKRIT_REMOTE_URL.rstrip("/") + "/audio/" + pathlib.Path(remote_file).name
  try:
    urllib.request.urlretrieve(audio_url, m4a)  # noqa: S310 (trusted internal URL)
  except urllib.error.URLError as exc:
    raise HTTPException(
      status_code=502,
      detail=f"Could not download audio from remote: {exc.reason}",
    ) from exc

  return GenerateResponse(
    ok=True,
    mode="sanskrit",
    output_file=str(m4a.relative_to(ROOT)),
    duration_ms=int((time.time() - start) * 1000),
    details={
      "remote": SANSKRIT_REMOTE_URL,
      "remote_file": remote_file,
    },
  )
