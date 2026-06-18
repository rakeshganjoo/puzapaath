#!/usr/bin/env node
/**
 * inject-icon-fonts.js
 *
 * Cloudflare Pages refuses to serve paths containing '@' (e.g. .../@expo/...).
 * Expo web bundles vector-icon fonts under such paths, so the browser sees
 * `Content-Type: text/html` (the SPA fallback) and the icons render as boxes.
 *
 * Workaround:
 *   1. Find every *.ttf under dist/assets that lives in an '@-path'.
 *   2. Copy each to a flat dist/fonts/<Family>.ttf (no '@' in path).
 *   3. Inject @font-face rules into dist/index.html <head> so the browser
 *      registers the correct font-family before the JS bundle requests it.
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const DIST_FONTS = path.join(DIST, 'fonts');
const INDEX_HTML = path.join(DIST, 'index.html');
const DIST_WEB_JS = path.join(DIST, '_expo', 'static', 'js', 'web');

if (!fs.existsSync(DIST)) {
  console.error('✗ dist/ not found — run `expo export --platform web` first.');
  process.exit(1);
}
fs.mkdirSync(DIST_FONTS, { recursive: true });

// Recursively find all .ttf files under dist/assets
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.ttf')) out.push(full);
  }
  return out;
}

const allTtfs = walk(path.join(DIST, 'assets'));

// Family name = filename before the first hash dot (e.g. Ionicons.b4eb097...ttf -> Ionicons)
const fontFaces = [];
const replacements = [];
let copied = 0;
for (const src of allTtfs) {
  const base = path.basename(src);
  const family = base.split('.')[0];
  const flatDest = path.join(DIST_FONTS, `${family}.ttf`);
  fs.copyFileSync(src, flatDest);
  copied++;
  fontFaces.push(
    `      @font-face { font-family: '${family}'; src: url('/fonts/${family}.ttf') format('truetype'); font-display: block; }`
  );
  replacements.push({
    family,
    pattern: new RegExp(`/assets/node_modules/expo/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/${family}\\.[^"'\\s]+\\.ttf`, 'g'),
    target: `/fonts/${family}.ttf`,
  });
}

const styleBlock = `    <style id="injected-icon-fonts">\n${fontFaces.join('\n')}\n    </style>`;

let html = fs.readFileSync(INDEX_HTML, 'utf8');
const headEndIndex = html.indexOf('</head>');
if (headEndIndex === -1) {
  console.error('✗ Could not find </head> in dist/index.html');
  process.exit(1);
}
// Avoid double-injection if script is run twice
if (html.includes('id="injected-icon-fonts"')) {
  html = html.replace(/    <style id="injected-icon-fonts">[\s\S]*?<\/style>\n?/, '');
}
html =
  html.slice(0, headEndIndex) +
  styleBlock + '\n' +
  html.slice(headEndIndex);
fs.writeFileSync(INDEX_HTML, html, 'utf8');

// Expo still bakes the original @expo font asset URLs into the JS bundle.
// Cloudflare serves those '@'-paths as HTML, so we rewrite them to /fonts/*.ttf.
if (fs.existsSync(DIST_WEB_JS)) {
  const jsFiles = fs.readdirSync(DIST_WEB_JS).filter((name) => name.endsWith('.js'));
  for (const fileName of jsFiles) {
    const filePath = path.join(DIST_WEB_JS, fileName);
    let js = fs.readFileSync(filePath, 'utf8');
    for (const replacement of replacements) {
      js = js.replace(replacement.pattern, replacement.target);
    }
    fs.writeFileSync(filePath, js, 'utf8');
  }
}

console.log(`✓ Copied ${copied} font(s) to dist/fonts/ and injected @font-face rules.`);
console.log(`  Families: ${[...new Set(allTtfs.map(p => path.basename(p).split('.')[0]))].join(', ')}`);
