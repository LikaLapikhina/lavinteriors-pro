// LAV Visual Studio — Reference Provider Service
// Supports both mock StaticReferenceProvider and data-driven ManifestReferenceProvider / GoogleDriveReferenceProvider

export class StaticReferenceProvider {
  constructor({ styles }) {
    this.styles = styles;
  }

  async getReferences({ category, spaceType, styleId, colorId }) {
    const style = this.styles.find((item) => item.id === styleId);
    if (!style) return [];

    return [{
      id: `mock-ref-${category}-${styleId}-${colorId || "default"}`,
      sourceProvider: "local",
      sourceKey: category === "exterior" ? style.resultExterior : style.resultInterior,
      imageUrl: category === "exterior" ? style.resultExterior : style.resultInterior,
      tags: { category, spaceType, style: styleId, color: colorId || null }
    }];
  }
}

export class ManifestReferenceProvider {
  constructor({ manifestUrl = "./data/references_manifest.json", fallbackProvider = null, limit = 8 } = {}) {
    this.manifestUrl = manifestUrl;
    this.fallbackProvider = fallbackProvider;
    this.limit = limit;
    this.assets = null;
    this._loadPromise = null;
  }

  async load() {
    if (this.assets) return this.assets;
    if (this._loadPromise) return this._loadPromise;
    this._loadPromise = (async () => {
      try {
        const res = await fetch(this.manifestUrl);
        if (res.ok) {
          this.assets = await res.json();
          return this.assets;
        }
      } catch (e) {
        // Fallback if manifest is unreachable
      }
      return null;
    })();
    return this._loadPromise;
  }

  async loadCurated() {
    if (this._curated !== undefined) return this._curated;
    try {
      const url = this.manifestUrl.replace(/references_manifest\.json(\?.*)?$/, "curated_sets.json$1");
      const res = await fetch(url);
      this._curated = res.ok ? await res.json() : null;
    } catch (e) {
      this._curated = null;
    }
    return this._curated;
  }

  imageUrl(asset, size = 900) {
    if (asset.sourceProvider === "google_drive" && asset.sourceKey) {
      return `https://drive.google.com/thumbnail?id=${encodeURIComponent(asset.sourceKey)}&sz=w${size}`;
    }
    return asset.sourceKey || "";
  }

  async getReferences({ category = "interior", spaceType = "living_room", styleId = null, colorId = null, goal = null, limit = null, bonus = null }) {
    const assets = await this.load();
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      if (this.fallbackProvider) {
        return this.fallbackProvider.getReferences({ category, spaceType, styleId, colorId });
      }
      return [];
    }

    let pool = assets.filter((a) => a.category === category && a.active !== false);

    // 0. Curated sets (owner's taste): explicit style -> style set, otherwise goal -> goal set.
    const curated = await this.loadCurated();
    const setIds = styleId ? curated?.styles?.[styleId] : curated?.goals?.[goal?.id];
    const usingCurated = Array.isArray(setIds) && setIds.length > 0;
    if (usingCurated) {
      const ids = new Set(setIds);
      const inSet = pool.filter((a) => ids.has(a.id));
      if (inSet.length) pool = inSet;
    }

    // 1. Room filtering. "Not specified" and "kitchen-living" use living/dining scenes,
    //    so kitchen cabinetry from references never leaks into a sofa/dining corner.
    const ROOM_POOLS = { auto_free: ["living_room", "dining_room"], kitchen_living: ["living_room", "dining_room"] };
    const wanted = category === "interior" ? (ROOM_POOLS[spaceType] || (spaceType ? [spaceType] : ROOM_POOLS.auto_free)) : (spaceType ? [spaceType] : []);
    if (wanted.length) {
      const spaceMatches = pool.filter((a) => a.spaceTypes && a.spaceTypes.some((r) => wanted.includes(r)));
      if (spaceMatches.length >= (usingCurated ? 2 : 1)) {
        pool = spaceMatches;
      } else if (usingCurated) {
        const living = pool.filter((a) => a.spaceTypes && a.spaceTypes.some((r) => ROOM_POOLS.auto_free.includes(r)));
        if (living.length >= 2) pool = living;
      }
    }
    if (usingCurated) {
      // curated sets are already filtered by taste: shuffle so each generation gets a different pair
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      return pool.slice(0, limit || this.limit).map((a) => this.toReference(a));
    }

