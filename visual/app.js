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

      fmtEye: "Format",
      fmtImages: "Images",
      fmtVideos: "Videos",
      fmtPacks: "Content Packs",
      fmtCustom: "Custom Production",

      workTitle: "Our work",
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
      calcLead: "Choose images, video, or both — enter quantity and duration.",
      tabImages: "Images",
      tabVideos: "Videos",
      tabBoth: "Images + Videos",
      qtyImages: "Quantity",
      qtyVideos: "Quantity",
      durationLabel: "Duration",
      durUpTo30: "Up to 30 sec",
      dur31to60: "31–60 sec",
      dur61to90: "61–90 sec",
      durOver90: "Over 90 sec",
      lineImages: "Images",
      lineVideos: "Videos",
      lineVideosDur: {
        upTo30: "Videos up to 30 sec",
        from31to60: "Videos 31–60 sec",
        from61to90: "Videos 61–90 sec",
        over90: "Videos over 90 sec"
      },
      lineSubtotal: "Subtotal",
      lineDiscountPack: "Content Pack −7%",
      lineDiscountLarge: "Large order −10%",
      sumEta: "Timeline",
      sumTotal: "Total",
      ctaPay: "Order Now",
      ctaDiscuss: "Discuss project",
      customQuote: "Individual quote",
      packHint: "Better value when ordering a series of images and videos",
      etaNote:
        "Timeline is calculated after receiving the complete brief and all source materials. Large and non-standard orders are agreed individually.",
      draftHint: "Draft prices — confirm before public campaign.",
      customHint: "Individual quote required for this duration.",

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
        `Hello LAV Visual Studio,%0A%0AI would like to order:%0A- Details: ${o.details}%0A- Total: ${o.total}%0A- Timeline: ${o.eta}%0A%0AI will attach brief / references in the next message.`
    },
    ru: {
      navPortfolio: "Портфолио",
      navAbout: "Обо мне",
      navProcess: "Процесс",
      navPricing: "Стоимость",
      navVisualStudio: "LAV Visual Studio",
      brandSub: "Дизайн интерьера и архитектура",
      footDesc2:
        "Современный редакционный подход к интерьеру, архитектуре, ландшафту и коммерческим пространствам.",
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

      fmtEye: "Формат",
      fmtImages: "Изображения",
      fmtVideos: "Видео",
      fmtPacks: "Контент-пакеты",
      fmtCustom: "Индивидуальный продакшн",

      workTitle: "Наша работа",
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
      calcLead: "Выберите изображения, видео или оба — укажите количество и длительность.",
      tabImages: "Изображения",
      tabVideos: "Видео",
      tabBoth: "Изображения + видео",
      qtyImages: "Количество",
      qtyVideos: "Количество",
      durationLabel: "Длительность",
      durUpTo30: "До 30 сек",
      dur31to60: "31–60 сек",
      dur61to90: "61–90 сек",
      durOver90: "Более 90 сек",
      lineImages: "Изображения",
      lineVideos: "Видео",
      lineVideosDur: {
        upTo30: "Видео до 30 сек",
        from31to60: "Видео 31–60 сек",
        from61to90: "Видео 61–90 сек",
        over90: "Видео более 90 сек"
      },
      lineSubtotal: "Стоимость",
      lineDiscountPack: "Content Pack −7%",
      lineDiscountLarge: "Скидка за большой заказ −10%",
      sumEta: "Срок",
      sumTotal: "Итого",
      ctaPay: "Оформить заказ",
      ctaDiscuss: "Обсудить проект",
      customQuote: "Индивидуальный расчёт",
      packHint: "Выгоднее при заказе серии изображений и видео",
      etaNote:
        "Срок рассчитывается после получения полного брифа и всех исходных материалов. Срок крупных и нестандартных заказов согласовывается индивидуально.",
      draftHint: "Черновые цены — подтвердите перед публичной кампанией.",
      customHint: "Для этой длительности нужен индивидуальный расчёт.",

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
        `Здравствуйте, LAV Visual Studio,%0A%0AХочу оформить заказ:%0A- Детали: ${o.details}%0A- Итого: ${o.total}%0A- Срок: ${o.eta}%0A%0AБриф / референсы приложу следующим сообщением.`
    }
  };

  const state = {
    lang: localStorage.getItem("lavLang") || "en",
    mode: "images",
    imgQty: 1,
    vidQty: 1,
    durationKey: "upTo30",
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
    syncDurationSeg();
    recalc();
  }

  function activeQtys() {
    if (state.mode === "images") return { images: state.imgQty, videos: 0 };
    if (state.mode === "videos") return { images: 0, videos: state.vidQty };
    return { images: state.imgQty, videos: state.vidQty };
  }

  function priceFor() {
    const cfg = window.LAV_VS_PRICING;
    if (!cfg || typeof cfg.computeQuote !== "function") return null;
    const q = activeQtys();
    const quote = cfg.computeQuote({
      images: q.images,
      videos: q.videos,
      durationKey: state.durationKey
    });

    const eta =
      quote.etaKey === "etaCustom"
        ? loc(cfg.etaCustom) || t("customQuote")
        : loc(cfg.etaLabel);

    const detailsParts = [];
    if (quote.images > 0) detailsParts.push(`${quote.images}× ${t("lineImages")}`);
    if (quote.videos > 0) {
      const durMap = t("lineVideosDur");
      detailsParts.push(
        `${quote.videos}× ${(durMap && durMap[quote.durationKey]) || t("lineVideos")}`
      );
    }

    return {
      ...quote,
      format: state.mode,
      details: detailsParts.join(" + ") || "—",
      eta,
      totalDisplay: quote.customVideo ? t("customQuote") : money(quote.total),
      sku: `vs-${state.mode}-${quote.images}i-${quote.videos}v-${quote.durationKey}`
    };
  }

  function renderBreakdown(order) {
    const root = document.getElementById("vsBreakdown");
    if (!root || !order) return;
    const lines = [];

    if (order.images > 0) {
      lines.push(
        `<div class="line"><span class="k">${t("lineImages")}<br>${order.images} × ${money(
          order.imageUnit
        )}</span><span class="v">${money(order.imagesTotal)}</span></div>`
      );
    }

    if (order.videos > 0) {
      const durMap = t("lineVideosDur");
      const label = (durMap && durMap[order.durationKey]) || t("lineVideos");
      if (order.customVideo) {
        lines.push(
          `<div class="line is-custom"><span class="k">${label}<br>${order.videos} × —</span><span class="v">${t(
            "customQuote"
          )}</span></div>`
        );
      } else {
        lines.push(
          `<div class="line"><span class="k">${label}<br>${order.videos} × ${money(
            order.videoUnit
          )}</span><span class="v">${money(order.videosTotal)}</span></div>`
        );
      }
    }

    if (!order.customVideo && (order.images > 0 || order.videos > 0)) {
      lines.push(
        `<div class="line is-sub"><span class="k">${t("lineSubtotal")}</span><span class="v">${money(
          order.subtotal
        )}</span></div>`
      );
      if (order.discountKind === "contentPack") {
        lines.push(
          `<div class="line is-disc"><span class="k">${t("lineDiscountPack")}</span><span class="v">−${money(
            order.discountAmount
          )}</span></div>`
        );
      } else if (order.discountKind === "largeOrder") {
        lines.push(
          `<div class="line is-disc"><span class="k">${t("lineDiscountLarge")}</span><span class="v">−${money(
            order.discountAmount
          )}</span></div>`
        );
      }
    }

    root.innerHTML = lines.join("");
  }

  function recalc() {
    const order = priceFor();
    state.order = order;
    if (!order) return;

    renderBreakdown(order);

    const etaEl = document.getElementById("sumEta");
    const totalEl = document.getElementById("sumTotal");
    if (etaEl) etaEl.textContent = order.eta;
    if (totalEl) totalEl.textContent = order.customVideo ? t("customQuote") : money(order.total);

    const draft = document.getElementById("draftHint");
    if (draft) draft.hidden = !window.LAV_VS_PRICING?.draft;

    const custom = document.getElementById("customHint");
    if (custom) custom.hidden = !order.customVideo;

    const packHint = document.getElementById("packHint");
    if (packHint) {
      packHint.hidden = !(order.packEligible && order.discountKind === "contentPack");
    }

    const btnPay = document.getElementById("btnPay");
    const btnDiscuss = document.getElementById("btnDiscuss");
    if (btnPay) btnPay.hidden = !!order.customVideo;
    if (btnDiscuss) btnDiscuss.hidden = !order.customVideo;
  }

  function syncQtyInputs() {
    const img = document.getElementById("imgQtyInput");
    const vid = document.getElementById("vidQtyInput");
    if (img) img.value = String(state.imgQty);
    if (vid) vid.value = String(state.vidQty);
  }

  function syncDurationSeg() {
    document.querySelectorAll("#durationSeg .seg").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-duration") === state.durationKey);
    });
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll(".vs-tabs .tab").forEach((tab) => {
      tab.classList.toggle("active", tab.getAttribute("data-mode") === mode);
    });
    const showImages = mode === "images" || mode === "both";
    const showVideos = mode === "videos" || mode === "both";
    const panelImages = document.getElementById("panelImages");
    const panelVideos = document.getElementById("panelVideos");
    if (panelImages) panelImages.hidden = !showImages;
    if (panelVideos) panelVideos.hidden = !showVideos;
    // Ensure both panels remain usable in "both" mode (stack in same column)
    if (mode === "both" && panelImages && panelVideos) {
      panelVideos.hidden = false;
      panelImages.hidden = false;
    }
    recalc();
  }

  function bindQty(id, key, limitsKey) {
    const input = document.getElementById(id);
    const cfg = window.LAV_VS_PRICING;
    const lim = cfg?.qtyLimits?.[limitsKey] || { min: 0, max: 999 };
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
    if (!order || order.customVideo) return;
    const prodamus = window.LAV_VS_PRODAMUS || {};
    if (prodamus.enabled && prodamus.paymentBaseUrl && prodamus.shopId) {
      const url = new URL(prodamus.paymentBaseUrl);
      url.searchParams.set("shop_id", prodamus.shopId);
      url.searchParams.set("order_id", `vs-${Date.now()}`);
      url.searchParams.set("products[0][name]", `LAV Visual Studio — ${order.details}`);
      url.searchParams.set("products[0][price]", String(order.total));
      url.searchParams.set("products[0][quantity]", "1");
      url.searchParams.set("currency", prodamus.currency || "rub");
      url.searchParams.set("urlSuccess", prodamus.successUrl || location.href);
      url.searchParams.set("urlFail", prodamus.failUrl || location.href);
      window.location.href = url.toString();
      return;
    }
    const body = t("payPendingBody")({
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
  document.querySelectorAll("#durationSeg .seg").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.durationKey = btn.getAttribute("data-duration") || "upTo30";
      syncDurationSeg();
      recalc();
    });
  });
  document.getElementById("btnPay")?.addEventListener("click", startCheckout);

  bindQty("imgQtyInput", "imgQty", "images");
  bindQty("vidQtyInput", "vidQty", "videos");
  syncQtyInputs();
  syncDurationSeg();
  applyI18n();
  setMode("images");
})();
