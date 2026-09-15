/**
 * Checks the numbers a customer acts on. Run: node lib/calc.test.mjs
 * Each case is worked out by hand in the comment - a test that just re-runs the
 * implementation would agree with any bug the implementation has.
 */
import { panelsFor, fenceFor } from './calc.ts.mjs'
let fails = []
const eq = (got, want, what) => { if (got !== want) fails.push(`${what}: got ${got}, want ${want}`) }

// --- the client's own wall and panel -------------------------------------
// 4.20 / 0.168 = exactly 25 columns. 2.70 < 2.90 so one panel per column.
let v = panelsFor(4.2, 2.7, 0.168, 2.9, 'vertical', 10)
eq(v.required, 25, 'indoor 4.2x2.7 vertical')
eq(v.recommended, 28, 'indoor vertical +10% waste')   // ceil(25*1.1)=28
// Horizontal: rows = ceil(2.70/0.168) = ceil(16.07) = 17; per row = ceil(4.2/2.9) = 2
eq(panelsFor(4.2, 2.7, 0.168, 2.9, 'horizontal', 10).required, 34, 'indoor horizontal')

// AREA DIVISION WOULD SAY 24 - the bug the client explicitly warned against.
const areaDivision = Math.ceil((4.2 * 2.7) / (0.168 * 2.9))
eq(areaDivision, 24, 'sanity: area division gives 24')
if (areaDivision === v.required) fails.push('layout maths equals area division - it is not doing layout')

// --- never a fractional panel, ever --------------------------------------
for (const [w, h] of [[3.3, 2.45], [5.15, 3.1], [0.4, 0.9], [12.7, 2.8]]) {
  const r = panelsFor(w, h, 0.168, 2.9, 'vertical', 5)
  if (!Number.isInteger(r.required) || !Number.isInteger(r.recommended))
    fails.push(`fractional panel at ${w}x${h}`)
  if (r.recommended < r.required) fails.push(`recommended < required at ${w}x${h}`)
  if (r.coveredArea < r.wallArea) fails.push(`covers less than the wall at ${w}x${h}`)
}

// --- a wall taller than one panel needs two per column --------------------
const tall = panelsFor(2.0, 5.0, 0.168, 2.9, 'vertical', 0)
eq(tall.required, Math.ceil(2.0 / 0.168) * 2, 'tall wall needs 2 per column')
if (!tall.note) fails.push('tall wall gives no seam warning')

// --- horizontal on a narrow wall must warn about offcut -------------------
if (!panelsFor(1.5, 2.6, 0.168, 2.9, 'horizontal', 10).note)
  fails.push('narrow wall horizontal gives no offcut warning')

// --- other products, dimensions from the brief ----------------------------
eq(panelsFor(4.2, 2.7, 0.219, 2.9, 'vertical', 0).required, Math.ceil(4.2 / 0.219), 'facade vertical')
eq(panelsFor(3.0, 2.4, 0.6, 1.2, 'horizontal', 0).required,
   Math.ceil(2.4 / 0.6) * Math.ceil(3.0 / 1.2), 'pu stone')

// --- fence ----------------------------------------------------------------
// 25 m, one 1.2 m gate -> 23.8 m of panels; 23.8 / 2.0 -> 12 sections.
// 1.8 m high / 0.15 board -> 12 boards per section -> 144 boards.
// posts: 12 + 1 + 0 corners + 1 gate = 14.
let f = fenceFor(25, 1.8, 0, 1, 2.0, 0.15, 1.2)
eq(f.sections, 12, 'fence sections'); eq(f.boardsPerSection, 12, 'boards per section')
eq(f.boards, 144, 'fence boards'); eq(f.posts, 14, 'fence posts')
// corners add a post each
eq(fenceFor(25, 1.8, 2, 1, 2.0, 0.15, 1.2).posts, 16, 'corners add posts')
// no gates -> full run
eq(fenceFor(20, 1.5, 0, 0, 2.0, 0.15, 1.2).sections, 10, 'fence no gates')
// gates eating the whole run must not go negative
const allGate = fenceFor(2, 1.8, 0, 5, 2.0, 0.15, 1.2)
if (allGate.panelRun < 0 || allGate.sections < 0) fails.push('fence goes negative')
if (!allGate.note) fails.push('no warning when gates eat the run')

if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1) }
console.log('all calculator tests pass')