    // 2. Isolate Classical/Moulding interiors from Modern styles unless Contemporary Classic or American is explicitly selected
    const isClassicRequest = styleId === "contemporary_classic" || styleId === "american";
    if (!isClassicRequest) {
      const modernOnly = pool.filter((a) => !a.styles?.includes("contemporary_classic") && !a.styles?.includes("american"));
      if (modernOnly.length > 0) {
        pool = modernOnly;
      }
    }

    // 3. Filter by explicit styleId, or fallback to goal's preferred styles
    if (styleId) {
      const styleMatches = pool.filter((a) => a.styles && a.styles.includes(styleId));
      if (styleMatches.length > 0) {
        pool = styleMatches;
      }
    } else if (goal?.styles?.length) {
      const goalStyleMatches = pool.filter((a) => a.styles && goal.styles.some((s) => a.styles.includes(s)));
      if (goalStyleMatches.length > 0) {
        pool = goalStyleMatches;
      }
    }

    // 4. Lightness / Darkness filtering (NEVER hard-filter by chromatic accent colors like blue/green/pink/red/yellow!)
    const wantsBright = goal?.id === "brighter" || styleId === "scandinavian" || ["white", "light", "beige", "light_wood"].includes(colorId);
    const wantsDark = ["dark", "black", "dark_wood"].includes(colorId);
    if (wantsBright && !wantsDark) {
      const brightMatches = pool.filter((a) => {
        const pdir = a.metadata?.primary_direction || "";
        const cols = a.colors || [];
        return pdir !== "Dark Architectural" && !cols.includes("dark") && !cols.includes("black");
      });
      if (brightMatches.length > 0) {
        pool = brightMatches;
      }
    } else if (wantsDark) {
      const darkMatches = pool.filter((a) => {
        const pdir = a.metadata?.primary_direction || "";
        const cols = a.colors || [];
        return pdir === "Dark Architectural" || cols.some((c) => ["dark", "black", "dark_wood", "brown"].includes(c));
      });
      if (darkMatches.length > 0) {
        pool = darkMatches;
      }
    }

    const goalDna = goal?.dna || [];
    const goalStyles = goal?.styles || [];
    const goalColors = goal?.colors || [];
    const goalAvoid = goal?.avoidColors || [];
    const score = (asset) => {
      const metadata = asset.metadata || {};
      const dna = metadata.creative_dna || [];
      let value = Number(metadata.quality_score || 0);
      if (!metadata.has_watermark) value += 2;
      if (!metadata.has_text && !metadata.has_ui_elements && !metadata.is_collage) value += 2;
      if (styleId && asset.styles?.includes(styleId)) value += 4;
      value += goalDna.filter((tag) => dna.includes(tag)).length * 3;
      value += goalStyles.filter((tag) => asset.styles?.includes(tag)).length * 2;
      value += goalColors.filter((tag) => asset.colors?.includes(tag)).length * 1.5;
      if (colorId && asset.colors?.includes(colorId)) value += 1.5;
      if (!goalColors.some((tag) => asset.colors?.includes(tag))) value -= goalAvoid.filter((tag) => asset.colors?.includes(tag)).length * 3;
      if (bonus && bonus[asset.id]) value += Math.max(-6, Math.min(6, bonus[asset.id] * 2));
      return value;
    };
    pool.sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));

    const selected = pool.slice(0, limit || this.limit);
    if (selected.length === 0 && this.fallbackProvider) {
      return this.fallbackProvider.getReferences({ category, spaceType, styleId, colorId });
    }

    return selected.map((a) => this.toReference(a));
  }

  toReference(a) {
    return {
      id: a.id,
      sourceProvider: a.sourceProvider || "google_drive",
      sourceKey: a.sourceKey || a.metadata?.filename,
      imageUrl: this.imageUrl(a),
      drivePath: a.drivePath,
      tags: {
        category: a.category,
        spaceType: a.spaceTypes,
        style: a.styles,
        color: a.colors
      },
      metadata: a.metadata || {}
    };
  }

  async getById(id) {
    const assets = await this.load();
    const asset = Array.isArray(assets) ? assets.find((a) => a.id === id && a.active !== false) : null;
    return asset ? this.toReference(asset) : null;
  }
}
