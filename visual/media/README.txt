LAV Visual Studio media folders
================================

categories/   — per-audience examples (referenced from categories.js)
showcase/     — mixed showcase rail items (referenced from showcase.js)

Optional hero video:
  Place media/hero.mp4 (+ hero.jpg poster) and wire it in index.html
  inside #vsHeroMedia if desired.

Category example shape (categories.js):
  {
    video: "media/categories/designers-01.mp4",
    poster: "media/categories/designers-01.jpg",
    title: { en: "...", ru: "..." },
    description: { en: "...", ru: "..." }  // optional
  }

Showcase item shape (showcase.js):
  {
    type: "video" | "image",
    src: "media/showcase/...",
    poster: "media/showcase/....jpg",  // for video
    title: { en: "...", ru: "..." },
    tag: { en: "...", ru: "..." }
  }

Prices: edit visual/pricing.js only.
