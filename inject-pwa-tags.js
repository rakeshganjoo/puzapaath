#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const distIndexPath = path.join(__dirname, 'dist', 'index.html');

// Read the current dist/index.html
let html = fs.readFileSync(distIndexPath, 'utf8');

// PWA meta tags to inject
const pwaTags = `    <!-- iOS PWA: Add to Home Screen support -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Janthari" />
    <link rel="apple-touch-icon" href="/favicon.png" />
    <!-- Theme color for browser chrome -->
    <meta name="theme-color" content="#F5E6C8" />
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />`;

// Find </title> and inject PWA tags right after
const titleEndIndex = html.indexOf('</title>');
if (titleEndIndex !== -1) {
  html = html.slice(0, titleEndIndex + 8) + '\n' + pwaTags + '\n' + html.slice(titleEndIndex + 8);
  fs.writeFileSync(distIndexPath, html, 'utf8');
  console.log('✓ PWA tags successfully injected into dist/index.html');
} else {
  console.error('✗ Could not find </title> tag in dist/index.html');
  process.exit(1);
}
