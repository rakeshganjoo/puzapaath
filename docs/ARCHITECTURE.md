# Janthari Application Architecture

## Overview

Janthari (PuzaPaathApp) is organized as modular MFEs with shared contexts, services, and single sources of truth (SSoT).

Architecture layers:
1. Presentation (`src/screens`, `src/components`, `src/mfes/*`)
2. Context/State (`src/contexts`)
3. Services (`src/services`)
4. Data + Types (`src/data`, `src/types`)
5. External Integrations (Nominatim, storage, audio backends)

## MFE Modules

- `home-mfe`: Home + setup flow
- `calendar-mfe`: Hindu calendar, festivals, personal events
- `tithi-mfe`: tithi calculator
- `muhurat-mfe`: muhurat input and results
- `puja-mfe`: interactive Janam Din puja flow
- `tekni-mfe`: tekni/kundali generation

Each MFE has:
- `index.ts` barrel exports
- `README.md` with module contract

## Single Source of Truth

- Tekni data types: `src/types/tekni.ts`
- Shared city list: `src/data/cities.ts`
- Storage abstraction: `src/services/StorageService.ts`
- Muhurat public API: `src/services/MuhuratService.ts`
- Tekni computation API: `src/services/TekniService.ts`
- Puja data API: `src/services/PujaService.ts`

## Contexts

- `UIContext`: theme + design tokens
- `AudioContext`: playback control abstraction
- `CalendarContext`: month/date/filter + saved event state
- `PujaContext`: active profile + step/session state
- `SyncContext`: optional cloud sync state (enabled flag, endpoint, identity, sync actions)

All providers are wired in `App.tsx`.

## Service Boundaries

- Screens should avoid direct business logic.
- Use service wrappers for persistence, calculations, and external calls.
- `StorageService` is the only place that should directly touch platform storage APIs.

## Optional Cloud Sync (Cloudflare-first)

User experience:
- App works without login by default (local-only mode).
- Users can optionally enable cloud sync from Setup screen.
- Optional identity can be entered for cross-device sync scope.

Client pieces:
- `src/services/CloudSyncService.ts` — settings + push/pull sync orchestration
- `src/contexts/SyncContext.tsx` — provider state + manual sync action
- `src/screens/SetupScreen.tsx` — sync toggle, endpoint, identity, and "Sync Now"

Backend scaffold:
- `../janthari-sync-worker/` (Cloudflare Worker + D1)
- Deploy manually with `wrangler` (no GitHub Actions required)

## Audio Generation as Reusable API

Audio generation has been productized under:
- `tools/audio-generator/audio_api_server.py`

Endpoints:
- `POST /generate/mantra`
- `POST /generate/narration`
- `POST /generate/sanskrit`

See architecture note:
- `../ARCHITECTURE_DIAGRAMS/AUDIO_GENERATION_API.md`

## Validation Commands

```bash
cd PuzaPaathApp
npx tsc --noEmit

# Optional circular dependency check
npx madge --circular src/

# Optional web bundle sanity check
npx expo export --platform web
```

## Current Known Gaps

- Sanskrit endpoint supports remote proxy + file download via `SANSKRIT_TTS_URL`; remaining work is resilience hardening.
- Some screens still call legacy service modules directly (incremental migration path retained for safety).
- Cloud sync auth is currently optional identity-based; production rollout should add strict auth verification at API boundary.
