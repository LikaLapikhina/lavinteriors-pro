/* LAV Visual Studio — centralized pricing (DRAFT placeholders).
 * Edit ONLY this file to change prices, discounts and thresholds.
 * Do not hardcode commercial numbers in components.
 */
window.LAV_VS_PRICING = {
  /** true → UI shows a small “draft prices” hint */
  draft: true,

  currencySymbol: { en: "₽", ru: "₽" },
  currencyCode: "RUB",

  pricePerImage: 4500,
  pricePerVideo: 18000,

  /** Volume discounts: first matching highest minQty wins */
  volumeDiscounts: {
    images: [
      { minQty: 5, percentOff: 8 },
      { minQty: 10, percentOff: 15 },
      { minQty: 20, percentOff: 25 }
    ],
    videos: [
      { minQty: 3, percentOff: 10 },
      { minQty: 5, percentOff: 15 },
      { minQty: 10, percentOff: 22 }
    ]
  },

  /** Content pack: discount applied to (images*rate + videos*rate) */
  packDiscount: 0.12,

  minimumOrder: 4500,

  /** Above these quantities → suggest custom / quote */
  customThreshold: {
    images: 50,
    videos: 20
  },

  qtyLimits: {
    images: { min: 1, max: 200 },
    videos: { min: 1, max: 100 },
    packImages: { min: 0, max: 200 },
    packVideos: { min: 0, max: 100 }
  },

  /** Quick-pick chips next to manual input */
  quickQty: {
    images: [5, 10, 20],
    videos: [1, 3, 5]
  },

  etaHours: 48,
  etaLabel: {
    en: "Within 48 hours*",
    ru: "До 48 часов*"
  }
};

/** Prodamus — fill when ready. Keep disabled until keys exist. */
window.LAV_VS_PRODAMUS = {
  enabled: false,
  paymentBaseUrl: "",
  shopId: "",
  note: "Need shop_id + server-side secret. Prefer a tiny backend for signatures.",
  successUrl: "https://lavinteriors.pro/visual/?paid=1",
  failUrl: "https://lavinteriors.pro/visual/?paid=0",
  currency: "rub"
};
