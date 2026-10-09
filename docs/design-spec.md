# Secret Kernel — Website Design Spec

Single input shared by the three design directions. Written before any direction
exists, so the three differ by design reasoning and not by content.

## 1. What is being designed

A one-page website for the **Secret Kernel** library family: two independent
implementations of the same contract, `secret-kernel-py` (published on PyPI,
`0.1.0a4`) and `secret-kernel-js` (published on npm, `0.1.0-alpha.4`).

> Updated 2026-08-27. Both were mid-release while this page was being built:
> TypeScript was unpublished and the site carried an "unpublished" badge for it,
> which the sections below still described. Both are published now.

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

1. **Hero** — the subtitle and title of `lib-family/docs/paginas.md` §8.8:
   "Python & TypeScript · one contract, many providers" over "Secret vault, quick
   and easy." / "Ler segredos, rápido e fácil.". Then the one-sentence purpose, the
   `get_secret` / `getSecret` line, install command, links to PyPI / npm / GitHub.
2. **Why use Secret Kernel** — what one contract in front of five providers buys
   the reader, each benefit a bold lead and one sentence: ask by name and get the
   value; every provider behaves the same (`scrt_not_found` on all of them, and all
   five pass one contract suite); change providers, not code; tests without the
   cloud; Python and TypeScript, one contract. Beside them, the compare block of
   paginas.md §8.9 with AWS, GCP and `in-memory`, the last loading a `.env` in
   `load_env()`. Added on 2026-10-08, per paginas.md §8.7.
3. **Install + first read** — copy-pasteable, per language. Step 2 picks one of the
   five providers with the picker of paginas.md §8.9, and each pane is a complete
   sample on the Why skeleton: the AWS ones with the fake `EXAMPLE` keys of the AWS
   docs, the GCP ones reading the service account key file.
4. **How a name is built** — opens with the client and the call that build it,
   `env` and `project` on the client and the name in the call, then
   `env / project / prefix / name` resolving to `/prod/billing/database/password`.
   A table gives each part, whether it is optional and whether it accepts a slash:
   `env` and `project` are single segments and reject a slash; `prefix` and the
   name accept `/`; `env`, `project` and `prefix` are optional, the name is not.
   The caller always writes `/` when a name has levels, whatever the provider, so
   the code has one convention and nothing to rename when the provider changes;
   each provider converts
   the resolved name into what its service accepts. Show it with GCP, which drops
   the leading slash and joins with `_` (`prod_billing_database_password`), next to
   AWS, which keeps the name as is.
5. **Changing the name for one call** — `omit_env` / `omit_project` /
   `omit_prefix` drop a part, and `env` / `project` / `prefix` replace one.
   Omitting wins over replacing. Replacing `env` is never implicit and never a
   default, and the site must say why it is nonetheless offered: a service reading
   another environment is usually a defect, but the caller sometimes knows better
   than the process context.

   > Corrected on 2026-08-27. Until `secret-kernel-py` `0.1.0a3` and
   > `secret-kernel-js` `0.1.0-alpha.3`, this item said there was deliberately no
   > per-call `env` override at all, and the page said so in two places. That was
   > true of the Python API when this spec was written and never true of the
   > TypeScript one, which carried `env?` in `GetSecretBaseOptions` from the
   > start. Both now agree.
6. **Reading structured secrets** — default string; `JSON`; `KEY_VALUE` with
   `pair_separator` / `key_value_separator` / `keys` / `trim`; client-level
   conventions merged field by field by a per-call override.
7. **Providers** — the five, each with its distribution/package name, what it is
   for, and its typed options. AWS: `region`, `credentials`. GCP: `project_id`,
   `location`. Provider options never leak into the shared contract. The defaults
   are the kernel's: `region` is `us-east-1` without consulting `AWS_REGION`,
   `location` is `global`, `project_id` has none; a value passed as `None` or blank
   raises `SecretKernelConfigurationError` instead of taking the default.
8. **Caching** — off by default; keyed by resolved name; stores the decrypted
   string *before* parsing, so the same secret read as JSON and as text costs one
   provider call; failures are never cached; optional AES-256-GCM
   `encrypt_in_memory` with an honest statement of what it does and does not
   protect against.
9. **Errors** — the seven classes, the frozen `scrt_*` code each carries, and when
   each is raised. Three fields identify a failure: `name` (the class), `code` (the
   kernel's, frozen, the same string in both languages) and `provider_code` (the
   vendor's, only when the SDK gave one). Catch by class in-process, compare `code` at
   a boundary. Only not-found and permission are normalized, and their message names
   the requested secret plus `(full name: …)`; everything else keeps the SDK's message
   and gains `provider`, `secret_name`, `provider_code`, with the original in `cause`.

   > Corrected on 2026-10-07 for `0.1.0a7` / `0.1.0-alpha.7`. This item listed a
   > `ref` field, which neither implementation has ever had, and `code` as the
   > vendor's identifier, which moved to `provider_code`.
10. **Observability + bring your own provider** — `logger` as the only sink, one
    string per line, the stdlib logger as a drop-in; `provider_class`. There is no
    `debug` flag since `0.1.0a6` / `0.1.0-alpha.6`.
11. **Scope** — what the contract refuses to do (read-only, latest version only,
    cross-environment reads opt-in per call, provider options never leak,
    failures never cached), stated as a feature. Last before the changelog, per
    `lib-family/docs/paginas.md` §8.7; until 2026-10-07 it was item 2, right
    after the hero.
12. **Changelog** — short and factual, and the only place on the page that states
    a version number. It follows the code toggle, because the two implementations
    release independently. It should read as a short honest list, not a marketing
    timeline.

    The `#changelog` anchor is the `Changelog` URL in the published package
    metadata of `secret-kernel-py`, so the id is a public contract.
13. **Footer** — docs links (API reference, architecture decisions, structure,
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
- **Language of the prose**: EN ↔ PT-BR. In PT-BR a provider is a *cofre*, and the
  first mention names the code's `provider`, per `lib-family/docs/paginas.md` §8.11.

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
