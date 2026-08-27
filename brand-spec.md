# Brand assets — Secret Kernel website

Secret Kernel has no logo, wordmark or palette of its own. There is nothing to
extract: the two repositories carry only source, docs and an MIT `LICENSE`. So the
site's own identity is designed here rather than recovered, and this file records
only the **third-party marks the page names** and where each came from.

## Third-party marks in use

Identification only — every mark stays byte-for-byte from its official source and
is stripped of nothing but its hardcoded `fill`, so the page can recolor it with
`currentColor`. No mark is redrawn, restyled or recombined.

| Mark | Named in | Source | File |
| --- | --- | --- | --- |
| Amazon Web Services | `aws-parameter-store`, `aws-secrets-manager` | svgl.app (official AWS wordmark, dark variant) | `src/assets/logos/aws.svg` |
| Google Cloud | `gcp-parameter-manager`, `gcp-secret-manager` | Simple Icons CDN | `src/assets/logos/googlecloud.svg` |
| Python | the Python implementation and code toggle | Simple Icons CDN | `src/assets/logos/python.svg` |
| TypeScript | the TypeScript implementation and code toggle | Simple Icons CDN | `src/assets/logos/typescript.svg` |
| PyPI | where `secret-kernel-*` is published | Simple Icons CDN | `src/assets/logos/pypi.svg` |
| npm | where `@secret-kernel/*` is **not yet** published | Simple Icons CDN | `src/assets/logos/npm.svg` |
| GitHub | source links | Simple Icons CDN | `src/assets/logos/github.svg` |

`scripts/build_logo_sprite.py` folds all seven into one inline `<symbol>` sprite at
`src/assets/logo-sprite.html`, which is pasted into the page. Nothing is referenced
by URL, so the page has no external image dependency and cannot render with broken
marks if it is moved.

## Facts the page asserts

Verified against the repositories on 2026-08-27, not from memory:

- `secret-kernel-py` — nine distributions at `0.1.0a2`, released 2026-08-25.
- `secret-kernel-js` — nine packages at `0.1.0-alpha.1`, **not published to npm**.
  Changesets is in pre-release mode (`.changeset/pre.json` present).
- Providers: `in-memory`, `aws-parameter-store`, `aws-secrets-manager`,
  `gcp-parameter-manager`, `gcp-secret-manager`.
- Python 3.12+; the TypeScript packages ship ESM with declarations.

No download count, star count, adoption claim, testimonial or benchmark appears on
the site, because none of those exist for a `0.1.0a` library.

## Identity designed here

Not a padlock, keyhole, shield or vault — those are the stock iconography of
secrets and say nothing about this library. The identity comes from the contract
itself, and each direction takes a different part of it:

- the **resolved path**, `env / project / prefix / name`
- the **narrow waist**: one contract above five providers
- the **masked value**: read, never displayed
