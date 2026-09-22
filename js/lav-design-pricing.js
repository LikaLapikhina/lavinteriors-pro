/* LAV Design calculator — centralized commercial rates.
 * Edit ONLY this file to change design pricing.
 */
window.LAV_DESIGN_PRICING = {
  currencySymbol: { ru: "₽", en: "₽" },
  /** Full design project rates, RUB / m² */
  ratesPerSqm: {
    basic: 3000,
    extended: 4000,
    author: 5000
  },
  /** Area above this (exclusive of threshold? brief: свыше 200 → use > 200) */
  largeAreaThreshold: 200,
  /** Subtracted from each level rate when area > threshold */
  largeAreaDiscountPerSqm: 1000,

  /** Minimum estimate floor (existing product rule) */
  minimumTotal: 100000,

  /**
   * Separate stage reference rates (RUB / m²) — used for compare box only.
   * Kept editable; not the primary full-project quote.
   */
  separateStageRates: {
    planning: 350,
    concept: 450,
    visuals: 1800,
    drawings: 1200,
    procurement: 1000
  },

  /** Object-type multipliers applied after rate selection */
  objectMultipliers: {
    apartment: 1,
    house: 1.12,
    commercial: 1, // commercial volume handled separately below if needed
    architecture: 1,
    landscape: 1
  },

  /**
   * Resolve RUB/m² for a detail level and area.
   * large-area discount does NOT depend on object type.
   */
  rateFor(detail, areaM2) {
    const rates = this.ratesPerSqm;
    let rate = rates[detail] ?? rates.basic;
    const a = Number(areaM2) || 0;
    if (a > this.largeAreaThreshold) {
      rate = Math.max(0, rate - this.largeAreaDiscountPerSqm);
    }
    return rate;
  }
};
