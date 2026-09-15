/**
 * One entry per product. Everything the calculator, the visualizer and the
 * product page need comes from here - add a product to this file and it gets a
 * page, a calculator and a visualizer with no other code written.
 *
 * WHAT IS REAL AND WHAT IS A PLACEHOLDER
 * The panel dimensions below are the ones the client gave in writing:
 *   WPC indoor   16.8 x 290 cm      WPC outdoor  21.9 x 290 cm
 *   PU stone     60 x 120 cm        Bamboo       122 x 290 cm
 * Those drive the maths and must not be edited casually.
 *
 * Every PRICE is a placeholder and is flagged as such on screen. So are the
 * colour names and the fence system's post spacing and board height - he gave
 * panel sizes for the wall products but nothing for the fence, and a fence
 * calculator that quietly invents a post spacing is a calculator that quotes
 * the wrong number of posts.
 */

export type Orientation = 'vertical' | 'horizontal'

export interface Colour {
  id: string
  /** Placeholder names until he sends his real range - see isPlaceholder. */
  name: string
  /** Base colour for the generated texture. */
  hex: string
  /** Grain colour drawn over it. */
  grain: string
  /**
   * A tile cut from HIS OWN product photograph (scripts/make_textures.py).
   * When present the visualizer uses the photo; the drawn colour stays as the
   * fallback and as the swatch tint while the image is still loading.
   */
  texture?: string
  /** How many slat periods are in that tile - see the note in texture.ts. */
  slatsPerTile?: number
}

/**
 * COLOURS ARE NOT SETTLED. His words: "we will fix the colors at the end. I
 * just wanted you to see the shape." So everything below is here for its
 * SHAPE - the profile of the board, the face of the stone - and the range and
 * the names get replaced when he sends them. The site says so on screen.
 */
export const COLOURS_ARE_PROVISIONAL = true

export interface Product {
  slug: string
  name: string
  short: string
  category: 'enterier' | 'eksterier' | 'ograda'
  kind: 'wall_panel' | 'fence'
  /**
   * Are the joints between pieces visible?
   *
   * For a slat panel, yes - the joint is the product. For PU stone, no: his
   * photo shows torn, interlocking edges, and the whole point of the sheet is
   * that you cannot see where one ends. Drawing a 60 x 120 grid over it was
   * showing a joint the customer will never see.
   */
  seamless?: boolean
  /** metres */
  panelWidth: number
  panelLength: number
  /** m2 covered by one panel, derived - never typed in by hand */
  coverage: number
  pricePerPiece: number
  priceIsPlaceholder: boolean
  orientations: Orientation[]
  /**
   * How many slats are milled into ONE panel.
   *
   * This is what was wrong: the photo tile was laid down once per panel, and
   * the tile holds 5-8 slat periods, so a 4,20 m wall drew about 200 strips
   * where the customer buys 25 pieces. The panel stopped being visible as a
   * piece at all.
   *
   * ASSUMPTION, flagged on screen and in writing: 4 slats across 16,8 cm is a
   * 4,2 cm slat, which is an ordinary WPC slat. One number to change per
   * product once he confirms it.
   */
  slatsPerPanel?: number
  defaultWaste: number
  colours: Colour[]
  bullets: string[]
}

// The SITE is black and white now, but a wall panel is not: these are the
// finishes a customer picks between, and showing them all in grey would make
// the visualizer useless. The interface is neutral; the material is not.
// Every name is still a placeholder until he sends his real range.
// These are cut from HIS OWN product photographs, not stock pictures. A stock
// photo of somebody else's oak slat wall would look better and would be a lie -
// a customer ordering from it gets a different product.
//
// The names say what the photograph IS. Nothing here invents a finish name he
// has never used, and the two that are still drawn rather than photographed say
// so with "(примерок)".
// Cut from the photographs he sent of the actual boards (IMG_3133, IMG_3152),
// rectified by scripts/rectify_panel.py. One tile = ONE PANEL, and both photos
// show FOUR slats - counted off the cut end, where the extrusion's four hollow
// chambers are visible, not guessed.
const REAL_INDOOR: Colour = {
  id: 'wpc-indoor-anthracite', name: 'Антрацит', hex: '#4a4c4d', grain: '#333536',
  texture: '/textures/wpc-indoor-anthracite.jpg', slatsPerTile: 4,
}
const REAL_OUTDOOR: Colour = {
  id: 'wpc-outdoor-charcoal', name: 'Антрацит', hex: '#3b4045', grain: '#282c30',
  texture: '/textures/wpc-outdoor-charcoal.jpg', slatsPerTile: 4,
}

const OAKS: Colour[] = [
  { id: 'oak', name: 'Даб', hex: '#835c3e', grain: '#a97e4c',
    texture: '/textures/oak.jpg', slatsPerTile: 8 },
  { id: 'natural', name: 'Натур', hex: '#a38566', grain: '#b3915f',
    texture: '/textures/natural.jpg', slatsPerTile: 8 },
  { id: 'anthracite', name: 'Антрацит', hex: '#4f4c49', grain: '#2b2e30',
    texture: '/textures/anthracite.jpg', slatsPerTile: 8 },
  { id: 'terracotta', name: 'Теракота', hex: '#b4713d', grain: '#8a4a2a',
    texture: '/textures/terracotta.jpg', slatsPerTile: 2 },
  { id: 'light-oak', name: 'Светол даб', hex: '#d99957', grain: '#c08a3e',
    texture: '/textures/light-oak.jpg', slatsPerTile: 3 },
  { id: 'black', name: 'Црна (примерок)', hex: '#222220', grain: '#141413' },
  { id: 'white', name: 'Бела (примерок)', hex: '#ece9e4', grain: '#d8d4cd' },
]

