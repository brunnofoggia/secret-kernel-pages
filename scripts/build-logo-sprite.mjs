/* Fold the downloaded official brand SVGs into one inline <symbol> sprite.
 *
 * The marks are third-party trademarks used for identification, so they are kept
 * byte-for-byte from their official sources and stripped only of hardcoded
 * fills, which lets the page recolour them through currentColor.
 *
 * Run this after adding or replacing anything in src/assets/logos/. The output
 * is committed because src/ has no other generated file and the build reads it
 * directly.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SRC } from './lib/config.mjs';

const LOGO_DIR = join(SRC, 'assets', 'logos');
const OUT = join(SRC, 'assets', 'logo-sprite.html');

const TITLES = {
  aws: 'Amazon Web Services',
  github: 'GitHub',
  googlecloud: 'Google Cloud',
  npm: 'npm',
  pypi: 'PyPI',
  python: 'Python',
  typescript: 'TypeScript',
};

async function symbol(file) {
  const slug = file.replace(/\.svg$/, '');
  const source = await readFile(join(LOGO_DIR, file), 'utf8');

  const viewBox = source.match(/viewBox="([^"]+)"/);
  if (!viewBox) throw new Error(`${file} has no viewBox`);

  const paths = [...source.matchAll(/<path[^>]*?\sd="([^"]+)"/g)].map((m) => m[1]);
  if (!paths.length) throw new Error(`${file} has no path data`);

  const title = TITLES[slug];
  if (!title) throw new Error(`${file}: add a title for "${slug}" to TITLES`);

  const body = paths.map((d) => `<path d="${d}"/>`).join('');
  return `<symbol id="logo-${slug}" viewBox="${viewBox[1]}"><title>${title}</title>${body}</symbol>`;
}

try {
  const files = (await readdir(LOGO_DIR)).filter((f) => f.endsWith('.svg')).sort();
  const symbols = await Promise.all(files.map(symbol));

  const sprite =
    '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ' +
    'style="position:absolute;width:0;height:0;overflow:hidden">' +
    symbols.join('') + '</svg>\n';

  await writeFile(OUT, sprite, 'utf8');
  console.log(`  ${OUT.replace(process.cwd() + '/', '')} — ${symbols.length} symbols, ` +
    `${Buffer.byteLength(sprite)} bytes`);
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
