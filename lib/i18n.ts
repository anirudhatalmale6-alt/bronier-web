/**
 * Every visible string, in one place, keyed by language. Macedonian is the
 * site's language; the shape is what matters - adding `en`, `sq`, `sr`, `bg`
 * or `de` later is a new key in this object and nothing else, because no
 * component contains a literal sentence.
 */
export const LANGS = ['mk'] as const
export type Lang = typeof LANGS[number]

export const t = {
  mk: {
    brand: 'bronier',
    navHome: 'Почетна', navProducts: 'Производи', navFence: 'Огради',
    navVisualizer: 'Визуелизатор', navContact: 'Контакт',
    heroTitle: 'Простори што раскажуваат приказна',
    heroText: 'Современи WPC панели, фасади и декоративни решенија за ентериер и екстериер.',
    heroCta: 'Разгледај производи', heroCta2: 'Пресметај го проектот',
    categories: 'Категории',
    seeBeforeTitle: 'Види пред да купиш',
    seeBeforeText: 'Избери производ, избери дизајн и види како ќе изгледа на твојот ѕид.',
    seeBeforeCta: 'Отвори визуелизатор',
    calcTitle: 'Колку материјал ти треба?',
    calcText: 'Избери производ, внеси мерки и добиј количина и проценета цена.',
    calcCta: 'Пресметај сега',
    whyTitle: 'Зошто Bronier',
    why: ['Современи дизајни', 'Голем избор', 'Квалитетни материјали',
          'Брза испорака', 'Стручна поддршка', 'Можност за монтажа'],
    calcHeading: 'Пресметај го твојот проект',
    wallWidth: 'Ширина на ѕидот (m)', wallHeight: 'Висина на ѕидот (m)',
    orientation: 'Монтажа', vertical: 'Вертикална', horizontal: 'Хоризонтална',
    waste: 'Резерва за кроење', required: 'Потребни', recommended: 'Препорачано за нарачка',
    pieces: 'парчиња', wallArea: 'Површина на ѕидот', covered: 'Покриено со панели',
    layout: 'Распоред', estTotal: 'Проценета вредност',
    priceNote: 'Цените се примерок - вистинските цени се внесуваат подоцна.',
    dimsNote: 'Димензиите на панелите се вистинските од производителот.',
    chooseColour: 'Избери дизајн', preview: 'Преглед на ѕид',
    previewFence: 'Преглед на оградата',
    vizTitle: 'Види го на твојот ѕид',
    vizLead: 'Качи фотографија од твојата просторија, обележи го ѕидот и види како изгледа со панелите.',
    vizUpload: 'Качи фотографија од твојата просторија',
    vizUploadHint: 'Сликај го ѕидот што сакаш да го обложиш. Фотографијата останува на твојот телефон - не се качува никаде.',
    vizChoose: 'Избери фотографија',
    vizDragHint: 'Повлечи ги четирите точки за да ги совпаднеш со аглите на ѕидот.',
    vizBefore: 'Прикажи оригинал', vizAfter: 'Прикажи со панели',
    vizSave: 'Зачувај слика', vizAnother: 'Друга фотографија',
    vizLight: 'Светлина од просторијата', vizLightHint: 'Повеќе светлина = повеќе од сенките на оригиналната слика.',
    vizPrivacy: 'Фотографијата се обработува во твојот прелистувач и не се испраќа на сервер.',
    slatsAcross: 'панели по ширина на ѕидот',
    slatsPerPanel: 'Ламели во еден панел: {n} (претпоставка - потврди ја)',
    onePiece: 'Еден панел во вистински однос',
    provisionalColours: 'Формата е од вистинските производи. Палетата на бои сè уште не е конечна.',
    fenceHeading: 'Конфигуратор за ограда',
    fenceLength: 'Должина на оградата (m)', fenceHeight: 'Висина (m)',
    corners: 'Агли', gates: 'Порти', install: 'Со монтажа',
    sections: 'Полиња', boards: 'Летви', posts: 'Столбови',
    endPosts: 'Крајни', cornerPosts: 'Аголни', linePosts: 'Средни',
    fencePlaceholder: 'Растојанието меѓу столбови и висината на летвата се примерок - потврди ги за точна пресметка.',
    quoteTitle: 'Сакаш точна понуда?',
    quoteText: 'Испрати ни го проектот и ќе ти вратиме точна цена.',
    name: 'Име', phone: 'Телефон', email: 'Е-пошта', city: 'Град',
    sendViber: 'Испрати на Viber', sendWhatsapp: 'Испрати на WhatsApp',
    call: 'Јави се', yourProject: 'Твојот проект',
    product: 'Производ', colour: 'Боја', wall: 'Ѕид',
    prototypeBanner: 'Прототип - цените, боите и фотографиите се примерок',
    back: 'Назад кон производи',
  },
} as const

export const L = t.mk
