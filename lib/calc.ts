/**
 * The maths. Kept away from the UI so it can be checked on its own, which is
 * the whole point - this is the part a customer acts on.
 *
 * The rule the client set: "Do NOT simply divide the wall area by panel area
 * if that would produce an inaccurate result." So nothing here divides area by
 * area. Panels are laid out in whole pieces across a wall, exactly as a fitter
 * would, and every count is rounded UP to a whole panel.
 *
 * Why area division is wrong, in his own numbers: a 4,20 x 2,70 m wall is
 * 11,34 m² and one indoor panel covers 0,4872 m², so area division says 24
 * panels. Laid vertically the wall needs 25 columns of one panel - 4,20 / 0,168
 * is exactly 25 - and the real answer is 25. Area division is short by one
 * whole panel before any waste is added.
 */

export interface PanelResult {
  orientation: 'vertical' | 'horizontal'
  /** whole panels needed to cover the wall, before waste */
  required: number
  /** required plus the waste percentage, rounded up */
  recommended: number
  /** how the panels sit: columns x panels per column, or rows x per row */
  layout: string
  /** m2 the wall actually is */
  wallArea: number
  /** m2 the ordered panels cover */
  coveredArea: number
  /** m2 thrown away as offcuts, before the waste percentage */
  offcutArea: number
  /** a plain-language warning when this orientation wastes a lot */
  note?: string
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function panelsFor(
  wallWidth: number,
  wallHeight: number,
  panelWidth: number,
  panelLength: number,
  orientation: 'vertical' | 'horizontal',
  wastePercent: number,
): PanelResult {
  const w = Math.max(0, wallWidth)
  const h = Math.max(0, wallHeight)
  let required: number
  let layout: string
  let note: string | undefined

  if (orientation === 'vertical') {
    // Panels stand upright. Each column is panelWidth across, and a column
    // needs more than one panel only when the wall is taller than one panel.
    const columns = Math.ceil(w / panelWidth)
    const perColumn = Math.ceil(h / panelLength)
    required = columns * perColumn
    layout = `${columns} колони × ${perColumn} панел${perColumn === 1 ? '' : 'и'}`
    if (h > panelLength) {
      note = `Ѕидот е повисок од должината на панелот (${panelLength.toFixed(2)} m), ` +
        `па секоја колона бара ${perColumn} панели со спој на средина.`
    }
  } else {
    // Panels lie flat. Each row is panelWidth tall and runs the wall's width.
    const rows = Math.ceil(h / panelWidth)
    const perRow = Math.ceil(w / panelLength)
    required = rows * perRow
    layout = `${rows} редови × ${perRow} панел${perRow === 1 ? '' : 'и'}`
    if (w < panelLength) {
      const lost = round2((panelLength - w) / panelLength * 100)
      note = `Ѕидот е пократок од панелот (${panelLength.toFixed(2)} m), ` +
        `па се отсекува околу ${lost}% од секој панел. Вертикална монтажа е поекономична.`
    }
  }

  const wallArea = round2(w * h)
  const coveredArea = round2(required * panelWidth * panelLength)
  const offcutArea = round2(Math.max(0, coveredArea - wallArea))
  const recommended = Math.ceil(required * (1 + wastePercent / 100))

  return { orientation, required, recommended, layout, wallArea, coveredArea, offcutArea, note }
}

/** Both orientations at once, so the page can show which one wastes less. */
export function compareOrientations(
  wallWidth: number, wallHeight: number, panelWidth: number,
  panelLength: number, wastePercent: number,
) {
  return {
    vertical: panelsFor(wallWidth, wallHeight, panelWidth, panelLength, 'vertical', wastePercent),
    horizontal: panelsFor(wallWidth, wallHeight, panelWidth, panelLength, 'horizontal', wastePercent),
  }
}

export interface FenceResult {
  /** run left after the gates are taken out */
  panelRun: number
  sections: number
  boardsPerSection: number
  boards: number
  posts: number
  endPosts: number
  cornerPosts: number
  linePosts: number
  gates: number
  note?: string
}

export function fenceFor(
  length: number, height: number, corners: number, gates: number,
  postSpacing: number, boardHeight: number, gateWidth: number,
): FenceResult {
  const len = Math.max(0, length)
  const g = Math.max(0, Math.floor(gates))
  const c = Math.max(0, Math.floor(corners))

  // Gates occupy part of the run and are not filled with fence boards.
  const panelRun = Math.max(0, len - g * gateWidth)
  const sections = Math.ceil(panelRun / postSpacing)
  const boardsPerSection = Math.ceil(Math.max(0, height) / boardHeight)
  const boards = sections * boardsPerSection

  // A straight run of N sections needs N+1 posts. Each corner adds a post
  // where two runs meet, and each gate needs a post on both sides - one of
  // which is already there as a line post, so a gate adds one.
  const endPosts = len > 0 ? 2 : 0
  const cornerPosts = c
  const gatePosts = g
  const posts = sections > 0 ? sections + 1 + cornerPosts + gatePosts : 0
  const linePosts = Math.max(0, posts - endPosts - cornerPosts - gatePosts)

  const note = panelRun === 0 && len > 0
    ? 'Портите ја зафаќаат целата должина - нема простор за панели.'
    : undefined

  return { panelRun: round2(panelRun), sections, boardsPerSection, boards, posts,
    endPosts, cornerPosts, linePosts, gates: g, note }
}

export function mkd(n: number) {
  return new Intl.NumberFormat('mk-MK', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' ден'
}
