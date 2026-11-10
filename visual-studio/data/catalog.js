export const CATEGORIES = [
  { id: "interior", label: "Interior" },
  { id: "exterior", label: "Exterior" }
];

// Goals: drive prompt direction and the curated reference set (visual-studio/data/curated_sets.json).
// `ui: true` goals are shown to clients; "custom_style" opens the style list.
export const GOALS = [
  { id: "cozier", ui: true, label: "Cozier", note: "Warm modern comfort: wood, layered textiles, soft light", ru: { label: "Уютнее", note: "Тёплый современный уют: дерево, многослойный текстиль, мягкий свет" }, icon: "cozy", dna: ["cozy", "warm", "serene"], styles: ["organic_modern", "mediterranean", "scandinavian"] },
  { id: "more_luxurious", ui: true, label: "More luxurious", note: "Noble materials, light elegance, refined details", ru: { label: "Дороже", note: "Благородные материалы, светлая элегантность, выверенные детали" }, icon: "lux", dna: ["luxurious", "formal", "elegant"], styles: ["quiet_luxury", "contemporary_classic"] },
  { id: "brighter", ui: true, label: "Brighter & airier", note: "More light, air and lighter surfaces", ru: { label: "Светлее и воздушнее", note: "Больше света, воздуха и светлых поверхностей" }, icon: "bright", styles: ["scandinavian", "organic_modern", "minimalism"] },
  { id: "more_designer", ui: true, label: "More designer", note: "Art, sculptural furniture and bold ideas", ru: { label: "Более дизайнерски", note: "Арт, скульптурная мебель и смелые решения" }, icon: "transform", styles: ["eclectic"] },
  { id: "custom_style", ui: true, label: "A specific style", note: "Choose the style yourself", ru: { label: "Свой стиль", note: "Выбрать конкретный стиль" }, icon: "sliders" },
  { id: "more_modern", label: "More modern", note: "Cleaner lines and a current look", ru: { label: "Современнее", note: "Чистые линии и актуальный вид" }, icon: "modern", styles: ["minimalism", "organic_modern", "quiet_luxury"] },
  { id: "add_color", requiresColor: true, label: "Add color", note: "A considered accent colour", ru: { label: "Добавить цвет", note: "Продуманный цветовой акцент" }, icon: "color", styles: ["quiet_luxury", "organic_modern", "minimalism"] },
  { id: "more_minimal", label: "More minimal", note: "Less clutter, calmer and simpler", ru: { label: "Минималистичнее", note: "Меньше лишнего, спокойнее и проще" }, icon: "minimal", styles: ["minimalism", "scandinavian"] },
  { id: "full_transform", label: "Transform it", note: "A bold new direction for the room", ru: { label: "Полностью преобразить", note: "Смелое новое решение для комнаты" }, icon: "transform", styles: ["quiet_luxury", "organic_modern", "minimalism"] }
];

// Change levels: what may change vs what stays. `who` is the "who is this for" hint shown in the UI.
export const CHANGE_LEVELS = [
  { id: "details_only", label: "Décor only", note: "Textiles, art, plants, rug, lamps. Walls and furniture stay.", who: "No renovation and no new furniture: home staging, rentals, a quick refresh.",
    ru: { label: "Только декор", note: "Текстиль, картины, растения, ковёр, лампы. Стены и мебель остаются.", who: "Без ремонта и без новой мебели: хоум-стейджинг, съёмная квартира, быстро освежить." } },
  { id: "finishes_decor", label: "Finishes & décor", note: "New walls, floor, ceiling and décor. Your furniture stays.", who: "A cosmetic renovation while keeping your furniture (new covers and fronts are possible).",
    ru: { label: "Отделка и декор", note: "Новые стены, пол, потолок и декор. Ваша мебель остаётся.", who: "Косметический ремонт, мебель остаётся своя (можно новые чехлы и фасады)." } },
  { id: "furniture_decor", label: "Furniture & décor", note: "New furniture and décor. Walls, floor and ceiling stay.", who: "You don't want to touch the renovation, but are ready to change furniture.",
    ru: { label: "Мебель и декор", note: "Новая мебель и декор. Стены, пол и потолок остаются.", who: "Ремонт трогать не хочется, а мебель поменять готовы." } },
  { id: "almost_everything", label: "Everything", note: "A full redesign. Only walls, windows and the camera angle stay.", who: "A full new project: finishes, furniture, lighting and décor.",
    ru: { label: "Полностью", note: "Полный редизайн. Остаются только стены, окна и ракурс.", who: "Полностью новый проект: отделка, мебель, свет и декор." } }
];
export const LEGACY_CHANGE_LEVELS = { furniture_finishes: "almost_everything" };

