# bronier-web — prototype

Live: **https://bronier-demo.185.103.164.237.nip.io/**

Next.js 15 + TypeScript + Tailwind, static export, served by nginx. White,
Macedonian, mobile-first.

## What works

* homepage, catalogue, four product pages, fence configurator
* **panel calculator** — real layout maths, never area ÷ area
* **wall visualizer** — canvas, real seams at real panel widths, scale figure
* **fence configurator** — sections, posts, corners, gates, drawn to the numbers
* colour swatches, quote summary handed to WhatsApp/Viber pre-filled
* sticky phone/Viber/WhatsApp bar on mobile

## The calculator is the point

`lib/calc.ts` lays panels out the way a fitter would and rounds up to whole
pieces. `node lib/calc.test.mjs` checks it against cases worked out by hand,
including the one the client warned about:

> a 4,20 × 2,70 m wall, 16,8 × 290 cm panel — **area division says 24 panels,
> the real answer is 25.** The test fails if the two ever agree.

Horizontal on the same wall is 34, which matches the client's own example.

## What is real and what is a placeholder

**Real** — every panel dimension, because he supplied them in writing, and all
the maths built on them.

**Placeholder, and flagged on screen** — prices, colour names, the phone
number, and the fence system's post spacing / board height / gate width. He
gave panel sizes for the wall products and nothing for the fence; a fence
calculator that invents a post spacing quietly quotes the wrong number of posts.

## Adding a product

One entry in `lib/products.ts` gets a page, a calculator and a visualizer.
Nothing else to write.

## Language

Every string is in `lib/i18n.ts`. No component holds a sentence, so `en`, `sq`,
`sr`, `bg`, `de` are new keys in that object.

**Headings are Lato, not Jost.** Jost has no glyph for `ј`, `ѕ` or `џ` — the
letters that make Macedonian Macedonian — so headings fell back to another face
mid-word. Jost stays in the logo, whose word is Latin.

## Deploying

`VPS_PASS=… ./deploy.sh` — builds, refuses to ship if the build failed, uploads.
