/* LAV Visual Studio — i18n, categories, showcase, calculator */
(function () {
  const I18N = {
    en: {
      navPortfolio: "Portfolio",
      navAbout: "About",
      navProcess: "Process",
      navPricing: "Pricing",
      navVisualStudio: "LAV Visual Studio",
      brandSub: "Interior Design & Architecture",
      footDesc2:
        "A contemporary editorial luxury approach to interiors, architecture, landscape and commercial spaces.",
      legalOfferNote:
        "Payment terms, contract details, timing and exact scope of services are discussed separately outside the website. The information on the website is for informational purposes only and is not a public offer.",
      footContact: "Contact",
      privacyLink: "Privacy Policy",
      termsLink: "Terms of Use",
      cookiesLink: "Cookie Policy",
      cookieSettings: "Cookie settings",
      legalInfoText:
        "Project: LAV Interiors. Website: lavinteriors.pro. Email: hello@lavinteriors.pro. Operator: an individual operating under the LAV Interiors brand. Legal address: not applicable; all interaction is carried out remotely.",

      heroTitle: "Visual content for business without constant photoshoots",
      heroLead:
        "We create images and videos for social media, advertising, websites and launches",
      ctaOrder: "Start a project",
      ctaAudience: "Who we work with",

      fmtEye: "Formats",
      fmtImages: "Images",
      fmtVideos: "Videos",
      fmtPacks: "Content Packs",
      fmtCustom: "Custom Production",

      whoEye: "Audience",
      whoTitle: "Who we work with",
      whoLead: "Open a category to see example films for your niche.",
      examplesLabel: "Examples",
      exampleEmpty: "Example coming soon",
      prevExample: "Prev",
      nextExample: "Next",
      openExample: "View example",

      showEye: "Showcase",
      showTitle: "Selected work",
      showLead: "A short mixed stream of LAV Visual Studio — interiors, product, light, architecture.",

      calcEye: "Order",
      calcTitle: "Calculator",
      calcLead: "Choose a format, enter quantity, see the estimate.",
      tabImages: "Images",
      tabVideos: "Videos",
      tabPack: "Content Pack",
      qtyImages: "Number of images",
      qtyVideos: "Number of videos",
      packImages: "Images",
      packVideos: "Videos",
      sumFormat: "Format",
      sumQty: "Quantity",
      sumEta: "Timeline",
      sumTotal: "Total",
      ctaPay: "Place order",
      etaNote:
        "Standard orders — within 48 hours after receiving the complete brief and source materials. Large orders are quoted individually.",
      draftHint: "Draft prices — confirm before public campaign.",
      customHint: "Large volume — we will confirm the quote individually.",
      fmtLabelImages: "Images",
      fmtLabelVideos: "Videos",
      fmtLabelPack: "Content Pack",
      qtyImagesN: (n) => `${n} images`,
      qtyVideosN: (n) => `${n} videos`,
      qtyPackN: (i, v) => `${i} images + ${v} videos`,

      howEye: "Process",
      howTitle: "How it works",
      how1T: "Choose a format",
      how2T: "Share materials",
      how3T: "Receive finished content",

      finalEye: "Next",
      finalTitle: "Ready to start",
      finalLead: "Standard orders go through the calculator. Custom production — write to us.",
      ctaOrderNow: "Order now",
      ctaCustom: "Custom project",
      ctaEmail: "Email",

      payPendingTitle: "LAV Visual Studio order",
      payPendingBody: (o) =>
        `Hello LAV Visual Studio,%0A%0AI would like to order:%0A- Format: ${o.format}%0A- Details: ${o.details}%0A- Total: ${o.total}%0A- Timeline: ${o.eta}%0A%0AI will attach brief / references in the next message.`
    },
    ru: {
      navPortfolio: "Портфолио",
      navAbout: "Обо мне",
      navProcess: "Процесс",
      navPricing: "Стоимость",
      navVisualStudio: "LAV Visual Studio",
      brandSub: "Дизайн интерьера и архитектура",
      footDesc2:
        "Современный editorial luxury подход к интерьеру, архитектуре, ландшафту и коммерческим пространствам.",
      legalOfferNote:
        "Условия оплаты, договор, сроки и точный объём услуг обсуждаются отдельно вне сайта. Информация на сайте носит ознакомительный характер и не является публичной офертой.",
      footContact: "Контакты",
      privacyLink: "Политика конфиденциальности",
      termsLink: "Пользовательское соглашение",
      cookiesLink: "Политика cookies",
      cookieSettings: "Настройки cookies",
      legalInfoText:
        "Проект: LAV Interiors. Сайт: lavinteriors.pro. Email: hello@lavinteriors.pro. Оператор: физическое лицо, работающее под брендом LAV Interiors. Юридический адрес: не применимо; взаимодействие ведётся дистанционно.",

      heroTitle: "Визуальный контент для бизнеса без постоянных съёмок",
      heroLead:
        "Создаём изображения и видео для соцсетей, рекламы, сайтов и запусков",
      ctaOrder: "Заказать",
      ctaAudience: "С кем работаем",

      fmtEye: "Форматы",
      fmtImages: "Изображения",
      fmtVideos: "Видео",
      fmtPacks: "Контент-пакеты",
      fmtCustom: "Индивидуальный продакшн",

      whoEye: "Аудитория",
      whoTitle: "С кем мы работаем",
      whoLead: "Откройте категорию — и посмотрите пример ролика для вашей ниши.",
      examplesLabel: "Примеры",
      exampleEmpty: "Пример скоро появится",
      prevExample: "Назад",
      nextExample: "Далее",
      openExample: "Смотреть пример",

      showEye: "Витрина",
      showTitle: "Избранные работы",
      showLead: "Короткий общий поток LAV Visual Studio — интерьер, продукт, свет, архитектура.",

      calcEye: "Заказ",
      calcTitle: "Калькулятор",
      calcLead: "Выберите формат, введите количество и увидьте стоимость.",
      tabImages: "Изображения",
      tabVideos: "Видео",
      tabPack: "Контент-пакет",
      qtyImages: "Количество изображений",
      qtyVideos: "Количество видео",
      packImages: "Изображений",
      packVideos: "Видео",
      sumFormat: "Формат",
      sumQty: "Количество",
      sumEta: "Срок",
      sumTotal: "Итого",
      ctaPay: "Оформить заказ",
      etaNote:
        "Стандартные заказы — до 48 часов после получения полного брифа и исходных материалов. Крупные заказы рассчитываются индивидуально.",
      draftHint: "Черновые цены — подтвердите перед публичной кампанией.",
      customHint: "Крупный объём — стоимость подтвердим индивидуально.",
      fmtLabelImages: "Изображения",
      fmtLabelVideos: "Видео",
      fmtLabelPack: "Контент-пакет",
      qtyImagesN: (n) => `${n} изображений`,
      qtyVideosN: (n) => `${n} видео`,
      qtyPackN: (i, v) => `${i} изображений + ${v} видео`,

      howEye: "Процесс",
      howTitle: "Как это работает",
      how1T: "Выбираете формат",
      how2T: "Передаёте материалы",
      how3T: "Получаете готовый контент",

      finalEye: "Дальше",
      finalTitle: "Готовы начать",
      finalLead: "Стандартные заказы — через калькулятор. Индивидуальный продакшн — напишите нам.",
      ctaOrderNow: "Заказать",
      ctaCustom: "Индивидуальный проект",
      ctaEmail: "Email",

      payPendingTitle: "Заказ LAV Visual Studio",
      payPendingBody: (o) =>
        `Здравствуйте, LAV Visual Studio,%0A%0AХочу оформить заказ:%0A- Формат: ${o.format}%0A- Детали: ${o.details}%0A- Итого: ${o.total}%0A- Срок: ${o.eta}%0A%0AБриф / референсы приложу следующим сообщением.`
    }
  };

  const state = {
    lang: localStorage.getItem("lavLang") || "en",
    mode: "images",
    imgQty: 5,
    vidQty: 1,
    packImg: 5,
    packVid: 1,
    openCat: null,
    catIndex: {},
    order: null
  };

  function t(key) {
    const pack = I18N[state.lang] || I18N.en;
    const val = pack[key];
    return val !== undefined ? val : I18N.en[key] ?? key;
  }

  function loc(obj) {
    if (!obj) return "";
    return obj[state.lang] || obj.en || "";
  }

  function money(n) {
    const v = Math.round(Number(n) || 0);
    const sym =
      window.LAV_VS_PRICING?.currencySymbol?.[state.lang] ||
      window.LAV_VS_PRICING?.currencySymbol?.en ||
      "₽";
    return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " " + sym;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function discountPercent(qty, table) {
    let pct = 0;
    (table || []).forEach((row) => {
      if (qty >= row.minQty) pct = row.percentOff;
    });
    return pct;
  }

  function applyI18n() {
    document.documentElement.setAttribute("data-lang", state.lang);
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (typeof val === "string") el.textContent = val;
    });
    document.querySelectorAll("[data-lav-i18n]").forEach((el) => {
      const key = el.getAttribute("data-lav-i18n");
      const val = t(key);
      if (typeof val === "string") el.textContent = val;
    });
    document.getElementById("langEN")?.classList.toggle("active", state.lang === "en");
    document.getElementById("langRU")?.classList.toggle("active", state.lang === "ru");
    document.title =
      state.lang === "ru"
        ? "LAV Visual Studio — визуальный контент для бизнеса"
        : "LAV Visual Studio — visual content for business";
    renderCategories();
    renderShowcase();
    recalc();
  }

  function priceFor() {
    const cfg = window.LAV_VS_PRICING;
    if (!cfg) return null;
    const eta = loc(cfg.etaLabel) || t("etaNote");

    if (state.mode === "pack") {
      const i = state.packImg;
      const v = state.packVid;
      let total =
        i * cfg.pricePerImage + v * cfg.pricePerVideo;
      total = Math.round(total * (1 - (cfg.packDiscount || 0)));
      total = Math.max(total, cfg.minimumOrder || 0);
      const over =
        i >= (cfg.customThreshold?.images || 9999) ||
        v >= (cfg.customThreshold?.videos || 9999);
      return {
        format: t("fmtLabelPack"),
        details: t("qtyPackN")(i, v),
        total,
        eta,
        over,
        sku: `pack-${i}x${v}`
      };
    }

    if (state.mode === "videos") {
      const qty = state.vidQty;
      const pct = discountPercent(qty, cfg.volumeDiscounts?.videos);
      let total = Math.round(cfg.pricePerVideo * qty * (1 - pct / 100));
      total = Math.max(total, cfg.minimumOrder || 0);
      return {
        format: t("fmtLabelVideos"),
        details: t("qtyVideosN")(qty),
        total,
        eta,
        over: qty >= (cfg.customThreshold?.videos || 9999),
        sku: `videos-${qty}`
      };
    }

    const qty = state.imgQty;
    const pct = discountPercent(qty, cfg.volumeDiscounts?.images);
    let total = Math.round(cfg.pricePerImage * qty * (1 - pct / 100));
    total = Math.max(total, cfg.minimumOrder || 0);
    return {
      format: t("fmtLabelImages"),
      details: t("qtyImagesN")(qty),
      total,
      eta,
      over: qty >= (cfg.customThreshold?.images || 9999),
      sku: `images-${qty}`
    };
  }

  function recalc() {
    const order = priceFor();
    state.order = order;
    if (!order) return;
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("sumFormat", order.format);
    set("sumQty", order.details);
    set("sumEta", order.eta);
    set("sumTotal", money(order.total));
    const draft = document.getElementById("draftHint");
    if (draft) draft.hidden = !window.LAV_VS_PRICING?.draft;
    const custom = document.getElementById("customHint");
    if (custom) custom.hidden = !order.over;
  }

  function syncQtyInputs() {
    const img = document.getElementById("imgQtyInput");
    const vid = document.getElementById("vidQtyInput");
    const pImg = document.getElementById("packImgInput");
    const pVid = document.getElementById("packVidInput");
    if (img) img.value = String(state.imgQty);
    if (vid) vid.value = String(state.vidQty);
    if (pImg) pImg.value = String(state.packImg);
    if (pVid) pVid.value = String(state.packVid);
    document.querySelectorAll("[data-quick-images]").forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.quickImages) === state.imgQty);
    });
    document.querySelectorAll("[data-quick-videos]").forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.quickVideos) === state.vidQty);
    });
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll(".vs-tabs .tab").forEach((tab) => {
      tab.classList.toggle("active", tab.getAttribute("data-mode") === mode);
    });
    document.getElementById("panelImages").hidden = mode !== "images";
    document.getElementById("panelVideos").hidden = mode !== "videos";
    document.getElementById("panelPack").hidden = mode !== "pack";
    recalc();
  }

  function renderQuickChips() {
    const cfg = window.LAV_VS_PRICING;
    const imgBox = document.getElementById("imgQuick");
    const vidBox = document.getElementById("vidQuick");
    if (imgBox) {
      imgBox.innerHTML = (cfg.quickQty?.images || [])
        .map(
          (n) =>
            `<button type="button" class="chip" data-quick-images="${n}">${n}</button>`
        )
        .join("");
      imgBox.querySelectorAll("[data-quick-images]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.imgQty = Number(btn.dataset.quickImages);
          syncQtyInputs();
          recalc();
        });
      });
    }
    if (vidBox) {
      vidBox.innerHTML = (cfg.quickQty?.videos || [])
        .map(
          (n) =>
            `<button type="button" class="chip" data-quick-videos="${n}">${n}</button>`
        )
        .join("");
      vidBox.querySelectorAll("[data-quick-videos]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.vidQty = Number(btn.dataset.quickVideos);
          syncQtyInputs();
          recalc();
        });
      });
    }
  }

  function bindQty(id, key, limitsKey) {
    const input = document.getElementById(id);
    const cfg = window.LAV_VS_PRICING;
    const lim = cfg.qtyLimits?.[limitsKey] || { min: 0, max: 999 };
    const read = () => {
      const n = parseInt(input.value, 10);
      state[key] = clamp(Number.isFinite(n) ? n : lim.min, lim.min, lim.max);
      syncQtyInputs();
      recalc();
    };
    input?.addEventListener("input", read);
    input?.addEventListener("change", read);
    document.querySelectorAll(`[data-qty-for="${id}"]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        const delta = Number(btn.dataset.delta) || 0;
        state[key] = clamp(state[key] + delta, lim.min, lim.max);
        syncQtyInputs();
        recalc();
      });
    });
  }

  function renderCategories() {
    const root = document.getElementById("vsCats");
    const cats = window.LAV_VS_CATEGORIES || [];
    if (!root) return;

    root.innerHTML = cats
      .map((cat) => {
        const open = state.openCat === cat.id;
        const examples = cat.examples || [];
        const idx = state.catIndex[cat.id] || 0;
        const ex = examples[idx];
        const countLabel =
          examples.length > 0
            ? `${t("examplesLabel")} · ${idx + 1}/${examples.length}`
            : t("exampleEmpty");

        let media = `<div class="vs-cat__empty">${t("exampleEmpty")}</div>`;
        if (ex?.video) {
          media = `<video playsinline controls preload="metadata" ${
            ex.poster ? `poster="${ex.poster}"` : ""
          } src="${ex.video}"></video>`;
        } else if (ex?.poster || ex?.image) {
          media = `<img src="${ex.poster || ex.image}" alt=""/>`;
        }

        const caption = ex
          ? `<div class="vs-cat__caption"><strong>${loc(ex.title)}</strong>${
              ex.description ? ` — ${loc(ex.description)}` : ""
            }</div>`
          : "";

        const nav =
          examples.length > 1
            ? `<div class="vs-cat__nav">
                <button type="button" class="chip" data-cat-prev="${cat.id}">${t(
                  "prevExample"
                )}</button>
                <span style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.55">${
                  idx + 1
                } / ${examples.length}</span>
                <button type="button" class="chip" data-cat-next="${cat.id}">${t(
                  "nextExample"
                )}</button>
              </div>`
            : "";

        return `<button type="button" class="vs-cat molding${
          open ? " is-open" : ""
        }" data-cat="${cat.id}" aria-expanded="${open}">
          <div class="vs-cat__head">
            <h3>${loc(cat.title)}</h3>
            <p>${loc(cat.blurb)}</p>
            <div class="vs-cat__meta">${countLabel}</div>
          </div>
          <div class="vs-cat__body">
            <div class="vs-cat__player">${media}</div>
            ${caption}
            ${nav}
          </div>
        </button>`;
      })
      .join("");

    root.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (e.target.closest("[data-cat-prev],[data-cat-next]")) return;
        const id = btn.getAttribute("data-cat");
        state.openCat = state.openCat === id ? null : id;
        if (state.catIndex[id] == null) state.catIndex[id] = 0;
        renderCategories();
      });
    });
    root.querySelectorAll("[data-cat-prev]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-cat-prev");
        const cat = cats.find((c) => c.id === id);
        const len = cat?.examples?.length || 0;
        if (!len) return;
        state.catIndex[id] = ((state.catIndex[id] || 0) - 1 + len) % len;
        renderCategories();
      });
    });
    root.querySelectorAll("[data-cat-next]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-cat-next");
        const cat = cats.find((c) => c.id === id);
        const len = cat?.examples?.length || 0;
        if (!len) return;
        state.catIndex[id] = ((state.catIndex[id] || 0) + 1) % len;
        renderCategories();
      });
    });
  }

  function renderShowcase() {
    const rail = document.getElementById("vsRail");
    const items = window.LAV_VS_SHOWCASE || [];
    if (!rail) return;
    rail.innerHTML = items
      .map((item) => {
        let media = `<div class="ph">—</div>`;
        if (item.type === "video" && item.src) {
          media = `<video muted playsinline loop preload="metadata" ${
            item.poster ? `poster="${item.poster}"` : ""
          } src="${item.src}"></video>`;
        } else if (item.src) {
          media = `<img src="${item.src}" alt="${loc(item.title)}" loading="lazy"/>`;
        }
        return `<article class="vs-rail-item">
          <div class="media">${media}</div>
          <div class="info">
            <div class="tag">${loc(item.tag) || ""}</div>
            <div class="title">${loc(item.title) || ""}</div>
          </div>
        </article>`;
      })
      .join("");

    rail.querySelectorAll("video").forEach((v) => {
      const play = () => v.play().catch(() => {});
      v.addEventListener("mouseenter", play);
      v.addEventListener("touchstart", play, { passive: true });
    });
  }

  function startCheckout() {
    const order = state.order || priceFor();
    if (!order) return;
    const prodamus = window.LAV_VS_PRODAMUS || {};
    if (prodamus.enabled && prodamus.paymentBaseUrl && prodamus.shopId) {
      const url = new URL(prodamus.paymentBaseUrl);
      url.searchParams.set("shop_id", prodamus.shopId);
      url.searchParams.set("order_id", `vs-${Date.now()}`);
      url.searchParams.set("products[0][name]", `LAV Visual Studio — ${order.format}`);
      url.searchParams.set("products[0][price]", String(order.total));
      url.searchParams.set("products[0][quantity]", "1");
      url.searchParams.set("currency", prodamus.currency || "rub");
      url.searchParams.set("urlSuccess", prodamus.successUrl || location.href);
      url.searchParams.set("urlFail", prodamus.failUrl || location.href);
      window.location.href = url.toString();
      return;
    }
    const body = t("payPendingBody")({
      format: order.format,
      details: order.details,
      total: money(order.total),
      eta: order.eta
    });
    window.location.href =
      "mailto:hello@lavinteriors.pro?subject=" +
      encodeURIComponent(t("payPendingTitle")) +
      "&body=" +
      body;
  }

  document.getElementById("langEN")?.addEventListener("click", () => {
    state.lang = "en";
    localStorage.setItem("lavLang", "en");
    applyI18n();
  });
  document.getElementById("langRU")?.addEventListener("click", () => {
    state.lang = "ru";
    localStorage.setItem("lavLang", "ru");
    applyI18n();
  });
  document.querySelectorAll(".vs-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.getAttribute("data-mode")));
  });
  document.getElementById("btnPay")?.addEventListener("click", startCheckout);

  renderQuickChips();
  bindQty("imgQtyInput", "imgQty", "images");
  bindQty("vidQtyInput", "vidQty", "videos");
  bindQty("packImgInput", "packImg", "packImages");
  bindQty("packVidInput", "packVid", "packVideos");
  syncQtyInputs();
  applyI18n();
  setMode("images");
})();
