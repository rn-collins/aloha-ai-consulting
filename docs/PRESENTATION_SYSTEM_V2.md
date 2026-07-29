# Aloha AI Presentation System V2

## Source of truth

The approved public direction is **bright editorial × digital playground**.
The public site has one presentation authority:

- `/aloha-ds.css` — global tokens and primitives
- `/site-shell.css` — navigation and footer only
- `/page-system.css` — approved page-family compositions
- `/universal-sections.css` — shared content-section compositions

Route folders must not contain copied design-system stylesheets. Public pages
must not add independent palettes or legacy inline presentation rules.

## Approved palette

| Role | Value |
|---|---|
| Ink | `#111111` |
| Paper | `#FFFFFF` |
| Soft violet | `#F3F0FF` |
| Acid | `#D9FF43` |
| Violet | `#7967FF` |
| Hot pink | `#FF4F91` |
| Coral | `#FF684C` |
| Pool blue | `#52D8FF` |
| Sun yellow | `#FFD84D` |

## Approved visual grammar

- High-contrast editorial typography
- Square or near-square structural edges
- Black keylines
- Hard offset shadows
- Bright accent surfaces used intentionally
- Motion that reveals hierarchy or state
- White or soft-violet neutral surfaces

## Forbidden legacy fingerprints

- Green or teal typography used as the default accent
- Cream or beige cards
- Soft rounded white cards with diffuse shadows
- Green gradients
- Mint badges and green status pills
- Route-local copies of the former `aloha-ds.css`
- The former `university/university.css`
- Inline route palettes capable of overriding the shared system

## Migration rule

A route is not migrated because a newer stylesheet visually overrides the old
one. It is migrated only when its rendered template uses the shared V2
primitives and the retired presentation source can no longer render.
