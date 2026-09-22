/* LAV Visual Studio page logic — i18n + calculator + Prodamus stub */
(function () {
  const I18N = {
    en: {
      navPortfolio: "Portfolio",
      navAbout: "About",
      navProcess: "Process",
      navPricing: "Pricing",
      navVisualStudio: "LAV Visual Studio",
      brandSub: "Interior Design & Architecture",
      heroTitle: "Premium visual content without constant photoshoots.",
      heroLead: "Images and cinematic videos for social media, advertising, websites and launches.",
      ctaOrder: "Start a Project",
      ctaWho: "Who it’s for",
      whoEye: "For whom",
      whoTitle: "Who we work with",
      whoLead: "Find your category — and see how visual production supports your business.",
      who1T: "Interior Designers",
      who1D: "Content to present and promote projects.",
      who2T: "Furniture & Kitchen Brands",
      who2D: "Product in a finished interior — without constant shoots.",
      who3T: "Lighting & Interior Brands",
      who3D: "Campaign visuals and lifestyle frames for collections.",
      who4T: "Architecture Studios",
      who4D: "Atmospheric storytelling for concepts and exteriors.",
      who5T: "Real Estate & Developers",
      who5D: "Future object and lifestyle — before construction ends.",
      who6T: "Creative / Marketing Agencies",
      who6D: "External visual production for client projects.",
      showEye: "Selected frames",
      showTitle: "A glimpse of the work",
      showLead: "A compact showcase — add images and videos here as the library grows.",
      showPlaceholder: "Video / hero frame placeholder",
      showPlaceholderShort: "Frame",
      whatEye: "What we create",
      whatTitle: "Images · Videos · Packs",
      whatLead: "Three clear formats — plus custom production for larger brands and ongoing needs.",
      prod1T: "Images",
      prod1D: "Series for social media, websites, advertising, launches and presentations.",
      prod2T: "Videos",
      prod2D: "Short cinematic / social-first films for Reels, TikTok, ads and product stories.",
      prod3T: "Content Packs",
      prod3D: "Images + videos as one visual system — coherent across channels.",
      prod4T: "Custom / Ongoing Production",
      prod4D: "Large series, brand systems, agencies and developers — quote-based.",
      ctaQuote: "Request a Quote",
      calcEye: "Order",
      calcTitle: "Calculator & instant order",
      calcLead: "Choose a format, see the estimate, then proceed to order.",
      etaNote:
        "Standard delivery: within 48 hours after receiving the complete brief and source materials. Large or non-standard orders — timeline individually.",
      tabImages: "Images",
      tabVideos: "Videos",
      tabPacks: "Content Pack",
      pickQty: "Select quantity",
      pickPack: "Select a pack",
      customQty: "Custom quantity",
      sumFormat: "Format",
      sumQty: "Quantity",
      sumEta: "Timeline",
      sumTotal: "Total",
      draftHint: "Draft prices — confirm before public campaign.",
      ctaPay: "Order & Pay",
      payNote:
        "Online payment connects via Prodamus. Until keys are set, the order opens a prepared email brief.",
      howEye: "Process",
      howTitle: "How it works",
      how1T: "Choose a format",
      how1D: "Images / Videos / Content Pack",
      how2T: "Share materials",
      how2D: "Project, product, references, brand assets or source files.",
      how3T: "Receive content",
      how3D: "Ready assets for publishing and commercial use.",
      finalEye: "Next step",
      finalTitle: "Ready to start",
      finalLead: "Standard packages go through the calculator. Non-standard or ongoing production — write to us.",
      ctaOrderNow: "Order Now",
      ctaCustom: "Start a Custom Project",
      ctaEmail: "Email",
      navContact: "Contact",
      navPrivacy: "Privacy",
      etaHours: (h) => (h <= 48 ? "within 48 hours" : `about ${h} hours`),
      fmtImages: "Images",
      fmtVideos: "Videos",
      fmtPack: "Content Pack",
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
      heroTitle: "Визуальный контент для бизнеса без постоянных съёмок.",
      heroLead: "Создаём изображения и видео для соцсетей, рекламы, сайтов и запусков.",
      ctaOrder: "Заказать",
      ctaWho: "Для кого",
      whoEye: "Для кого",
      whoTitle: "С кем мы работаем",
      whoLead: "Найдите свою категорию — и сразу увидите, как visual production усиливает ваш бизнес.",
      who1T: "Интерьерные дизайнеры и студии",
      who1D: "Контент для презентации и продвижения проектов.",
      who2T: "Мебельные и кухонные бренды",
      who2D: "Продукт в готовой интерьерной среде — без постоянных съёмок.",
      who3T: "Свет и интерьерные бренды",
      who3D: "Кампании и lifestyle-кадры для коллекций.",
      who4T: "Архитектурные бюро",
      who4D: "Атмосферная подача концепций и экстерьеров.",
      who5T: "Недвижимость и девелоперы",
      who5D: "Будущий объект и образ жизни ещё до реализации.",
      who6T: "Креативные и маркетинговые агентства",
      who6D: "Внешний visual production для клиентских проектов.",
      showEye: "Кадры",
      showTitle: "Короткий показ работ",
      showLead: "Компактная витрина — позже сюда легко добавить новые изображения и видео.",
      showPlaceholder: "Плейсхолдер видео / главного кадра",
      showPlaceholderShort: "Кадр",
      whatEye: "Что создаём",
      whatTitle: "Images · Videos · Packs",
      whatLead: "Три понятных формата — и custom production для крупных брендов и регулярного контента.",
      prod1T: "Images",
      prod1D: "Серии для соцсетей, сайтов, рекламы, запусков и презентаций.",
      prod2T: "Videos",
      prod2D: "Короткие cinematic / social-first видео для Reels, TikTok, рекламы и презентации продукта.",
      prod3T: "Content Packs",
      prod3D: "Изображения + видео как одна визуальная система.",
      prod4T: "Custom / Ongoing Production",
      prod4D: "Большие серии, бренды, агентства и девелоперы — по запросу.",
      ctaQuote: "Обсудить проект",
      calcEye: "Заказ",
      calcTitle: "Калькулятор и оформление",
      calcLead: "Выберите формат, увидьте стоимость и перейдите к заказу.",
      etaNote:
        "Результат — до 48 часов после получения полного брифа и исходных материалов. Крупные и нестандартные заказы — сроки индивидуально.",
      tabImages: "Images",
      tabVideos: "Videos",
      tabPacks: "Content Pack",
      pickQty: "Выберите количество",
      pickPack: "Выберите пакет",
      customQty: "Своё количество",
      sumFormat: "Формат",
      sumQty: "Количество",
      sumEta: "Срок",
      sumTotal: "Итого",
      draftHint: "Черновые цены — подтвердите перед публичной кампанией.",
      ctaPay: "Оформить заказ",
      payNote:
        "Онлайн-оплата подключается через Prodamus. Пока ключи не заданы, заказ открывает подготовленное письмо.",
      howEye: "Процесс",
      howTitle: "Как это работает",
      how1T: "Вы выбираете формат",
      how1D: "Images / Videos / Content Pack",
      how2T: "Передаёте материалы",
      how2D: "Проект, продукт, референсы, бренд-материалы или исходники.",
      how3T: "Получаете готовый контент",
      how3D: "Материалы для публикации и коммерческого использования.",
      finalEye: "Дальше",
      finalTitle: "Готовы начать",
      finalLead: "Стандартные пакеты — через калькулятор. Нестандартный или регулярный production — напишите нам.",
      ctaOrderNow: "Выбрать пакет",
      ctaCustom: "Обсудить проект",
      ctaEmail: "Email",
      navContact: "Контакты",
      navPrivacy: "Конфиденциальность",
      etaHours: (h) => (h <= 48 ? "до 48 часов" : `около ${h} часов`),
      fmtImages: "Images",
      fmtVideos: "Videos",
      fmtPack: "Content Pack",
      payPendingTitle: "Заказ LAV Visual Studio",
      payPendingBody: (o) =>
        `Здравствуйте, LAV Visual Studio,%0A%0AХочу оформить заказ:%0A- Формат: ${o.format}%0A- Детали: ${o.details}%0A- Итого: ${o.total}%0A- Срок: ${o.eta}%0A%0AБриф / референсы приложу следующим сообщением.`
    }
  };

  const state = {
    lang: localStorage.getItem("lavLang") || "en",
    mode: "images",
    imgKey: 1,
    vidKey: 1,
    packId: "starter",
    order: null
  };

  function t(key) {
    const pack = I18N[state.lang] || I18N.en;
    return pack[key] ?? I18N.en[key] ?? key;
  }

  function money(n) {
    const v = Math.round(Number(n) || 0);
    return "$" + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function applyI18n() {
    document.documentElement.setAttribute("data-lang", state.lang);
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (typeof val === "string") el.textContent = val;
    });
    document.getElementById("langEN")?.classList.toggle("active", state.lang === "en");
    document.getElementById("langRU")?.classList.toggle("active", state.lang === "ru");
    document.title =
      state.lang === "ru"
        ? "LAV Visual Studio — визуальный контент для бизнеса"
        : "LAV Visual Studio — Premium visual content";
    renderChips();
    recalc();
  }

  function discountPercent(qty, table) {
    let pct = 0;
    (table || []).forEach((row) => {
      if (qty >= row.minQty) pct = row.percentOff;
    });
    return pct;
  }

  function priceFor(mode) {
    const cfg = window.LAV_VS_PRICING;
    if (!cfg) return null;

    if (mode === "packs") {
      const pack = cfg.packs.find((p) => p.id === state.packId) || cfg.packs[0];
      return {
        format: t("fmtPack"),
        details: `${pack.title[state.lang] || pack.title.en} · ${pack.images} img + ${pack.videos} vid`,
        total: pack.price,
        eta: t("etaHours")(pack.etaHours),
        etaHours: pack.etaHours,
        sku: pack.id
      };
    }

    const block = mode === "videos" ? cfg.videos : cfg.images;
    const key = mode === "videos" ? state.vidKey : state.imgKey;
    const opt = block.options.find((o) => o.qty === key) || block.options[0];
    let qty = opt.qty;
    let total = opt.price;
    if (qty === "custom") {
      const input = document.getElementById(mode === "videos" ? "vidCustom" : "imgCustom");
      qty = Math.max(1, parseInt(input?.value || "1", 10) || 1);
      const unit = block.customUnitPrice;
      const pct = discountPercent(qty, block.volumeDiscount);
      total = Math.round(unit * qty * (1 - pct / 100));
    }
    return {
      format: mode === "videos" ? t("fmtVideos") : t("fmtImages"),
      details: `${qty} ${block.unitLabel[state.lang] || block.unitLabel.en}`,
      total,
      eta: t("etaHours")(block.etaHours),
      etaHours: block.etaHours,
      sku: `${mode}-${qty}`
    };
  }

  function renderChips() {
    const cfg = window.LAV_VS_PRICING;
    if (!cfg) return;

    const fill = (el, options, active, onPick, isPack) => {
      if (!el) return;
      el.innerHTML = options
        .map((o) => {
          const id = isPack ? o.id : o.qty;
          const label = isPack
            ? `${o.title[state.lang] || o.title.en} — ${money(o.price)}`
            : o.label[state.lang] || o.label.en;
          const activeCls = String(active) === String(id) ? " active" : "";
          return `<button type="button" class="vs-chip${activeCls}" data-id="${id}">${label}</button>`;
        })
        .join("");
      el.querySelectorAll(".vs-chip").forEach((btn) => {
        btn.addEventListener("click", () => onPick(btn.getAttribute("data-id")));
      });
    };

    fill(document.getElementById("imgQty"), cfg.images.options, state.imgKey, (id) => {
      state.imgKey = id === "custom" ? "custom" : Number(id);
      document.getElementById("imgCustomField")?.classList.toggle("show", state.imgKey === "custom");
      renderChips();
      recalc();
    });
    fill(document.getElementById("vidQty"), cfg.videos.options, state.vidKey, (id) => {
      state.vidKey = id === "custom" ? "custom" : Number(id);
      document.getElementById("vidCustomField")?.classList.toggle("show", state.vidKey === "custom");
      renderChips();
      recalc();
    });
    fill(
      document.getElementById("packQty"),
      cfg.packs,
      state.packId,
      (id) => {
        state.packId = id;
        renderChips();
        recalc();
      },
      true
    );

    document.getElementById("imgCustomField")?.classList.toggle("show", state.imgKey === "custom");
    document.getElementById("vidCustomField")?.classList.toggle("show", state.vidKey === "custom");
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll(".vs-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.getAttribute("data-mode") === mode);
    });
    document.getElementById("panelImages").hidden = mode !== "images";
    document.getElementById("panelVideos").hidden = mode !== "videos";
    document.getElementById("panelPacks").hidden = mode !== "packs";
    recalc();
  }

  function recalc() {
    const order = priceFor(state.mode);
    state.order = order;
    if (!order) return;
    document.getElementById("sumFormat").textContent = order.format;
    document.getElementById("sumQty").textContent = order.details;
    document.getElementById("sumEta").textContent = order.eta;
    document.getElementById("sumTotal").textContent = money(order.total);
    const draft = !!window.LAV_VS_PRICING?.draft;
    document.getElementById("draftHint").hidden = !draft;
  }

  function startCheckout() {
    const order = state.order || priceFor(state.mode);
    if (!order) return;
    const prodamus = window.LAV_VS_PRODAMUS || {};
    if (prodamus.enabled && prodamus.paymentBaseUrl && prodamus.shopId) {
      // Integration point: build signed payment URL via backend when available.
      const url = new URL(prodamus.paymentBaseUrl);
      url.searchParams.set("shop_id", prodamus.shopId);
      url.searchParams.set("order_id", `vs-${Date.now()}`);
      url.searchParams.set("products[0][name]", `LAV Visual Studio — ${order.format}`);
      url.searchParams.set("products[0][price]", String(order.total));
      url.searchParams.set("products[0][quantity]", "1");
      url.searchParams.set("currency", prodamus.currency || "usd");
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

  /** Optional showreel fill — put files in /visual/media/ later */
  function hydrateShowreel() {
    const map = {
      main: { type: "video", src: "media/showreel.mp4", poster: "media/showreel.jpg" },
      a: { type: "image", src: "media/frame-a.jpg" },
      b: { type: "image", src: "media/frame-b.jpg" }
    };
    Object.entries(map).forEach(([key, conf]) => {
      const slot = document.querySelector(`[data-slot="${key}"]`);
      if (!slot) return;
      const probe = new Image();
      const testSrc = conf.type === "video" ? conf.poster || conf.src : conf.src;
      probe.onload = () => {
        slot.classList.add("has-media");
        slot.textContent = "";
        if (conf.type === "video") {
          const v = document.createElement("video");
          v.src = conf.src;
          v.muted = true;
          v.playsInline = true;
          v.autoplay = true;
          v.loop = true;
          if (conf.poster) v.poster = conf.poster;
          slot.appendChild(v);
        } else {
          const img = document.createElement("img");
          img.src = conf.src;
          img.alt = "LAV Visual Studio";
          slot.appendChild(img);
        }
      };
      probe.onerror = () => {};
      if (conf.type === "image" || conf.poster) probe.src = testSrc;
    });
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
  document.querySelectorAll(".vs-tab").forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.getAttribute("data-mode")));
  });
  document.getElementById("imgCustom")?.addEventListener("input", recalc);
  document.getElementById("vidCustom")?.addEventListener("input", recalc);
  document.getElementById("btnPay")?.addEventListener("click", startCheckout);

  applyI18n();
  setMode("images");
  hydrateShowreel();
})();
