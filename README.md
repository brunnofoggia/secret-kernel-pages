# secret-kernel-pages

The one-page site for the [Secret Kernel](https://github.com/brunnofoggia/secret-kernel-py)
library family — `secret-kernel-py` and `secret-kernel-js`.

Hand-authored HTML, CSS and vanilla JavaScript. No framework, no bundler. The
tooling is Node only.

## Run it

```bash
npm run build
npm run serve      # http://localhost:8000
```

`dist/index.html` also opens directly over `file://` — the stylesheet, the script
and the brand marks are all local or inline. Only the web fonts come from the
network.

`src/index.html` is **not** viewable on its own: it carries placeholders the build
fills in. Build first.

## Why there is a build

`dist/` is not a copy of `src/`. Everything `scripts/build.mjs` does is a reason
the step exists:

1. **The brand-mark sprite is injected.** It is generated from
   `src/assets/logos/` by `npm run sprite`, so keeping it inline in
   `src/index.html` would commit a build artifact into the source tree.
2. **`styles.css` and `app.js` get a content hash in their filename** —
   `styles.60be36e5.css` — so Pages can serve them with a long cache lifetime and
   still update the moment they change.
3. **`.nojekyll` is written**, without which Pages runs the files through Jekyll.
4. **With a domain configured**, `CNAME`, the canonical link, `og:url`,
   `robots.txt` and `sitemap.xml`. See below.

Nothing is minified. The page is ~67 KB of HTML and gzip on the wire does most of
what a minifier would, for none of the toolchain.

## The deploy target lives in one file

`site.config.json` holds the origin the site is served from:

```json
{ "url": "https://secret-kernel.example.com" }
```

Five outputs depend on it, which is why it is one file rather than five literals:
`dist/CNAME`, `<link rel="canonical">`, `og:url`, `robots.txt` and `sitemap.xml`.
A site served from the wrong host in any one of them is worse than one with none
of them.

Leave `url` empty and the build says so and skips all five — fine for local
preview, and the deploy workflow refuses to run, because **Pages silently reverts
to `<user>.github.io` when the published artifact has no `CNAME`**.

Setting up a custom subdomain, once:

1. put the origin in `site.config.json`;
2. add a DNS `CNAME` record for the subdomain pointing at `<user>.github.io`;
3. in the repository, **Settings → Pages → Source: GitHub Actions**;
4. after the certificate is issued, **Settings → Pages → Enforce HTTPS**.

Asset references in the page are relative, so the build is also correct if you
ever serve it from a subpath such as `<user>.github.io/secret-kernel-pages/`.

## Structure

```text
src/                       hand-authored, the only thing you edit
├── index.html             the page, with placeholders for sprite and canonical
├── styles.css             tokens, layout, responsive rules
├── app.js                 the two toggles, copy buttons, nav highlighting
└── assets/
    ├── logos/*.svg        official brand marks, as downloaded
    └── logo-sprite.html   the marks folded into one <symbol> sprite (generated)
dist/                      the built artifact — gitignored, never edited
site.config.json           the origin the site is served from
scripts/
├── build.mjs              src/ -> dist/
├── build-logo-sprite.mjs  regenerate the sprite from src/assets/logos/
├── serve.mjs              serve dist/ for local preview
├── probe.js               the layout checks, injected into the page
├── verify.mjs             runs the checks via Playwright (the CI gate)
├── verify-local.mjs       runs the same checks via Windows Chrome (this WSL box)
├── shots.mjs              screenshots of dist/ in nine states
└── lib/
    ├── config.mjs         paths, viewport widths, the thresholds
    ├── site.mjs           reads and validates site.config.json
    ├── report.mjs         turns a probe report into a verdict
    └── win-chrome.mjs     driving the Windows Chrome WSL can reach
.github/workflows/
├── ci.yml                 build + verify on push and PR
└── deploy.yml             publish dist/ to Pages — manual only
```

`probe.js` keeps the `.js` extension because it is injected into the page and
runs in the browser; it is not a Node module.

Design records, written before the code and kept because they explain it:
`design-spec.md` (the shared brief), `direction-approved.md` (what was chosen and
why), `brand-spec.md` (which marks are used and where they came from).

### What is not here

The design drafts and the palette set are **not** in this repository. They belong
to the four sites the family will have, not to this one, so they live in the
sibling [`lib-family`](https://github.com/brunnofoggia/lib-family) repository:

- `lib-family/pages/directions/` — the three directions that were proposed
- `lib-family/pages/palettes/` — the four palette variants, as renderable HTML
- `lib-family/docs/paletas.md` — the token values, measured contrast, and which
  library owns which palette

This repository keeps only the decision record for *this* page.

## The two toggles

The page carries two independent switches, both remembered in `localStorage`:

- **Python ↔ TypeScript** — swaps every code sample *and* the identifier names in
  the prose, following the mapping the api-reference documents in both
  repositories declare as normative (`get_secret ↔ getSecret`,
  `parse_options ↔ parseOptions`, `ttl_ms ↔ ttlMs`, and so on). Real API
  differences are preserved rather than smoothed over: Python's
  `create_secret_client` is synchronous and takes dataclasses, TypeScript's
  `createSecretClient` is `async` and takes object literals.
- **EN ↔ PT-BR** — swaps the prose.

Both switch through a CSS attribute selector on `<html>`, so the page is readable
with JavaScript disabled; it just stays on the defaults (EN, Python).

## Verifying a change

```bash
npm run check-all      # build + verify — the CI gate
npm run shots          # screenshots into tmp/final/ to eyeball
```

At eight viewport widths from 1440 down to 360, the verifier checks:

- horizontal overflow, and any element escaping the viewport (code blocks and
  wide tables are exempt — they scroll inside their own container);
- that both toggles actually swap content, rather than only flipping an attribute;
- that no rendered text falls below 12px, the floor `design-spec.md` sets;
- that no interactive target is under 24px tall (WCAG 2.2 AA, Target Size Minimum);
- that the built page carries all seven brand symbols and every `<use>` resolves.

Console errors fail the run too. CI additionally fails if the committed sprite is
stale — it regenerates it and diffs.

### Two harnesses, one set of checks

The measurements live in `scripts/probe.js` and the verdict in
`scripts/lib/report.mjs`. Two harnesses load both:

- **`npm run verify`** — Playwright. What CI runs, and what works on any machine
  with a normal Chromium.
- **`npm run verify:local`** — Windows Chrome through `/mnt/c/...`, for this WSL
  box.

The duplication is the browser plumbing, not the checks, so the two cannot drift
on *what* they assert. The local harness exists because of three things found the
hard way here:

1. Playwright's `chrome-headless-shell` will not start — `libnspr4.so` and
   `libnss3` are missing, and installing them means touching system packages.
2. Chrome's `--remote-debugging-port` is not reachable from WSL: the port binds
   on the Windows side and the firewall drops the connection, so there is no CDP
   either — only the command line.
3. Windows Chrome refuses a window narrower than roughly 500px, and even above
   that the window is ~16px wider than the layout viewport it produces. Every
   width is therefore rendered inside an `<iframe>` of the exact size, so the
   number in the table is the number that was tested, with the probe reporting
   back over `postMessage`.

Install `libnspr4` and `libnss3` and `verify-local.mjs` can be deleted in favour
of `verify.mjs`.

## CI and deploying

`ci.yml` runs on every push and pull request to `main`: check the sprite, build,
verify, and upload `dist/` as an artifact. It never deploys.

`deploy.yml` publishes `dist/` to Pages and is **`workflow_dispatch` only** —
someone has to start it. A deploy puts the page in front of people, and that
stays a decision rather than a side effect of merging. It runs the same build and
verify first, refuses to start without a configured domain, and asserts
`dist/CNAME` exists before uploading.

To deploy on every push to `main` instead, add a `push:` trigger to `deploy.yml`.

## Content is downstream of the libraries

Every claim, option name, default and version on the page comes from the two
repositories — mostly `docs/secret-kernel-api-reference.md`, which is normative
for the public surface. When the libraries change, the page follows; it is not a
second source of truth.

Deliberately absent: download counts, star counts, testimonials and benchmarks.
The libraries are at `0.1.0a` and the page says so.

## Palette

This page uses **A2 — Prussian & Sky**, one of four in the family set. The tokens
are declared in `src/styles.css` under `:root`; the reasoning, the measured
contrast and the assignment of the other three to the sibling libraries are in
`lib-family/docs/paletas.md`.

Changing the palette here means editing those tokens. It does not mean picking a
different one from the set — each palette belongs to one library, which is the
only reason the set exists.

## Known gaps

- **The web fonts are the only external request.** They come from Google Fonts,
  which means visitor IPs reach Google. Self-hosting is four `woff2` files in
  `src/assets/fonts/` plus an `@font-face` block; the build would copy them.
- **`dist/` is unminified**, by the decision above.
- **No social card image.** `og:image` is absent, so shared links render without
  a preview picture.

## License

MIT, matching the libraries.
