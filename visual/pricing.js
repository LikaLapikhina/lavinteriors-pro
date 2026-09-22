/* LAV Visual Studio — pricing config
 * DRAFT PLACEHOLDERS — replace with final commercial prices before advertising.
 * Edit only this file to change packages, volumes and volume discounts.
 */
window.LAV_VS_PRICING = {
  currency: { en: "USD", ru: "USD" },
  /** Mark draft so UI can hint prices are provisional until confirmed */
  draft: true,

  images: {
    unitLabel: { en: "images", ru: "изображений" },
    options: [
      { qty: 1, price: 120, label: { en: "1", ru: "1" } },
      { qty: 5, price: 500, label: { en: "5", ru: "5" } },
      { qty: 10, price: 900, label: { en: "10", ru: "10" } },
      { qty: 20, price: 1600, label: { en: "20", ru: "20" } },
      { qty: "custom", price: null, label: { en: "Custom", ru: "Custom" } }
    ],
    /** volume discount table for custom qty: [{minQty, percentOff}] */
    volumeDiscount: [
      { minQty: 5, percentOff: 8 },
      { minQty: 10, percentOff: 15 },
      { minQty: 20, percentOff: 25 }
    ],
    customUnitPrice: 120,
    etaHours: 48
  },

  videos: {
    unitLabel: { en: "videos", ru: "видео" },
    options: [
      { qty: 1, price: 250, label: { en: "1", ru: "1" } },
      { qty: 3, price: 650, label: { en: "3", ru: "3" } },
      { qty: 5, price: 1000, label: { en: "5", ru: "5" } },
      { qty: 10, price: 1800, label: { en: "10", ru: "10" } },
      { qty: "custom", price: null, label: { en: "Custom", ru: "Custom" } }
    ],
    volumeDiscount: [
      { minQty: 3, percentOff: 10 },
      { minQty: 5, percentOff: 15 },
      { minQty: 10, percentOff: 22 }
    ],
    customUnitPrice: 250,
    etaHours: 48
  },

  packs: [
    {
      id: "starter",
      images: 5,
      videos: 1,
      price: 680,
      title: { en: "Starter Pack", ru: "Starter Pack" },
      desc: {
        en: "5 images + 1 short video — one visual system",
        ru: "5 изображений + 1 короткое видео — одна визуальная система"
      },
      etaHours: 48
    },
    {
      id: "launch",
      images: 10,
      videos: 3,
      price: 1450,
      title: { en: "Launch Pack", ru: "Launch Pack" },
      desc: {
        en: "10 images + 3 videos for social / ads / site",
        ru: "10 изображений + 3 видео для соцсетей / рекламы / сайта"
      },
      etaHours: 48
    },
    {
      id: "campaign",
      images: 20,
      videos: 5,
      price: 2600,
      title: { en: "Campaign Pack", ru: "Campaign Pack" },
      desc: {
        en: "20 images + 5 videos — campaign-ready set",
        ru: "20 изображений + 5 видео — набор под кампанию"
      },
      etaHours: 72
    }
  ]
};

/** Prodamus — fill when ready. Do not enable until keys are set. */
window.LAV_VS_PRODAMUS = {
  enabled: false,
  /** https://pay.prodamus.ru/... or your payment form URL */
  paymentBaseUrl: "",
  shopId: "",
  /** secret used server-side for signature — NEVER expose in frontend for production;
   *  prefer a tiny backend endpoint. For link-mode Prodamus, document fields below. */
  note: "Need: shop_id, secret_key (server-side), success_url, fail_url, currency, order payload mapping.",
  successUrl: "https://lavinteriors.pro/visual/?paid=1",
  failUrl: "https://lavinteriors.pro/visual/?paid=0",
  currency: "usd"
};