export const SPACE_TYPES = {
  interior: [
    { id: "auto_free", label: "Not specified" },
    { id: "living_room", label: "Living room" },
    { id: "kitchen_living", label: "Kitchen-living" },
    { id: "bedroom", label: "Bedroom" },
    { id: "kitchen", label: "Kitchen" },
    { id: "dining_room", label: "Dining room" },
    { id: "bathroom", label: "Bathroom" },
    { id: "kids_room", label: "Kids room" },
    { id: "office", label: "Office" },
    { id: "hallway", label: "Hallway" },
    { id: "wardrobe", label: "Wardrobe" }
  ],
  exterior: [
    { id: "house", label: "House" },
    { id: "facade", label: "Facade" },
    { id: "villa", label: "Villa" },
    { id: "terrace", label: "Terrace" },
    { id: "courtyard", label: "Courtyard" },
    { id: "garden", label: "Garden" },
    { id: "public_building", label: "Public building" }
  ]
};

export const STYLES = [
  { id: "organic_modern", name: "Organic", fullName: "Warm Organic Modern", ru: "Тёплый уют (Органик)", note: "Warm wood, bouclé, soft curves and gentle light", ruNote: "Тёплое дерево, букле, мягкие формы и уютный свет", defaultGoal: "cozier", image: "/images/living3.webp", resultInterior: "/images/living3.webp", resultExterior: "/images/architecture1.webp", active: true, order: 1 },
  { id: "quiet_luxury", name: "Quiet Luxury", fullName: "Quiet Luxury", ru: "Дорогая эстетика (Тихая роскошь)", note: "Noble stone, fine wood veneer, brass and elevated hotel feel", ruNote: "Благородный камень, шпон, латунь и статусный современный вид", defaultGoal: "more_luxurious", image: "/images/living2.webp", resultInterior: "/images/living2.webp", resultExterior: "/images/architecture2.webp", active: true, order: 2 },
  { id: "scandinavian", name: "Scandinavian", fullName: "Bright Scandinavian", ru: "Светлый и воздушный (Сканди)", note: "Maximum light, pale oak, clean walls without mouldings", ruNote: "Максимум света и воздуха, светлое дерево, гладкие стены без молдингов", defaultGoal: "brighter", image: "/images/living7.webp", resultInterior: "/images/living7.webp", resultExterior: "/images/architecture5.webp", active: true, order: 3 },
  { id: "minimalism", name: "Minimal", fullName: "Warm Minimalism", ru: "Чистый минимализм", note: "Visual calm, handleless fronts, nothing superfluous", ruNote: "Спокойствие, гладкие фасады без ручек, порядок и воздух", defaultGoal: "more_minimal", image: "/images/living6.webp", resultInterior: "/images/living6.webp", resultExterior: "/images/architecture4.webp", active: true, order: 4 },
  { id: "contemporary_classic", name: "Classic", fullName: "Contemporary Classic (Neoclassic)", ru: "Современная классика (Неоклассика)", note: "Wall mouldings, symmetry, herringbone parquet", ruNote: "Молдинги на стенах, симметрия, паркет ёлочкой и элегантность", defaultGoal: "more_luxurious", image: "/images/port-v2-living-marble-portal.webp", resultInterior: "/images/living2.webp", resultExterior: "/images/architecture6.webp", active: true, order: 5 },
  { id: "mediterranean", name: "Mediterranean", fullName: "Warm Mediterranean", ru: "Природный южный (Средиземноморский)", note: "Textured plaster, limestone, crafted wood and warm tones", ruNote: "Фактурная штукатурка, светлый камень, дерево и солнечное тепло", defaultGoal: "cozier", image: "/images/port-v2-living-blue-rug.webp", resultInterior: "/images/living3.webp", resultExterior: "/images/landscape4.webp", active: true, order: 6 },
  { id: "american", name: "American", fullName: "Classic American", ru: "Американский уютный", note: "Generous sofas, warm woods and classic home comfort", ruNote: "Крупные уютные диваны, тёплое дерево и домашний комфорт", defaultGoal: "cozier", image: "/images/living5.webp", resultInterior: "/images/living5.webp", resultExterior: "/images/architecture3.webp", active: true, order: 7 },
  { id: "eclectic", name: "Eclectic", fullName: "Designer Eclectic", ru: "Яркий дизайнерский (Эклектика)", note: "Statement furniture forms, rich colours and curated art", ruNote: "Смелые формы мебели, глубокие оттенки и авторский арт", defaultGoal: "more_modern", image: "/images/port-v2-living-burgundy-chairs.webp", resultInterior: "/images/living4.webp", resultExterior: "/images/architecture7.webp", active: true, order: 8 }
];

