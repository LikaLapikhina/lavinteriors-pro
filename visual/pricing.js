/* LAV Visual Studio — centralized commercial rates.
 * Edit ONLY this file to change visual pricing / discounts.
 * RU = RUB list. EN = fixed USD list. No live conversion.
 */
window.LAV_VS_PRICING = {
  draft: false,

  ru: {
    currency: "RUB",
    symbol: "₽",
    imagePrice: 2500,
    videoPrices: {
      upTo30: 3500,
      from31to60: 6000,
      from61to90: 10000
    },
    contentPack: {
      minImages: 5,
      minVideos: 2,
      discountPercent: 7
    },
    largeOrder: {
      threshold: 100000,
      discountPercent: 10
    }
  },

  en: {
    currency: "USD",
    symbol: "$",
    imagePrice: 35,
    videoPrices: {
      upTo30: 50,
      from31to60: 85,
      from61to90: 145
    },
    contentPack: {
      minImages: 5,
      minVideos: 2,
      discountPercent: 7
    },
    largeOrder: {
      threshold: 1500,
      discountPercent: 10
    }
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

  includes: {
    image: { finals: 1, formats: 1, revisionRounds: 1 },
    video: { durationTier: true, aspectRatios: 1, revisionRounds: 1 }
  },

  forLang(lang) {
    return this[lang === "ru" ? "ru" : "en"];
  },

  formatMoney(amount, lang) {
    const v = Math.round(Number(amount) || 0);
    const cfg = this.forLang(lang);
    if (cfg.currency === "USD") {
      return "$" + v.toLocaleString("en-US");
    }
    return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
  },

  videoPriceFor(durationKey, lang) {
    const prices = this.forLang(lang).videoPrices;
    if (durationKey === "upTo30") return prices.upTo30;
    if (durationKey === "from31to60") return prices.from31to60;
    if (durationKey === "from61to90") return prices.from61to90;
    return null;
  },

  /**
   * @param {{ images?: number, videos?: number, durationKey?: string, lang?: string }} input
   */
  computeQuote(input) {
    const lang = input?.lang === "ru" ? "ru" : "en";
    const cfg = this.forLang(lang);
    const images = Math.max(0, Math.floor(Number(input?.images) || 0));
    const videos = Math.max(0, Math.floor(Number(input?.videos) || 0));
    const durationKey = input?.durationKey || "upTo30";

    const imageUnit = cfg.imagePrice;
    const imagesTotal = images * imageUnit;

    const videoUnit = this.videoPriceFor(durationKey, lang);
    const customVideo = videos > 0 && videoUnit == null;
    const videosTotal = customVideo || videoUnit == null ? 0 : videos * videoUnit;

    const subtotal = imagesTotal + videosTotal;

    const packCfg = cfg.contentPack;
    const largeCfg = cfg.largeOrder;
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
    const etaKey =
      customVideo || largeEligible ? "etaCustom" : "etaLabel";

    return {
      lang,
      currency: cfg.currency,
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
