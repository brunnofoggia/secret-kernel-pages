# Design direction — decision record

Status: **decided — A, palette A2 (Prussian & Sky)**

Three directions were built as real, rendered HTML from one shared input
(`design-spec.md`) and shown to the user with screenshots. No implementation
started until a direction was chosen.

The drafts themselves now live in the **lib-family** repository, under
`pages/directions/` and `pages/palettes/`, because they span the four sites the
family will have rather than this one. This file keeps the decision; the artefacts
it refers to are one repository over.

## Shown on 2026-08-27

| # | Direction | Logic | Motif | Draft | Screenshot |
| --- | --- | --- | --- | --- | --- |
| A | Dark Warm Editorial | Style roulette — `date +%S` = 51, `51 % 20 + 1` = **12**, which is *Warm Editorial* (Anthropic / Penguin lineage) | The resolved path | `lib-family/pages/directions/a-warm-editorial.html` | `tmp/shots/a-warm-editorial.png` |
| B | Docs Split | Real-world benchmark — **Stripe Docs**, whose two-column prose/code layout with a persistent language switcher is the reference for this exact problem | One contract, five backends | `lib-family/pages/directions/b-stripe-docs.html` | `tmp/shots/b-stripe-docs.png` |
| C | The Unseen | Best-designer — **Kenya Hara**, whose 白 (emptiness as vessel) is inverted into darkness as the vessel of a value never displayed | The masked value | `lib-family/pages/directions/c-hara-void.html` | `tmp/shots/c-hara-void.png` |

### Roulette adaptation, stated honestly

Style 12 is a **cream-paper** style. Dark mode is a hard requirement from the user,
so the direction inverts the style's *essence* — publication typography, serif ×
sans, terracotta accent, generous measure, restraint — onto a warm ink-black
ground rather than its background colour. The warm black is also a deliberate move
away from the uniform blue-black `#0D1117` that dominates developer marketing.

### Structural difference between the three

Not a reskin. The skeletons differ:

- **A** — single left-aligned column at a book measure, hanging section numbers,
  editorial marginalia in the right margin.
- **B** — sticky rail plus repeated prose-left / code-right rows, code visible on
  the first screen, an angled gradient band in the hero.
- **C** — centred single axis, very large vertical intervals, hairline dividers,
  no code above the fold.

## Decision

**Direction A, with the A2 palette.** The user's own words, in order:

1. `"gostei do A, mas nao gosto desse tom de cor referenciando a anthropic.
   gostaria algo usando azul bem escuro"`
2. `"A2"`

So: direction A's skeleton and motif are kept exactly; the terracotta-on-warm-black
palette is replaced by prussian blue with a pale sky accent.

### Concern raised, and the user's call

A2 was flagged as the variant **closest to the GitHub-dark cliché** the spec
forbids, since a pale blue accent on a dark blue ground is one step from
`#0D1117` + neon. The user chose it anyway, which settles it. The guardrails that
keep it out stay non-negotiable in the implementation:

- the ground is chromatic prussian `#08111F`, not desaturated blue-grey;
- the sky accent `#79B8F0` stays desaturated — no neon, no `text-shadow` glow,
  no `filter: blur()` halo anywhere;
- separation is carried by 1px rules only;
- the serif display and the editorial marginalia stay, because they are what make
  the page unattributable to the cliché regardless of hue.

### Palette assignment for the rest of the family

Also decided in this session, for pages that do not exist yet — see
`lib-family/docs/paletas.md`:

| Library | Palette |
| --- | --- |
| `secret-kernel` | A2 Prussian & Sky |
| `storage-kernel` | A1 Navy & Brass |
| `ai-llm-kernel` | A3 Midnight & Jade |
| `edd-kernel` | A4 Oxblood & Rose |

### Adopted from direction B

Per the recommendation the user accepted implicitly by choosing A: the dense lower
sections (install, providers, errors, cache) use B's two-column prose/code rows
rather than a single book measure, which holds reference-heavy content better.
