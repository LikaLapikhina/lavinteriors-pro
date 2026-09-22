/* LAV Design calculator — centralized commercial rates.
 * Edit ONLY this file to change design pricing.
 * RU = RUB list. EN = fixed USD list. No live conversion.
 */
window.LAV_DESIGN_PRICING = {
  ru: {
    currency: "RUB",
    symbol: "₽",
    ratesPerSqm: {
      basic: 3000,
      extended: 4000,
      author: 5000
    },
    /** Explicit large-project rates (area > threshold) */
    ratesPerSqmLarge: {
      basic: 2000,
      extended: 3000,
      author: 4000
    },
    largeAreaThreshold: 200,
    minimumTotal: 100000,
    separateStageRates: {
      planning: 350,
      concept: 450,
      visuals: 1800,
      drawings: 1200,
      procurement: 1000
    },
    options48PerView: 10000
  },

  en: {
    currency: "USD",
    symbol: "$",
    ratesPerSqm: {
      basic: 45,
      extended: 60,
      author: 75
    },
    ratesPerSqmLarge: {
      basic: 30,
      extended: 45,
      author: 60
    },
    largeAreaThreshold: 200,
    minimumTotal: 1500,
    separateStageRates: {
      planning: 5,
      concept: 7,
      visuals: 27,
      drawings: 18,
      procurement: 15
    },
    options48PerView: 150
  },

  objectMultipliers: {
    apartment: 1,
    house: 1.12,
    commercial: 1,
    architecture: 1,
    landscape: 1
  },

  forLang(lang) {
    return this[lang === "ru" ? "ru" : "en"];
  },

  /**
   * Resolve price / m² for a detail level and area in the given language.
   * large-area rule does NOT depend on object type.
   */
  rateFor(detail, areaM2, lang) {
    const cfg = this.forLang(lang);
    const a = Number(areaM2) || 0;
    const table =
      a > cfg.largeAreaThreshold
        ? cfg.ratesPerSqmLarge || cfg.ratesPerSqm
        : cfg.ratesPerSqm;
    return table[detail] ?? table.basic;
  },

  formatMoney(amount, lang) {
    const v = Math.round(Number(amount) || 0);
    const cfg = this.forLang(lang);
    if (cfg.currency === "USD") {
      return "$" + v.toLocaleString("en-US");
    }
    return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
  },

  getMinTotal(lang) {
    return this.forLang(lang).minimumTotal;
  },

  getSeparateRates(lang) {
    return this.forLang(lang).separateStageRates;
  },

  getOptions48PerView(lang) {
    return this.forLang(lang).options48PerView;
  }
};
