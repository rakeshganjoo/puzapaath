# Cloud Sync Setup (Cloudflare, low-cost)

This app supports local-only mode by default and optional cloud sync.

## App behavior

- Default: local-only (no login needed)
- Optional: user enables cloud sync in Setup screen
- Optional identity can be entered for cross-device sync scope

## Backend scaffold

Worker folder:
- `../janthari-sync-worker/`

Endpoints expected by app:
- `POST /v1/sync/push`
- `GET /v1/sync/pull`

## Deploy backend manually (no GitHub Actions)

```bash
cd ../janthari-sync-worker
./deploy.sh
```

If this is your first deploy on a machine:

```bash
npx wrangler login
npx wrangler d1 create janthari-sync
# copy returned database_id into wrangler.toml
npx wrangler d1 migrations apply janthari-sync
npx wrangler deploy
```

## Configure app endpoint

In app Setup screen, set `Sync Endpoint` to:
- `https://api.janthari.com`

## Security hardening before wide rollout

1. Set `SYNC_API_KEY` as a Worker secret:

```bash
cd ../janthari-sync-worker
printf "%s" "<LONG_RANDOM_TOKEN>" | npx wrangler secret put SYNC_API_KEY
```

2. Enter the same token in app Setup screen: `Sync API Token`.
3. Add Cloudflare rate limits/WAF for `/v1/sync/*`.
4. Add signed session tokens (next phase) for user-scoped sync.

## Cloudflare route configuration

In Cloudflare Dashboard:
1. Open `Workers & Pages` -> your Worker `janthari-sync-worker`.
2. Add route: `api.janthari.com/*`.
3. Ensure DNS for `api.janthari.com` is proxied (orange cloud).

## Login method (recommended)

Current production-safe minimum:
- Local-only by default (no login required)
- Optional cloud sync token for authorized devices/users

Recommended next login phase:
1. Add OTP email login via Cloudflare Turnstile + lightweight auth worker.
2. Issue short-lived signed JWT/session token.
3. Use token as `Authorization: Bearer ...` in sync calls.

## Validation checklist

```bash
# App checks
cd PuzaPaathApp
node ./node_modules/typescript/bin/tsc --noEmit
./node_modules/.bin/jest --no-coverage --runInBand
npx --yes madge --circular --extensions ts,tsx src/

# Worker check
cd ../janthari-sync-worker
npx tsc -p tsconfig.json
```
