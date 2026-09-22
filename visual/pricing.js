/* LAV Visual Studio — centralized commercial rates.
 * Edit ONLY this file to change visual pricing / discounts.
 */
window.LAV_VS_PRICING = {
  draft: false,
  currencySymbol: { en: "₽", ru: "₽" },
  currencyCode: "RUB",

  imagePrice: 2500,

  videoPrices: {
    upTo30: 3500,
    from31to60: 6000,
    from61to90: 10000
    // over90 → custom quote, not auto-priced
  },

  contentPack: {
    minImages: 5,
    minVideos: 2,
    discountPercent: 7
  },

  largeOrder: {
    threshold: 100000,
    discountPercent: 10
  },

  qtyLimits: {
    images: { min: 0, max: 500 },
    videos: { min: 0, max: 200 }
  },

  etaLabel: {
    en: "Within 48 hours*",
    ru: "До 48 часов*"
  },

  etaCustom: {
    en: "Quoted individually",
    ru: "Согласовывается индивидуально"
  },

  /** What base price includes (structure for future expansion) */
  includes: {
    image: {
      finals: 1,
      formats: 1,
      revisionRounds: 1
    },
    video: {
      durationTier: true,
      aspectRatios: 1,
      revisionRounds: 1
    }
  },

  videoPriceFor(durationKey) {
    if (durationKey === "upTo30") return this.videoPrices.upTo30;
    if (durationKey === "from31to60") return this.videoPrices.from31to60;
    if (durationKey === "from61to90") return this.videoPrices.from61to90;
    return null; // over90 / custom
  },

  /**
   * Core quote engine — single source of calculation truth.
   * @param {{ images?: number, videos?: number, durationKey?: string }} input
   */
  computeQuote(input) {
    const images = Math.max(0, Math.floor(Number(input?.images) || 0));
    const videos = Math.max(0, Math.floor(Number(input?.videos) || 0));
    const durationKey = input?.durationKey || "upTo30";

    const imageUnit = this.imagePrice;
    const imagesTotal = images * imageUnit;

    const videoUnit = this.videoPriceFor(durationKey);
    const customVideo = videos > 0 && videoUnit == null;
    const videosTotal = customVideo || videoUnit == null ? 0 : videos * videoUnit;

    const subtotal = imagesTotal + videosTotal;

    const packCfg = this.contentPack;
    const largeCfg = this.largeOrder;
    const packEligible =
      images >= packCfg.minImages && videos >= packCfg.minVideos;
    const largeEligible = subtotal >= largeCfg.threshold;

    let discountKind = null;
    let discountPercent = 0;
    if (packEligible && largeEligible) {
      if (largeCfg.discountPercent >= packCfg.discountPercent) {
        discountKind = "largeOrder";
        discountPercent = largeCfg.discountPercent;
      } else {
        discountKind = "contentPack";
        discountPercent = packCfg.discountPercent;
      }
    } else if (largeEligible) {
      discountKind = "largeOrder";
      discountPercent = largeCfg.discountPercent;
    } else if (packEligible) {
      discountKind = "contentPack";
      discountPercent = packCfg.discountPercent;
    }

    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = Math.max(0, subtotal - discountAmount);

    const isLargeOrCustom = customVideo || largeEligible || subtotal >= largeCfg.threshold;
    const etaKey = customVideo || isLargeOrCustom ? "etaCustom" : "etaLabel";

    return {
      images,
      videos,
      durationKey,
      imageUnit,
      imagesTotal,
      videoUnit,
      videosTotal,
      customVideo,
      subtotal,
      packEligible,
      largeEligible,
      discountKind,
      discountPercent,
      discountAmount,
      total,
      etaKey,
      includes: this.includes
    };
  }
};

window.LAV_VS_PRODAMUS = {
  enabled: false,
  paymentBaseUrl: "",
  shopId: "",
  note: "Need shop_id + server-side secret.",
  successUrl: "https://lavinteriors.pro/visual/?paid=1",
  failUrl: "https://lavinteriors.pro/visual/?paid=0",
  currency: "rub"
};
