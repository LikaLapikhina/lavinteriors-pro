/* LAV Visual Studio — client categories + per-category video examples.
 *
 * HOW TO ADD A VIDEO TO A CATEGORY:
 * 1. Put files in /visual/media/categories/  (e.g. designers-01.mp4 + designers-01.jpg)
 * 2. Append an object to that category's `examples` array:
 *    { video, poster, title: {en, ru}, description?: {en, ru} }
 * 3. Redeploy. Cards work with zero examples — empty state is intentional.
 */
window.LAV_VS_CATEGORIES = [
  {
    id: "designers",
    title: {
      en: "Interior designers & studios",
      ru: "Интерьерные дизайнеры и студии"
    },
    blurb: {
      en: "Content to present and promote projects.",
      ru: "Контент для презентации и продвижения проектов."
    },
    examples: [
      /* {
        video: "media/categories/designers-01.mp4",
        poster: "media/categories/designers-01.jpg",
        title: { en: "Project film", ru: "Фильм о проекте" },
        description: { en: "Atmospheric walkthrough", ru: "Атмосферный walkthrough" }
      } */
    ]
  },
  {
    id: "furniture",
    title: {
      en: "Furniture & kitchen brands",
      ru: "Мебельные и кухонные бренды"
    },
    blurb: {
      en: "Product in a finished interior — without constant shoots.",
      ru: "Продукт в готовой интерьерной среде — без постоянных съёмок."
    },
    examples: []
  },
  {
    id: "lighting",
    title: {
      en: "Lighting & interior brands",
      ru: "Свет и интерьерные бренды"
    },
    blurb: {
      en: "Campaign visuals and lifestyle frames for collections.",
      ru: "Кампании и lifestyle-кадры для коллекций."
    },
    examples: []
  },
  {
    id: "architecture",
    title: {
      en: "Architecture studios",
      ru: "Архитектурные бюро"
    },
    blurb: {
      en: "Atmospheric storytelling for concepts and exteriors.",
      ru: "Атмосферная подача концепций и экстерьеров."
    },
    examples: []
  },
  {
    id: "realestate",
    title: {
      en: "Real estate & developers",
      ru: "Недвижимость и девелоперы"
    },
    blurb: {
      en: "Future object and lifestyle — before construction ends.",
      ru: "Будущий объект и образ жизни ещё до реализации."
    },
    examples: []
  },
  {
    id: "agencies",
    title: {
      en: "Creative & marketing agencies",
      ru: "Креативные и маркетинговые агентства"
    },
    blurb: {
      en: "External visual production for client projects.",
      ru: "Внешний визуальный продакшн для клиентских проектов."
    },
    examples: []
  }
];