export const COLORS = [
  { id: "beige", label: "Beige", ru: "Бежевый", palette: ["#ede4d7", "#d8c8ae", "#aa8e6d"], primary: true },
  { id: "white", label: "White", ru: "Белый", palette: ["#faf9f5", "#eeeae2", "#cbc7bd"], primary: true },
  { id: "light", label: "Light", ru: "Светлый", palette: ["#f0eee8", "#ddd9d1", "#bdb8ae"], primary: false },
  { id: "grey", label: "Grey", ru: "Серый", palette: ["#c8c7c2", "#92918c", "#5f5e5a"], primary: false },
  { id: "light_wood", label: "Light wood", ru: "Светлое дерево", palette: ["#e0c9a9", "#c8aa82", "#977654"], primary: false },
  { id: "brown", label: "Brown", ru: "Коричневый", palette: ["#cfb493", "#927054", "#593d2d"], primary: true },
  { id: "dark_wood", label: "Dark wood", ru: "Тёмное дерево", palette: ["#94725b", "#563b2b", "#2e211a"], primary: false },
  { id: "green", label: "Green", ru: "Зелёный", palette: ["#a4aa8f", "#59614e", "#30382b"], primary: true },
  { id: "blue", label: "Blue", ru: "Синий", palette: ["#a9b7bf", "#6a7b8b", "#354653"], primary: true },
  { id: "pink", label: "Pink", ru: "Розовый", palette: ["#e5c9c6", "#c99b9e", "#8e5f65"], primary: true },
  { id: "yellow", label: "Yellow", ru: "Жёлтый", palette: ["#ead99c", "#d6b347", "#8f7023"], primary: false },
  { id: "red", label: "Red", ru: "Красный / Терракот", palette: ["#c9786e", "#91332f", "#581b1a"], primary: false },
  { id: "dark", label: "Dark", ru: "Тёмный", palette: ["#77736d", "#3b3936", "#171615"], primary: true },
  { id: "black", label: "Black", ru: "Чёрный", palette: ["#5d5b58", "#292826", "#11100f"], primary: false }
];

// Credits are the single in-app currency on every language. Real credit
// packages and regional prices are configured at the payments stage.
// PLACEHOLDER balance — display only, nothing is charged yet.
export const CREDITS = { perGeneration: 1, placeholderBalance: 3 };

export const CREDIT_PACKAGES = [
  { id: "credits_10", credits: 10, price: "1 990 ₽" },
  { id: "credits_30", credits: 30, price: "4 990 ₽" },
  { id: "credits_60", credits: 60, price: "7 990 ₽" },
  { id: "credits_100", credits: 100, price: "12 990 ₽" }
];

export const DEMO = {
  original: "/images/living1.webp",
  projectName: "Living room study",
  category: "interior",
  spaceType: "living_room"
};

// First-screen before/after example. PLACEHOLDER pair — replace with a real
// source photo and its generated result when available.
export const SHOWCASE = [
  { before: "/images/living1.webp", after: "/images/living2.webp", goal: "more_luxurious", style: "quiet_luxury" }
];

// Ready-made presets on the first screen: one tap sets goal/style/colour/changes.
// Images are PLACEHOLDERS — replace with real before/after pairs.
export const PRESETS = [
  { id: "cozy_living", spaceType: "living_room", goal: "cozier", style: "organic_modern", color: "beige", changeLevel: "finishes_decor", before: "/images/living4.webp", after: "/images/living3.webp",
    ru: { title: "Уютнее", note: "Тёплый органик модерн · Гостиная" }, en: { title: "Cozier", note: "Warm organic modern · Living room" } },
  { id: "luxury_bedroom", spaceType: "bedroom", goal: "more_luxurious", style: "quiet_luxury", color: "light", changeLevel: "almost_everything", before: "/images/bedroom1.webp", after: "/images/bedroom2.webp",
    ru: { title: "Дороже", note: "Тихая роскошь · Спальня" }, en: { title: "More luxurious", note: "Quiet luxury · Bedroom" } },
  { id: "modern_bath", spaceType: "bathroom", goal: "more_designer", style: "minimalism", color: "grey", changeLevel: "almost_everything", before: "/images/bathroom1.webp", after: "/images/bathroom2.webp",
    ru: { title: "Более дизайнерски", note: "Ванная" }, en: { title: "More designer", note: "Bathroom" } }
];

export const REFERENCE_ASSET_SCHEMA = {
  id: "string",
  sourceProvider: "local | google_drive | other",
  sourceKey: "string",
  category: "interior | exterior",
  spaceTypes: ["stable_slug"],
  styles: ["stable_slug"],
  colors: ["stable_slug"],
  active: true,
  metadata: {}
};