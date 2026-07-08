// Новый товар: добавьте объект сюда и создайте product/<slug>/index.html (как у fluid-signet).
window.PRODUCTS = [
  {
    slug: "fluid-signet",
    name: "Кольцо Fluid Signet",
    price: "3 500 ₽",
    category: "Металлический сплав",
    image: "assets/catalog-fluid-signet.png",
    video: "videos/fluid-signet.mp4",
    gallery: ["assets/fluid-signet-lifestyle.png"],
    description:
      "Скульптурный сигнет с мягким объемом и плавным рельефом. Украшение создано для спокойного ежедневного ношения и тактильного контакта с формой.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    edition: "Малые партии",
    size: "Под заказ",
  },
  {
    slug: "shield",
    name: "Кольцо Shield",
    price: "5 200 ₽",
    category: "Металлический сплав",
    image: "assets/catalog-shield-ring.png",
    video: "videos/shield.mp4",
    gallery: ["assets/shield-lifestyle.png"],
    description:
      "Широкий металлический щит с цельным характером и выразительной геометрией. Вещь с акцентом на силу силуэта и ощущение веса на руке.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    edition: "Лимитированный выпуск",
    size: "16-20",
  },
  {
    slug: "faith-signet",
    variantLabel: "Pale blue",
    variantColor: "#7ec8d9",
    name: "Кольцо Dragon Pale blue",
    price: "5 600 ₽",
    category: "Металлический сплав · фианит голубой",
    image: "assets/catalog-faith-ring.png",
    video: "videos/faith-signet.mp4",
    gallery: ["assets/faith-signet-lifestyle.png"],
    description:
      "Фактурное сигнетное кольцо с фианитом в центре композиции. Контраст чеканки и гладкой оправы делает форму глубже и выразительнее.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит голубой",
    edition: "Малые партии",
    size: "Под заказ",
  },
  {
    slug: "astris-drop",
    variantLabel: "Pale blue",
    variantColor: "#7ec8d9",
    name: "Кулон Dragon Pale blue",
    price: "4 900 ₽",
    category: "Металлический сплав · фианит голубой",
    image: "assets/catalog-astris-drop.png",
    imageAlt:
      "Кулон Dragon Pale blue — металлический кулон с чеканкой и круглым фианитом на цепи.",
    gallery: ["assets/astris-drop-lifestyle.png"],
    description:
      "Металлический кулон с фактурной чеканкой и круглым фианитом в центре. Контраст рельефной поверхности и гладкой оправы делает форму выразительной и живой.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит голубой",
    edition: "Малые партии",
  },
  {
    slug: "soul-free",
    name: "Кольцо Soul Free",
    price: "3 500 ₽",
    category: "Металлический сплав · сигнет",
    image: "assets/catalog-strength-soul-free.png",
    video: "videos/soul-free.mp4",
    gallery: ["assets/soul-free-lifestyle.png"],
    description:
      "Сигнет с гравировкой Soul / Free как личный знак и ежедневное напоминание. Спокойная форма и чистая плоскость подчеркивают смысловую деталь.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    edition: "Малые партии",
    size: "17-21",
  },
  {
    slug: "old-chrysolite",
    name: "Кольцо «old» с фианитом",
    price: "8 000 ₽",
    category: "Металлический сплав · фианит зелёный",
    image: "assets/catalog-old-chrysolite.png",
    imageAlt:
      "Кольцо «old» — металлическое кольцо с открытой рамой, чеканкой и двумя фианитами.",
    video: "videos/old-chrysolite.mp4",
    gallery: ["assets/old-chrysolite-lifestyle.png"],
    description:
      "Открытая рама с фактурной чеканкой и двумя фианитами по краям. Контраст гладкой внутренней поверхности и рельефа снаружи делает форму лёгкой и выразительной.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит зелёный",
    edition: "Малые партии",
    size: "Под заказ",
  },
  {
    slug: "old-phalanx",
    name: "Кольцо «old» на фалангу",
    price: "8 000 ₽",
    category: "Металлический сплав · фианит розовый",
    image: "assets/catalog-old-phalanx-ring.png",
    imageAlt:
      "Кольцо «old» на фалангу — металлическое кольцо с чеканкой и розовым фианитом.",
    video: "videos/old-phalanx.mp4",
    gallery: ["assets/old-phalanx-lifestyle.png"],
    description:
      "Фаланговое кольцо с фактурной чеканкой и розовым фианитом в центре. Открытая форма и рельефная поверхность подчёркивают характер линии old.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит розовый",
    edition: "Малые партии",
    size: "Под заказ",
  },
  {
    slug: "star-orange",
    variantLabel: "Orange",
    variantColor: "#e8a04a",
    name: "Кольцо Star Orange",
    price: "5 500 ₽",
    category: "Металлический сплав · фианит оранжевый",
    image: "assets/catalog-star-orange.png",
    imageAlt:
      "Кольцо Star Orange — матовое металлическое кольцо со звёздами и оранжевым фианитом.",
    video: "videos/star-orange.mp4",
    gallery: ["assets/star-orange-lifestyle.png"],
    description:
      "Матовое металлическое кольцо с вырезными звёздами и оранжевым фианитом. Лёгкий ритм полупрозрачных форм и точечных акцентов делает украшение живым и современным.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит оранжевый",
    edition: "Малые партии",
    size: "17",
  },
  {
    slug: "star-pink",
    variantLabel: "Pink",
    variantColor: "#e8a4b8",
    name: "Кольцо Star Pink",
    price: "5 500 ₽",
    category: "Металлический сплав · фианит розовый",
    image: "assets/catalog-star-pink.png",
    imageAlt:
      "Кольцо Star Pink — матовое металлическое кольцо со звёздами и розовым фианитом.",
    video: "videos/star-pink.mp4",
    gallery: ["assets/star-pink-lifestyle.png"],
    description:
      "Матовое металлическое кольцо с вырезными звёздами и розовым фианитом. Лёгкий ритм полупрозрачных форм и точечных акцентов делает украшение живым и современным.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит розовый",
    edition: "Малые партии",
    size: "17",
  },
  {
    slug: "free-soul",
    name: "Кулон Free Soul",
    price: "4 300 ₽",
    category: "Металлический сплав · подвеска",
    image: "assets/catalog-free-soul.png",
    imageAlt:
      "Кулон Free Soul — полированная металлическая капля с гравировкой Soul Free на тонкой цепочке.",
    video: "videos/free-soul.mp4",
    gallery: ["assets/free-soul-lifestyle.png"],
    description:
      "Полированный металлический кулон-капля с гравировкой Soul / Free на тонкой цепочке. Мягкий объём и чистая форма делают украшение личным знаком, который легко носить каждый день.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    edition: "Малые партии",
  },
  {
    slug: "dragon-green",
    variantLabel: "Green",
    variantColor: "#4a8f55",
    name: "Кольцо Dragon Green",
    price: "5 600 ₽",
    category: "Металлический сплав · фианит зелёный",
    image: "assets/catalog-dragon-green.png",
    imageAlt:
      "Кольцо Dragon Green — металлическое кольцо с чеканкой и овальным зелёным фианитом.",
    video: "videos/dragon-green.mp4",
    gallery: ["assets/dragon-green-lifestyle.png"],
    description:
      "Металлическое кольцо с фактурной чеканкой и овальным зелёным фианитом в центре. Контраст рельефной поверхности и гладкой оправы делает форму выразительной и живой.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит зелёный",
    edition: "Малые партии",
    size: "Под заказ",
  },
  {
    slug: "dragon-red",
    variantLabel: "Red",
    variantColor: "#c41e3a",
    name: "Кольцо Dragon Red",
    price: "5 600 ₽",
    category: "Металлический сплав · фианит красный",
    image: "assets/catalog-dragon-red.png",
    imageAlt:
      "Кольцо Dragon Red — металлическое кольцо с чеканкой и овальным красным фианитом.",
    video: "videos/dragon-red.mp4",
    gallery: ["assets/dragon-red-lifestyle.png"],
    description:
      "Металлическое кольцо с фактурной чеканкой и овальным красным фианитом в центре. Контраст рельефной поверхности и гладкой оправы делает форму выразительной и живой.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит красный",
    edition: "Малые партии",
    size: "Под заказ",
  },
  {
    slug: "dragon-pink",
    variantLabel: "pink",
    variantColor: "#e8a4b8",
    name: "Кольцо Dragon pink",
    price: "5 600 ₽",
    category: "Металлический сплав · фианит розовый",
    image: "assets/catalog-dragon-pink.png",
    imageAlt:
      "Кольцо Dragon pink — металлическое кольцо с чеканкой и овальным розовым фианитом.",
    video: "videos/dragon-pink.mp4",
    gallery: ["assets/dragon-pink-lifestyle.png"],
    description:
      "Металлическое кольцо с фактурной чеканкой и овальным розовым фианитом в центре. Контраст рельефной поверхности и гладкой оправы делает форму выразительной и живой.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит розовый",
    edition: "Малые партии",
    size: "Под заказ",
  },
  {
    slug: "dragon-red-pendant",
    variantLabel: "Red",
    variantColor: "#c41e3a",
    name: "Кулон Dragon red",
    price: "4 900 ₽",
    category: "Металлический сплав · фианит красный",
    image: "assets/catalog-dragon-red-pendant.png",
    imageAlt:
      "Кулон Dragon red — металлический кулон с чеканкой и круглым красным фианитом на цепи.",
    gallery: ["assets/dragon-red-pendant-lifestyle.png"],
    description:
      "Металлический кулон с фактурной чеканкой и круглым красным фианитом в центре. Контраст рельефной поверхности и гладкой оправы делает форму выразительной и живой.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит красный",
    edition: "Малые партии",
  },
  {
    slug: "dragon-pink-pendant",
    variantLabel: "pink",
    variantColor: "#e8a4b8",
    name: "Кулон Dragon pink",
    price: "4 900 ₽",
    category: "Металлический сплав · фианит розовый",
    image: "assets/catalog-dragon-pink-pendant.png",
    imageAlt:
      "Кулон Dragon pink — металлический кулон с чеканкой и круглым розовым фианитом на цепи.",
    gallery: ["assets/dragon-pink-pendant-lifestyle.png"],
    description:
      "Металлический кулон с фактурной чеканкой и круглым розовым фианитом в центре. Контраст рельефной поверхности и гладкой оправы делает форму выразительной и живой.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит розовый",
    edition: "Малые партии",
  },
  {
    slug: "game-pendant",
    name: "Кулон Game",
    price: "6 300 ₽",
    category: "Металлический сплав · фианит зелёный",
    image: "assets/catalog-game-pendant.png",
    imageAlt:
      "Кулон Game — матовый металлический кулон с абстрактной формой и круглым зелёным фианитом на цепи.",
    gallery: ["assets/game-pendant-lifestyle.png"],
    description:
      "Матовый металлический кулон с абстрактной объёмной формой и круглым зелёным фианитом в центре. Спокойная сатиновая поверхность и чистая геометрия делают украшение современным и лаконичным.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит зелёный",
    edition: "Малые партии",
  },
  {
    slug: "game-blue",
    variantLabel: "Blue",
    variantColor: "#2b5ea8",
    name: "Шарм Game Blue",
    price: "4 300 ₽",
    category: "Металлический сплав · фианит синий",
    image: "assets/catalog-game-blue.png",
    imageAlt:
      "Шарм Game Blue — матовый металлический шарм с абстрактной формой и круглым синим фианитом на цепи.",
    gallery: ["assets/game-blue-lifestyle.png"],
    description:
      "Матовый металлический шарм с абстрактной объёмной формой и круглым синим фианитом в центре. Спокойная сатиновая поверхность и чистая геометрия делают украшение современным и лаконичным.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит синий",
    edition: "Малые партии",
  },
  {
    slug: "game-pale-blue",
    variantLabel: "Pale blue",
    variantColor: "#7ec8d9",
    name: "Шарм Game Pale blue",
    price: "4 300 ₽",
    category: "Металлический сплав · фианит голубой",
    image: "assets/catalog-game-pale-blue.png",
    imageAlt:
      "Шарм Game Pale blue — матовый металлический шарм с абстрактной формой и круглым голубым фианитом на цепи.",
    gallery: ["assets/game-pale-blue-lifestyle.png"],
    description:
      "Матовый металлический шарм с абстрактной объёмной формой и круглым голубым фианитом в центре. Спокойная сатиновая поверхность и чистая геометрия делают украшение современным и лаконичным.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит голубой",
    edition: "Малые партии",
  },
  {
    slug: "game-green",
    variantLabel: "Green",
    variantColor: "#4a8f55",
    name: "Шарм Game green",
    price: "4 300 ₽",
    category: "Металлический сплав · фианит зелёный",
    image: "assets/catalog-game-green.png",
    imageAlt:
      "Шарм Game green — матовый металлический шарм с абстрактной формой и круглым зелёным фианитом на цепи.",
    video: "videos/game-green.mp4",
    gallery: ["assets/game-green-lifestyle.png"],
    description:
      "Матовый металлический шарм с абстрактной объёмной формой и круглым зелёным фианитом в центре. Спокойная сатиновая поверхность и чистая геометрия делают украшение современным и лаконичным.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит зелёный",
    edition: "Малые партии",
  },
  {
    slug: "game-red",
    variantLabel: "Red",
    variantColor: "#c41e3a",
    name: "Шарм Game red",
    price: "4 300 ₽",
    category: "Металлический сплав · фианит красный",
    image: "assets/catalog-game-red.png",
    imageAlt:
      "Шарм Game red — матовый металлический шарм с абстрактной формой и круглым красным фианитом на цепи.",
    gallery: ["assets/game-red-lifestyle.png"],
    description:
      "Матовый металлический шарм с абстрактной объёмной формой и круглым красным фианитом в центре. Спокойная сатиновая поверхность и чистая геометрия делают украшение современным и лаконичным.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит красный",
    edition: "Малые партии",
  },
  {
    slug: "game-orange",
    variantLabel: "Orange",
    variantColor: "#e8a04a",
    name: "Шарм Game Orange",
    price: "4 300 ₽",
    category: "Металлический сплав · фианит оранжевый",
    image: "assets/catalog-game-orange.png",
    imageAlt:
      "Шарм Game Orange — матовый металлический шарм с абстрактной формой и круглым оранжевым фианитом на цепи.",
    video: "videos/game-orange.mp4",
    gallery: ["assets/game-orange-lifestyle.png"],
    description:
      "Матовый металлический шарм с абстрактной объёмной формой и круглым оранжевым фианитом в центре. Спокойная сатиновая поверхность и чистая геометрия делают украшение современным и лаконичным.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит оранжевый",
    edition: "Малые партии",
  },
  {
    slug: "game-pink",
    variantLabel: "pink",
    variantColor: "#e8a4b8",
    name: "Шарм Game pink",
    price: "4 300 ₽",
    category: "Металлический сплав · фианит розовый",
    image: "assets/catalog-game-pink.png",
    imageAlt:
      "Шарм Game pink — матовый металлический шарм с абстрактной формой и круглым розовым фианитом на цепи.",
    video: "videos/game-pink.mp4",
    gallery: ["assets/game-pink-lifestyle.png"],
    description:
      "Матовый металлический шарм с абстрактной объёмной формой и круглым розовым фианитом в центре. Спокойная сатиновая поверхность и чистая геометрия делают украшение современным и лаконичным.",
    materialDetail:
      "Высококачественный металлический сплав с защитным покрытием.",
    stone: "Фианит розовый",
    edition: "Малые партии",
  },
];

window.PRODUCT_VARIANT_GROUPS = {
  "dragon-ring": {
    label: "Кольца Dragon",
    order: ["faith-signet", "dragon-green", "dragon-red", "dragon-pink"],
  },
  "dragon-pendant": {
    label: "Кулон Dragon",
    order: ["astris-drop", "dragon-red-pendant", "dragon-pink-pendant"],
  },
  "game-charm": {
    label: "Шарм Game",
    order: ["game-pale-blue", "game-blue", "game-green", "game-orange", "game-pink", "game-red"],
  },
  "star-ring": {
    label: "Кольцо Star",
    order: ["star-orange", "star-pink"],
  },
};
