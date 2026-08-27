# Secret Kernel — Website Design Spec

Single input shared by the three design directions. Written before any direction
exists, so the three differ by design reasoning and not by content.

## 1. What is being designed

A one-page website for the **Secret Kernel** library family: two independent
implementations of the same contract, `secret-kernel-py` (published on PyPI,
`0.1.0a2`) and `secret-kernel-js` (`0.1.0-alpha.1`, **not yet published to npm**).

Hand-authored HTML + CSS + minimal vanilla JS. No Vue, React, Angular, no build
step, no framework. Responsive and modern. Dark mode.

## 2. What the library does — the thing the site has to land

Read decrypted application secrets from AWS, GCP or memory, behind one contract.

Your code asks for `database/password`. Whether that lives in AWS Secrets Manager,
GCP Parameter Manager or a dict in a test does not change the call — only which
distribution you install.

The interesting claim is **not** "we do secrets". It is **what the contract refuses
to do**: read-only, latest version only, no write, no rotate, no delete, no batch
read, no explicit historical version. That restraint is the product. The site must
read as trustworthy and exact, never as hype.

## 3. Audience and context

Backend engineers and platform/infra engineers picking a secrets library, at a
laptop, in a tab next to their editor. They arrive with one question — "does this
fit my stack and how much does it cost me to try" — and they are scanning code
before prose. A second, smaller audience: someone already using it, back to check
an option name or a default.

Consequence: the first screen must carry a real code sample, not a slogan. Every
claim needs the code that proves it, visible without a click.

## 4. Content — sections in order

1. **Hero** — one-sentence purpose, the `get_secret` / `getSecret` line, install
   command, links to PyPI / npm / GitHub. TypeScript carries an
   "unpublished" badge.
2. **Why / utility** — the one-contract claim, and the scope boundary (read-only,
   latest version) stated as a feature.
3. **Install + first read** — copy-pasteable, per language.
4. **How a name is built** — `env / project / prefix / name` resolving to
   `/prod/billing/database/password`. Rules: `env` and `project` are single
   segments and reject a slash; `prefix` and the name accept `/`. All optional.
5. **Changing the name for one call** — `omit_env` / `omit_project` /
   `omit_prefix`, and `project` / `prefix` replacement. Omitting wins over
   replacing. There is deliberately no per-call `env` override, and the site must
   say why: a production service reading a development secret is almost always a
   defect.
6. **Reading structured secrets** — default string; `JSON`; `KEY_VALUE` with
   `pair_separator` / `key_value_separator` / `keys` / `trim`; client-level
   conventions merged field by field by a per-call override.
7. **Providers** — the five, each with its distribution/package name, what it is
   for, and its typed options. AWS: `region`, `credentials`. GCP: `project_id`,
   `location`. Provider options never leak into the shared contract.
8. **Caching** — off by default; keyed by resolved name; stores the decrypted
   string *before* parsing, so the same secret read as JSON and as text costs one
   provider call; failures are never cached; optional AES-256-GCM
   `encrypt_in_memory` with an honest statement of what it does and does not
   protect against.
9. **Errors** — the seven classes and when each is raised. Only not-found and
   permission are normalized; everything else keeps the SDK's message and gains
   `provider`, `ref`, `code`, `cause`.
10. **Observability + bring your own provider** — `logger`, `debug`,
    `provider_class`.
11. **Changelog** — short and factual. `0.1.0a2` (2026-08-25) and `0.1.0-alpha.1`.
    First versions; the changelog should read as a short honest list, not a
    marketing timeline.
12. **Footer** — docs links (API reference, architecture decisions, structure,
    maintenance, release), license MIT.

## 5. Two toggles, both persistent

- **Language of the code**: Python ↔ TypeScript. Every sample switches. Naming
  follows each ecosystem, per the api-reference docs in both repos:
  `get_secret ↔ getSecret`, `provider_name ↔ providerName`,
  `secret_name ↔ secretName`, `ttl_ms ↔ ttlMs`,
  `physical_name_separator ↔ physicalNameSeparator`. Real API differences must be
  preserved, not smoothed over: Python `create_secret_client(...)` is sync and
  takes `CreateSecretClientConfig` + option dataclasses; TypeScript
  `await createSecretClient({...})` is async and takes plain object literals and
  the `SecretProvider` enum.
- **Language of the prose**: EN ↔ PT-BR.

Both in vanilla JS, remembered in `localStorage`. Default: EN + Python.

## 6. Format

Desktop-first at 1440, verified at 1440 / 1024 / 768 / 375. No horizontal scroll
at any width. Body text ≥ 16px, labels ≥ 12px, contrast ≥ 4.5:1.

## 7. Constraints and known anti-patterns

- Dark mode is required. **Avoid the GitHub-dark default** — uniform `#0D1117`
  plus generic cyan/violet neon glow is the single most copied look in developer
  marketing and carries no identity.
- No padlock icons, no keyholes, no shields, no vaults, no "matrix rain". These
  are the stock iconography of secrets and say nothing about *this* library.
- No invented benchmarks, no fake user counts, no testimonial, no star count the
  repo does not have. The library is at `0.1.0a`, and the site should be honest
  about that rather than dressing it as mature.
- No emoji as icons. Brand marks (Python, TypeScript, AWS, GCP, npm, PyPI,
  GitHub) must be the real official SVGs, inline, recolored via `currentColor`.

## 8. Visual motif — the seed for form

The generic answer is a padlock. The specific answer, taken from the content, is
one of three things this library actually has:

- **The resolved path.** `env / project / prefix / name` assembled into
  `/prod/billing/database/password`. One string built from optional slots, where
  dropping a slot is an API feature. No other secrets library makes the path its
  centerpiece; for this one the path *is* the contract.
- **One contract, five backends.** A single call standing above five providers
  that share nothing but the interface. The "kernel" as the narrow waist.
- **The value you never see.** A secret is a value that is read and never
  displayed. Masked glyphs, redaction, presence without disclosure.

Each direction takes one of these as its seed. A direction that could be
retargeted to any other library by swapping the words has failed this spec.
