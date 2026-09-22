/* LAV Visual Studio — general showcase rail (mixed best work).
 *
 * HOW TO ADD A SHOWCASE ITEM:
 * Append to this array:
 *   { type: "video"|"image", src, poster?, title:{en,ru}, tag?:{en,ru} }
 * Files live in /visual/media/showcase/
 * Showcase is a short mixed stream — do not duplicate every category example here.
 */
window.LAV_VS_SHOWCASE = [
  {
    type: "image",
    src: "../images/brands-visual.jpg",
    title: { en: "Interior atmosphere", ru: "Интерьерная атмосфера" },
    tag: { en: "Interior", ru: "Интерьер" }
  },
  {
    type: "image",
    src: "../images/main-hero-1.jpg",
    title: { en: "Quiet luxury frame", ru: "Кадр тихой роскоши" },
    tag: { en: "Lifestyle", ru: "Lifestyle" }
  },
  {
    type: "image",
    src: "../images/bg-portfolio.jpg",
    title: { en: "Space composition", ru: "Композиция пространства" },
    tag: { en: "Architecture", ru: "Архитектура" }
  },
  {
    type: "image",
    src: "../images/bg-brands.jpg",
    title: { en: "Product in context", ru: "Продукт в среде" },
    tag: { en: "Furniture", ru: "Мебель" }
  },
  {
    type: "image",
    src: "../images/bg-stylevision.jpg",
    title: { en: "Light & material", ru: "Свет и материал" },
    tag: { en: "Lighting", ru: "Свет" }
  }
  /* Example video entry:
  ,{
    type: "video",
    src: "media/showcase/reel-01.mp4",
    poster: "media/showcase/reel-01.jpg",
    title: { en: "Campaign reel", ru: "Кампанийный ролик" },
    tag: { en: "Video", ru: "Видео" }
  }
  */
];
