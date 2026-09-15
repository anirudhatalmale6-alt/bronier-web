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
}

export interface Product {
  slug: string
  name: string
  short: string
  category: 'enterier' | 'eksterier' | 'ograda'
  kind: 'wall_panel' | 'fence'
  /** metres */
  panelWidth: number
  panelLength: number
  /** m2 covered by one panel, derived - never typed in by hand */
  coverage: number
  pricePerPiece: number
  priceIsPlaceholder: boolean
  orientations: Orientation[]
  defaultWaste: number
  colours: Colour[]
  bullets: string[]
}

const OAKS: Colour[] = [
  { id: 'oak', name: 'Даб (примерок)', hex: '#c69a63', grain: '#a97e4c' },
  { id: 'walnut', name: 'Орев (примерок)', hex: '#7d5336', grain: '#5f3d27' },
  { id: 'anthracite', name: 'Антрацит (примерок)', hex: '#3c3f41', grain: '#2b2e30' },
  { id: 'grey', name: 'Сива (примерок)', hex: '#9b9b97', grain: '#82827e' },
  { id: 'white', name: 'Бела (примерок)', hex: '#ece9e4', grain: '#d8d4cd' },
]

const STONES: Colour[] = [
  { id: 'cream', name: 'Крем камен (примерок)', hex: '#d9d2c6', grain: '#bdb4a5' },
  { id: 'grey-stone', name: 'Сив камен (примерок)', hex: '#a3a19c', grain: '#87857f' },
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
    defaultWaste: 10,
    colours: OAKS,
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
    defaultWaste: 10,
    colours: OAKS,
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