const STONES: Colour[] = [
  // From his photo of the real sheet (IMG_3168): a continuous rock face with
  // torn, irregular edges - which is why PU stone is drawn seamless.
  { id: 'pu-stone-face', name: 'Црн камен', hex: '#3f474d', grain: '#2b3237',
    texture: '/textures/pu-stone-face.jpg' },
  { id: 'stone-white', name: 'Бел камен', hex: '#e2e1e1', grain: '#bdb4a5',
    texture: '/textures/stone-white.jpg' },
  { id: 'stone-grey', name: 'Сив камен', hex: '#6b6c6d', grain: '#87857f',
    texture: '/textures/stone-grey.jpg' },
  { id: 'dark-stone', name: 'Темен камен (примерок)', hex: '#5d5a56', grain: '#464340' },
]

const BAMBOO: Colour[] = [
  { id: 'natural', name: 'Натур бамбус (примерок)', hex: '#d2b183', grain: '#b3915f' },
  { id: 'carbon', name: 'Карбон бамбус (примерок)', hex: '#8a6a49', grain: '#6c5036' },
]

function coverage(w: number, l: number) {
  return Math.round(w * l * 10000) / 10000
}

export const PRODUCTS: Product[] = [
  {
    slug: 'wpc-paneli-enterier',
    name: 'WPC панели за ентериер',
    short: 'Ламелни ѕидни панели за внатрешни простори.',
    category: 'enterier',
    kind: 'wall_panel',
    panelWidth: 0.168,
    panelLength: 2.9,
    coverage: coverage(0.168, 2.9),   // 0.4872 m2 - matches the brief
    pricePerPiece: 1200,
    priceIsPlaceholder: true,
    orientations: ['vertical', 'horizontal'],
    slatsPerPanel: 4,                 // counted off his photo of the real board
    defaultWaste: 10,
    colours: [REAL_INDOOR, ...OAKS],
    bullets: [
      'Димензии: 16,8 × 290 см',
      'Покриеност: 0,4872 m² по панел',
      'Монтажа: вертикална или хоризонтална',
      'За дневни соби, спални, канцеларии и угостителски објекти',
    ],
  },
  {
    slug: 'wpc-paneli-fasada',
    name: 'WPC фасадни панели',
    short: 'Надворешни панели отпорни на сонце, дожд и влага.',
    category: 'eksterier',
    kind: 'wall_panel',
    panelWidth: 0.219,
    panelLength: 2.9,
    coverage: coverage(0.219, 2.9),
    pricePerPiece: 1800,
    priceIsPlaceholder: true,
    orientations: ['vertical', 'horizontal'],
    slatsPerPanel: 4,                 // counted off his photo of the real board
    defaultWaste: 10,
    colours: [REAL_OUTDOOR, ...OAKS],
    bullets: [
      'Димензии: 21,9 × 290 см',
      'Покриеност: 0,6351 m² по панел',
      'За фасади, тераси и надворешни ѕидови',
    ],
  },
  {
    slug: 'pu-kamen',
    name: 'PU камен',
    short: 'Полиуретански камен - изглед на природен камен, мала тежина.',
    category: 'enterier',
    kind: 'wall_panel',
    seamless: true,
    panelWidth: 0.6,
    panelLength: 1.2,
    coverage: coverage(0.6, 1.2),
    pricePerPiece: 1800,
    priceIsPlaceholder: true,
    orientations: ['horizontal', 'vertical'],
    defaultWaste: 10,
    colours: STONES,
    bullets: [
      'Димензии: 60 × 120 см',
      'Покриеност: 0,72 m² по плоча',
      'Лесна монтажа, термоизолиран материјал',
    ],
  },
  {
    slug: 'bambusov-furnir',
    name: 'Бамбусов фурнир',
    short: 'Големи табли бамбусов фурнир за ѕидови и плафони.',
    category: 'enterier',
    kind: 'wall_panel',
    panelWidth: 1.22,
    panelLength: 2.9,
    coverage: coverage(1.22, 2.9),
    pricePerPiece: 6500,
    priceIsPlaceholder: true,
    orientations: ['vertical', 'horizontal'],
    defaultWaste: 10,
    colours: BAMBOO,
    bullets: [
      'Димензии: 122 × 290 см',
      'Покриеност: 3,538 m² по табла',
      'За големи површини со малку споеви',
    ],
  },
]

/**
 * The fence system. Every number here is a PLACEHOLDER: the client supplied
 * panel sizes for the wall products and nothing for the fence, and guessing a
 * post spacing quietly changes how many posts a customer is told to buy.
 * Confirm these five numbers and the calculator is finished.
 */
export const FENCE = {
  slug: 'wpc-ograda',
  name: 'WPC ограда',
  short: 'Комплетен систем за надворешна WPC ограда.',
  /** centre-to-centre distance between posts, metres */
  postSpacing: 2.0,
  /** height of one fence board, metres */
  boardHeight: 0.15,
  /** width taken out of the run by one gate, metres */
  gateWidth: 1.2,
  /** the real board face, cut from his photo IMG_3171 - shape, not final colour */
  boardTexture: '/textures/wpc-fence-board.jpg',
  pricePerBoard: 700,
  pricePerPost: 1500,
  pricePerGate: 12000,
  installPricePerMetre: 900,
  isPlaceholder: true,
  colours: OAKS,
}

export function bySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug)
}
