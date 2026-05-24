#!/usr/bin/env bash
# deploy-cf-pages.sh — Build and deploy Janthari web to Cloudflare Pages.
#
# Prerequisites:
#   1. npm install -g wrangler  (or use npx)
#   2. wrangler login            (or set CLOUDFLARE_API_TOKEN env var)
#   3. Create a Pages project once:
#        npx wrangler pages project create janthari --production-branch main
#
# Usage (manual):
#   CLOUDFLARE_API_TOKEN=<token> ./deploy-cf-pages.sh
#
# Usage (CI - GitHub Actions):
#   Set CLOUDFLARE_API_TOKEN secret in repo settings.
#   The workflow (.github/workflows/deploy.yml) calls this script.

set -euo pipefail

PROJECT_NAME="janthari"
BRANCH="${CF_PAGES_BRANCH:-main}"

echo "[1/4] Building web app"
npx expo export --platform web --output-dir dist

echo "[2/4] Injecting PWA tags"
node inject-pwa-tags.js

echo "[3/4] Copying public assets"
[ -f public/favicon.png ] && cp public/favicon.png dist/favicon.png
[ -f public/manifest.json ] && cp public/manifest.json dist/manifest.json

echo "[4/4] Deploying to Cloudflare Pages (project: $PROJECT_NAME, branch: $BRANCH)"
npx wrangler pages deploy dist \
  --project-name "$PROJECT_NAME" \
  --branch "$BRANCH" \
  --commit-dirty=true

echo ""
echo "Done. Live at https://www.janthari.com (after DNS propagation on first deploy)"
echo "Cloudflare Pages dashboard: https://dash.cloudflare.com/?to=/:account/pages"
