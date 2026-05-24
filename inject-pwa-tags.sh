#!/bin/bash
# Post-build script: Inject PWA tags into dist/index.html

DIST_INDEX="/Users/raganjoo/Documents/rg-exp-code/mac-tools/puzapaath/PuzaPaathApp/dist/index.html"

# Create the PWA meta tags to inject
PWA_TAGS='    <!-- iOS PWA: Add to Home Screen support -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Janthari" />
    <link rel="apple-touch-icon" href="/favicon.png" />
    <!-- Theme color for browser chrome -->
    <meta name="theme-color" content="#F5E6C8" />
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />'

# Find the closing </title> tag and inject PWA tags after it
sed -i '' "/<\/title>/a\\
$PWA_TAGS
" "$DIST_INDEX"

echo "✓ PWA tags injected into dist/index.html"
