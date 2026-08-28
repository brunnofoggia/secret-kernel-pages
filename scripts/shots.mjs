/* Screenshot dist/ in a set of states, for eyeballing. Not a gate — that is
 * verify.mjs / verify-local.mjs.
 *
 * Runs through the Windows Chrome WSL can reach, for the same reason
 * verify-local.mjs does.
 */
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, TMP } from './lib/config.mjs';
import { iframeHarness, screenshot, stage, NARROW_LIMIT } from './lib/win-chrome.mjs';

/* name, width, height, prose language, code language, section to isolate */
const SHOTS = [
  ['01-hero-en-py', 1440, 1000, 'en', 'py', null],
  ['02-hero-pt-ts', 1440, 1000, 'pt', 'ts', null],
  ['02b-install-py', 1440, 1500, 'en', 'py', 'install'],
  ['02c-install-pt-ts', 1440, 1500, 'pt', 'ts', 'install'],
  ['03-names-en-py', 1440, 1100, 'en', 'py', 'names'],
  ['04-providers-pt-py', 1440, 1150, 'pt', 'py', 'providers'],
  ['05-parse-en-ts', 1440, 1150, 'en', 'ts', 'parse'],
  ['06-errors-pt-py', 1440, 1150, 'pt', 'py', 'errors'],
  ['07-changelog-py', 1440, 1250, 'en', 'py', 'changelog'],
  ['07b-changelog-ts', 1440, 1100, 'en', 'ts', 'changelog'],
  ['10-footer-en-py', 1440, 620, 'en', 'py', 'footer'],
  ['08-mobile-pt-py', 390, 1000, 'pt', 'py', null],
  ['09-mobile-en-ts', 390, 1000, 'en', 'ts', 'install'],
];

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('error: dist/index.html not found — run `npm run build` first');
  process.exit(1);
}

let area;
try {
  area = await stage('skshots', DIST);
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}

const outDir = join(TMP, 'final');
await mkdir(outDir, { recursive: true });

const base = await readFile(join(DIST, 'index.html'), 'utf8');

for (const [name, width, height, lang, code, anchor] of SHOTS) {
  let html = base.replace(
    '<html lang="en" data-lang="en" data-code="py">',
    `<html lang="${lang === 'pt' ? 'pt-BR' : 'en'}" data-lang="${lang}" data-code="${code}">`,
  );

  /* The page persists both toggles, so a shot must not inherit a previous run. */
  html = html.replace(
    /<script src="app\.[^"]+\.js" defer><\/script>/,
    (m) => `<script>try{localStorage.clear()}catch(e){}</script>\n${m}`,
  );

  /* Isolating a section beats scrolling to it: headless Chrome screenshots the
   * original scroll position regardless of what the page did after load. */
  if (anchor === "footer") {
    html = html.replace("</body>",
      "<style>main{display:none}.footer{border-top:0}</style></body>");
  } else if (anchor) {
    html = html.replace('</body>',
      `<style>main > section:not(#${anchor}){display:none}` +
      `footer{display:none}#${anchor}{padding-top:3rem}</style></body>`);
  }

  await area.write(`${name}.html`, html);

  const narrow = width < NARROW_LIMIT;
  let url = area.url(`${name}.html`);
  let winWidth = width;
  if (narrow) {
    await area.write(`${name}-harness.html`, iframeHarness(width, height, `${name}.html`));
    url = area.url(`${name}-harness.html`);
    winWidth = width + 60;
  }

  await screenshot(url, area.winPath(`${name}.png`), { width: winWidth, height });

  const shot = join(area.dir, `${name}.png`);
  if (!existsSync(shot)) {
    console.error(`  FAIL ${name}`);
    process.exit(1);
  }
  await copyFile(shot, join(outDir, `${name}.png`));
  const { size } = await import('node:fs').then((fs) => fs.statSync(shot));
  console.log(`  ok ${name}.png  ${Math.round(size / 1024)} KB  (${width}x${height}, ${lang}/${code})`);
}

console.log(`\n  ${SHOTS.length} shots in ${outDir.replace(process.cwd() + '/', '')}`);
