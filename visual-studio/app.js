import { SPACE_TYPES, STYLES, COLORS, GOALS, CHANGE_LEVELS, LEGACY_CHANGE_LEVELS, DEMO, CREDITS, SHOWCASE, PRESETS } from "/visual-studio/data/catalog.js?v=20261019b";
import { COPY, ROOM_LABELS_RU } from "/visual-studio/i18n.js?v=20261019b";
import { ManifestReferenceProvider, StaticReferenceProvider } from "/visual-studio/services/reference-provider.js?v=20261019b";
import { trackStudioEvent } from "/visual-studio/services/analytics.js";
import { ServerAIProvider } from "/visual-studio/services/ai-provider.js?v=20261019b";
import { HistoryStore, newId } from "/visual-studio/services/history-store.js?v=20261019b";
import { prepareImage, readImageSize, blobToDataURL, urlToBlob, ACCEPTED_TYPES } from "/visual-studio/services/image-utils.js?v=20261019b";

/* ───────────────────────── setup ───────────────────────── */

const services = {
  references: new ManifestReferenceProvider({ manifestUrl: "/visual-studio/data/references_manifest.json?v=20261019b", fallbackProvider: new StaticReferenceProvider({ styles: STYLES }), limit: 12 }),
  ai: new ServerAIProvider()
};
const OWNER_MODE = ["localhost", "127.0.0.1"].includes(location.hostname) || new URLSearchParams(location.search).get("debug") === "1";
const SETTINGS_KEY = "lavStudioSettingsV3";
const CURRENT_KEY = "lavStudioCurrentProject";
const MAX_RAW = 40 * 1024 * 1024;
const MAX_UPLOAD = 20 * 1024 * 1024;
const phoneMQ = matchMedia("(max-width: 760px)");
const touchMQ = matchMedia("(pointer: coarse)");

const routeLocale = () => (location.pathname.startsWith("/ru/") ? "ru" : location.pathname.startsWith("/en/") ? "en" : (navigator.language || "").toLowerCase().startsWith("ru") ? "ru" : "en");
let locale = routeLocale();

const DEFAULTS = { category: "interior", spaceType: "auto_free", goalId: "cozier", changeLevelId: "finishes_decor", styleId: "organic_modern", colorId: null, brighter: false, specialRequests: "", selectedReferenceId: null, presetId: null };
const S = { ...DEFAULTS, ...(() => { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"); } catch { return {}; } })() };
if (LEGACY_CHANGE_LEVELS[S.changeLevelId]) S.changeLevelId = LEGACY_CHANGE_LEVELS[S.changeLevelId];
function normalizeSettings() {
  if (!SPACE_TYPES[S.category]) S.category = "interior";
  if (!SPACE_TYPES[S.category].some((x) => x.id === S.spaceType)) {
    S.spaceType = S.category === "exterior" ? "house" : "auto_free";
  }
  if (!STYLES.some((x) => x.id === S.styleId)) {
    S.styleId = "organic_modern";
  }
  S.brighter = false;
  if (!GOALS.some((g) => g.id === S.goalId && g.ui)) S.goalId = "cozier";
}
function activeStyle() { return S.goalId === "custom_style" ? S.styleId : null; }
normalizeSettings();

const STYLE_LOCK_KEY = "lav-visual-studio-style-lock";
const TIPS_KEY = "lav-visual-studio-tips-seen";

const state = {
  project: null,            // { id, name, createdAt, sourceBlob, sourceUrl, results: [{ id, url, blob, remoteUrl, createdAt, summary, debug, taskId, rating, favorite }] }
  ownReference: null,       // { file, url }
  references: [], refsLoaded: false,
  phase: "edit",            // edit | busy | result
  step: "goal",             // phone wizard: goal | details
  view: "compare",          // compare | result | original
  activeResult: 0,
  busy: null,               // { status, startedAt, taskId }
  error: null,
  openGroups: new Set(["color"]),
  historyOpen: false,
  lightboxGallery: null,
  variation: null,          // one-shot nudge for the next variant: bolder | calmer | more_decor
  styleLock: (() => { try { return JSON.parse(localStorage.getItem(STYLE_LOCK_KEY) || "null"); } catch { return null; } })(),
  refScores: {}             // {referenceId: score} from likes / dislikes
};

const app = document.querySelector("#app");
const t = (key) => COPY[locale][key] ?? COPY.en[key] ?? key;
const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const L = {
  goal: (id) => { const g = GOALS.find((x) => x.id === id); return g ? (locale === "ru" ? g.ru.label : g.label) : ""; },
  goalNote: (id) => { const g = GOALS.find((x) => x.id === id); return g ? (locale === "ru" ? g.ru.note : g.note) : ""; },
  change: (id) => { const c = CHANGE_LEVELS.find((x) => x.id === id); return c ? (locale === "ru" ? c.ru.label : c.label) : ""; },
  changeNote: (id) => { const c = CHANGE_LEVELS.find((x) => x.id === id); return c ? (locale === "ru" ? c.ru.note : c.note) : ""; },
  room: (id) => locale === "ru" ? (ROOM_LABELS_RU[id] || id) : (Object.values(SPACE_TYPES).flat().find((x) => x.id === id)?.label || id),
  style: (id) => { const s = STYLES.find((x) => x.id === id); return s ? (locale === "ru" ? s.ru : s.fullName) : (id || ""); },
  styleNote: (id) => { const s = STYLES.find((x) => x.id === id); return s ? (locale === "ru" ? (s.ruNote || s.note || "") : (s.note || "")) : ""; },
  color: (id) => { const c = COLORS.find((x) => x.id === id); return c ? (locale === "ru" ? c.ru : c.label) : (id || ""); }
};

function creditWord(n) {
  if (locale !== "ru") return n === 1 ? "credit" : "credits";
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "кредит";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "кредита";
  return "кредитов";
}
const creditText = (n = CREDITS.perGeneration) => `${n} ${creditWord(n)}`;
const creditBalance = () => CREDITS.placeholderBalance;

function saveSettings() { normalizeSettings(); localStorage.setItem(SETTINGS_KEY, JSON.stringify(S)); }

/* ───────────────────────── icons ───────────────────────── */

const P = {
  cozy: '<path d="M4 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 14a2 2 0 0 1 4 0v1h12v-1a2 2 0 0 1 4 0v4H2z"/><path d="M5 18v2M19 18v2"/>',
  lux: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/>',
  bright: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  modern: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12h16M12 12v8"/>',
  color: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8.5-9-8.5z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
  minimal: '<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M8 12h8"/>',
  transform: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 15l6-6M10 9h5v5"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
  wand: '<path d="M4 20L16 8M14 4v3M18 6h-3M20 10v3M21.5 11.5h-3M9 3v2M10 4H8"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrows: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 6.5l1.6 3.6 3.9.4-2.9 2.6.8 3.9L12 15l-3.4 2 .8-3.9-2.9-2.6 3.9-.4z"/>',
  forward: '<path d="M9 6l6 6-6 6"/>',
  zoom: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M11 8v6M8 11h6"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/>',
  like: '<path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3 2l-1 4h6a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7"/>',
  dislike: '<path d="M7 13V4H4v9zM7 13l4 7a2 2 0 0 0 3-2l-1-4h6a2 2 0 0 0 2-2.3l-1.2-6A2 2 0 0 0 17.8 4H7"/>',
  heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'
};
const icon = (name, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || ""}</svg>`;

/* ───────────────────────── shell ───────────────────────── */

function shell() {
  document.documentElement.lang = locale;
  document.documentElement.classList.toggle("is-touch", touchMQ.matches);
  document.title = t("title");
  app.innerHTML = `
    <header class="top" id="top"></header>
    <main class="view" id="view"></main>
    <div class="drawer-backdrop" id="drawerBackdrop" hidden></div>
    <aside class="drawer" id="historyDrawer" aria-hidden="true" aria-labelledby="historyTitle"></aside>
    <dialog class="sheet-dialog" id="ownerDialog"></dialog>
    <dialog class="debug-dialog" id="debugDialog"><div id="debugContent"></div></dialog>
    <dialog class="lightbox-dialog" id="lightboxDialog" aria-label="${O("Просмотр изображения", "Image viewer")}"></dialog>
    <div class="drop-overlay" id="dropOverlay" hidden><div>${icon("upload")}<strong>${t("dropHere")}</strong></div></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <aside class="coach" id="coach" role="status" aria-live="polite" hidden></aside>
    <input class="sr-file" id="fileInput" type="file" accept="image/jpeg,image/png,image/webp" tabindex="-1" aria-hidden="true">
    <input class="sr-file" id="cameraInput" type="file" accept="image/*" capture="environment" tabindex="-1" aria-hidden="true">
    <input class="sr-file" id="refInput" type="file" accept="image/jpeg,image/png,image/webp" tabindex="-1" aria-hidden="true">`;
  $("#fileInput").addEventListener("change", (e) => { handleSource(e.target.files[0]); e.target.value = ""; });
  $("#cameraInput").addEventListener("change", (e) => { handleSource(e.target.files[0]); e.target.value = ""; });
  $("#refInput").addEventListener("change", (e) => { handleOwnReference(e.target.files[0]); e.target.value = ""; });
  $("#drawerBackdrop").addEventListener("click", closeHistory);
  app.addEventListener("click", onClick);
  app.addEventListener("input", onInput);
  app.addEventListener("toggle", onToggle, true);
  renderHeader();
  render();
}

function renderHeader() {
  const count = state.historyCount || 0;
  $("#top").innerHTML = `
    <button class="brand" type="button" data-action="home" aria-label="LAV Visual Studio"><b>LAV</b><span>Visual Studio</span></button>
    <nav class="top-actions">
      ${OWNER_MODE ? `<button class="top-btn owner-btn" type="button" data-action="owner" title="${t("ownerTools")}">${icon("tool")}<span>${t("owner")}</span></button>` : ""}
      <button class="top-btn" type="button" data-action="history">${icon("clock")}<span>${t("myResults")}</span>${count ? `<em>${count}</em>` : ""}</button>
      <button class="top-btn credits-btn" type="button" data-action="credits" aria-label="${t("credits")}: ${creditBalance()}">${icon("coin")}<b>${creditBalance()}</b><span>${creditWord(creditBalance())}</span></button>
      <div class="lang" role="group" aria-label="Language">
        <button type="button" data-locale="ru" class="${locale === "ru" ? "is-active" : ""}" aria-pressed="${locale === "ru"}">RU</button>
        <button type="button" data-locale="en" class="${locale === "en" ? "is-active" : ""}" aria-pressed="${locale === "en"}">EN</button>
      </div>
    </nav>`;
}

function render() {
  const view = $("#view");
  const scroll = $("#panelScroll")?.scrollTop || 0;
  document.body.classList.toggle("is-intro", !state.project);
  document.body.classList.toggle("is-studio", !!state.project);
  view.innerHTML = state.project ? studioView() : introView();
  const panel = $("#panelScroll");
  if (panel) panel.scrollTop = scroll;
  setupSliders();
  setupFit();
  if (state.phase === "busy") updateBusy();
}

/* ───────────────────────── intro ───────────────────────── */

function introCTA(extraClass = "") {
  const touch = touchMQ.matches;
  return `<div class="intro-cta ${extraClass}">
      ${touch ? `<button class="btn btn-primary btn-lg" type="button" data-action="camera">${icon("camera")}<span>${t("takePhoto")}</span></button>` : ""}
      <button class="btn ${touch ? "btn-outline" : "btn-primary"} btn-lg" type="button" data-action="upload">${icon(touch ? "image" : "upload")}<span>${touch ? t("uploadPhotoAlt") : t("uploadPhoto")}</span></button>
      ${extraClass ? "" : `<button class="btn btn-link" type="button" data-action="demo">${t("tryDemo")}</button>`}
    </div>`;
}

function introView() {
  const show = SHOWCASE[0];
  const presetLabel = (p) => p[locale] || p.en;
  return `
  <section class="intro">
    <div class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${t("introEyebrow")}</p>
        <h1>${t("introTitle")}</h1>
        <p class="lead">${t("introLead")}</p>
        ${introCTA()}
        ${touchMQ.matches ? "" : `<p class="drop-hint">${icon("upload")}${t("dropHint")}</p>`}
      </div>
      <div class="hero-visual">
        <div class="ba-frame">${baSlider(show.before, show.after, true)}</div>
        <p class="intro-caption"><span>${t("exampleCaption")}</span>${esc(L.goal(show.goal))} · ${esc(L.style(show.style))}<i>${icon("arrows")}${t("dragToCompare")}</i></p>
      </div>
    </div>

    <section class="presets" aria-labelledby="presetsTitle">
      <header class="section-head"><h2 id="presetsTitle">${t("presetsTitle")}</h2><p>${t("presetsLead")}</p></header>
      <div class="preset-grid">${PRESETS.map((p, i) => `
        <button type="button" class="preset-card${S.presetId === p.id ? " is-selected" : ""}" data-action="preset" data-id="${p.id}" style="--delay:${i * -1.6}s">
          <span class="preset-media">${baStatic(p.before, p.after)}</span>
          <span class="preset-body">
            <span class="preset-goal">${icon(GOALS.find((g) => g.id === p.goal)?.icon || "wand")}${esc(presetLabel(p).title)}</span>
            <strong>${esc(presetLabel(p).note)}</strong>
            <em>${t("presetPick")}${icon("back", "flip")}</em>
          </span>
        </button>`).join("")}
      </div>
    </section>

    <section class="how" aria-labelledby="howTitle">
      <header class="section-head"><h2 id="howTitle">${t("howTitle")}</h2></header>
      <ol class="intro-steps">
        ${["step1", "step2", "step3"].map((k, i) => `
          <li><span class="step-num">0${i + 1}</span><div><strong>${t(k + "Title")}</strong><small>${t(k + "Text")}</small></div></li>`).join("")}
      </ol>
      <details class="intro-tips">
        <summary>${icon("camera")}<span>${t("tipsTitle")}</span>${icon("chevron", "chev")}</summary>
        <ul>${t("tips").map((tip) => `<li>${icon("check")}<span>${tip}</span></li>`).join("")}</ul>
      </details>
      <p class="intro-privacy">${t("privacyNote")}</p>
    </section>
    ${introCTA("mobile-cta")}
  </section>`;
}

function baStatic(before, after) {
  return `<span class="ba ba-mini is-auto" style="--pos:50%" aria-hidden="true">
    <img class="ba-img ba-after" src="${esc(after)}" alt="" loading="lazy" draggable="false">
    <img class="ba-img ba-before" src="${esc(before)}" alt="" loading="lazy" draggable="false">
    <span class="ba-line"></span>
    <span class="ba-tag ba-tag-before">${t("before")}</span><span class="ba-tag ba-tag-after">${t("after")}</span>
  </span>`;
}

function applyPreset(id) {
  const p = PRESETS.find((x) => x.id === id); if (!p) return;
  Object.assign(S, { spaceType: p.spaceType || S.spaceType, goalId: p.goal, styleId: p.style, colorId: p.color, brighter: false, changeLevelId: p.changeLevel, presetId: p.id, selectedReferenceId: null });
  saveSettings(); refreshReferences();
  trackStudioEvent("preset_selected", { preset: p.id });
  if (state.project) { render(); return; }
  render();
  showToast(t("presetChosen"));
  $("#fileInput").click();
}

/* ───────────────────────── before/after slider ───────────────────────── */

function baSlider(before, after, auto = false) {
  return `<div class="ba${auto ? " is-auto" : ""}" style="--pos:50%">
    <img class="ba-img ba-after" src="${esc(after)}" alt="${t("after")}" draggable="false">
    <img class="ba-img ba-before" src="${esc(before)}" alt="${t("before")}" draggable="false">
    <span class="ba-line"><span class="ba-knob">${icon("arrows")}</span></span>
    <span class="ba-tag ba-tag-before">${t("before")}</span><span class="ba-tag ba-tag-after">${t("after")}</span>
    <input class="ba-range" type="range" min="0" max="100" step="0.5" value="50" aria-label="${t("dragToCompare")}">
  </div>`;
}

function setupSliders() {
  $$(".ba").forEach((ba) => {
    const range = $(".ba-range", ba);
    if (!range) return;
    const stopAuto = () => {
      if (!ba.classList.contains("is-auto")) return;
      const current = getComputedStyle(ba).getPropertyValue("--pos").trim();
      ba.classList.remove("is-auto");
      const n = parseFloat(current);
      if (!Number.isNaN(n)) { ba.style.setProperty("--pos", `${n}%`); range.value = n; }
    };
    range.addEventListener("pointerdown", stopAuto);
    range.addEventListener("focus", stopAuto);
    range.addEventListener("input", () => { stopAuto(); ba.style.setProperty("--pos", `${range.value}%`); });
  });
}

/* fit boxes keep before/after images aligned at the source aspect ratio */
const sizeCache = new Map();
let fitObserver;
async function setupFit() {
  const boxes = $$(".fit-box");
  if (!boxes.length) return;
  for (const box of boxes) {
    const src = box.dataset.src;
    if (!sizeCache.has(src)) sizeCache.set(src, await readImageSize(src));
  }
  const apply = () => $$(".fit-box").forEach((box) => {
    const parent = box.parentElement, size = sizeCache.get(box.dataset.src);
    if (!parent || !size) return;
    const cs = getComputedStyle(parent);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight), padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const cw = Math.max(40, parent.clientWidth - padX), ch = Math.max(40, parent.clientHeight - padY);
    const ar = size.width / size.height || 1;
    let w = cw, h = cw / ar;
    if (h > ch) { h = ch; w = ch * ar; }
    box.style.width = `${Math.round(w)}px`; box.style.height = `${Math.round(h)}px`;
  });
  apply();
  fitObserver?.disconnect();
  fitObserver = new ResizeObserver(apply);
  const canvas = $("#stageCanvas");
  if (canvas) fitObserver.observe(canvas);
}

/* ───────────────────────── studio ───────────────────────── */

function currentResult() { return state.project?.results?.[state.activeResult] || null; }

function studioView() {
  const p = state.project, results = p.results, hasResults = results.length > 0, busy = state.phase === "busy";
  if (!hasResults && state.view !== "original") state.view = "original";
  return `
  <section class="studio phase-${state.phase} step-${state.step}">
    <div class="stage">
      <div class="stage-top">
        ${hasResults && !busy ? `<div class="tabs" role="tablist">
          ${[["compare", "viewCompare"], ["result", "viewResult"], ["original", "viewOriginal"]].map(([v, k]) => `<button type="button" role="tab" aria-selected="${state.view === v}" class="${state.view === v ? "is-active" : ""}" data-action="view" data-view="${v}">${t(k)}</button>`).join("")}
        </div>` : `<span class="stage-badge">${icon("check")}${t("photoReady")}</span>`}
        ${busy ? "" : `<button class="chip-btn" type="button" data-action="replace">${icon("image")}<span>${t("replacePhoto")}</span></button>`}
      </div>
      <div class="stage-canvas" id="stageCanvas">${canvasInner()}</div>
      ${hasResults && !busy ? resultBar() : ""}
    </div>
    ${panelView()}
  </section>`;
}

function canvasInner() {
  const p = state.project, r = currentResult();
  let html;
  if (state.phase === "busy") {
    html = `<div class="fit-box is-busy" data-src="${esc(p.sourceUrl)}"><img class="fit-img" src="${esc(p.sourceUrl)}" alt=""><span class="scan"></span></div>${busyCard()}`;
  } else if (state.view === "compare" && r) {
    html = `<div class="fit-box" data-src="${esc(p.sourceUrl)}">${baSlider(p.sourceUrl, r.url)}</div>`;
  } else if (state.view === "result" && r) {
    html = `<div class="fit-box" data-src="${esc(p.sourceUrl)}"><img class="fit-img" src="${esc(r.url)}" alt="${t("after")}"></div>`;
  } else {
    html = `<div class="fit-box" data-src="${esc(p.sourceUrl)}"><img class="fit-img" src="${esc(p.sourceUrl)}" alt="${t("before")}"></div>`;
  }
  if (state.error && state.phase !== "busy") {
    html += `<div class="stage-error" role="alert">${icon("alert")}<span>${esc(state.error)}</span><button class="btn btn-primary btn-sm" type="button" data-action="generate">${icon("refresh")}${t("tryAgain")}</button><button class="icon-btn" type="button" data-action="dismiss-error" aria-label="${t("close")}">${icon("close")}</button></div>`;
  }
  return html;
}

function busyCard() {
  return `<div class="busy-card" aria-live="polite">
    <span class="busy-orb"></span>
    <strong>${t("busyTitle")}</strong>
    <div class="progress"><i id="busyBar"></i></div>
    <ol class="busy-stages" id="busyStages">${t("busyStages").map((s) => `<li><span>${icon("check")}</span>${s}</li>`).join("")}</ol>
    <small>${t("busyNote")}</small>
  </div>`;
}

function resultBar() {
  const results = state.project.results, r = currentResult();
  const ext = (r?.blob?.type || "").split("/")[1] || "png";
  const lockable = !!lockableRefs(r).length;
  const disliked = r?.rating === -1;
  return `<div class="result-bar">
    ${state.view === "compare" ? `<p class="result-hint">${icon("arrows")}${t("resultReady")}</p>` : ""}
    <div class="result-actions">
      <a class="btn btn-primary" href="${esc(r?.url || "#")}" download="lav-interior-${esc(r?.id || "result")}.${ext === "jpeg" ? "jpg" : esc(ext)}" data-action="download">${icon("download")}<span>${t("download")}</span></a>
      <button class="btn btn-outline" type="button" data-action="share">${icon("share")}<span>${t("share")}</span></button>
      <button class="btn btn-outline" type="button" data-action="generate">${icon("refresh")}<span>${t("anotherVariant")}</span></button>
      <button class="btn btn-outline only-stack" type="button" data-action="edit">${icon("sliders")}<span>${t("editSettings")}</span></button>
    </div>
    <div class="result-feedback">
      <div class="rate" role="group" aria-label="${O("Оценка результата", "Rate the result")}">
        <button type="button" class="rate-btn${r?.rating === 1 ? " is-on" : ""}" data-action="rate" data-value="1" aria-pressed="${r?.rating === 1}" title="${O("Нравится", "Like")}">${icon("like")}</button>
        <button type="button" class="rate-btn${disliked ? " is-on" : ""}" data-action="rate" data-value="-1" aria-pressed="${disliked}" title="${O("Не то", "Not quite")}">${icon("dislike")}</button>
        <button type="button" class="rate-btn rate-fav${r?.favorite ? " is-on" : ""}" data-action="favorite" aria-pressed="${!!r?.favorite}" title="${O("В избранное", "Add to favourites")}">${icon("heart")}</button>
      </div>
      ${lockable ? `<button type="button" class="btn btn-link btn-sm lock-btn" data-action="lock-style">${icon("lock")}<span>${O("Этот стиль — для другой комнаты", "Use this style for another room")}</span></button>` : ""}
    </div>
    <div class="nudges${disliked ? " is-emphasis" : ""}">
      <span>${disliked ? O("Не угадали? Попробуйте:", "Not quite? Try:") : O("Хотите иначе?", "Want it different?")}</span>
      ${[["bolder", O("Выразительнее", "Bolder")], ["calmer", O("Спокойнее", "Calmer")], ["more_decor", O("Больше декора", "More décor")]].map(([id, label]) => `<button type="button" class="nudge" data-action="nudge" data-value="${id}">${label}</button>`).join("")}
      ${nextLevelNudge()}
    </div>
    ${results.length > 1 ? `<div class="variants"><span>${t("variants")}</span><div>${results.map((item, i) => `<button type="button" class="${i === state.activeResult ? "is-active" : ""}" data-action="variant" data-index="${i}" aria-label="${t("variants")} ${i + 1}"><img src="${esc(item.url)}" alt="">${item.favorite ? `<i class="fav-dot">${icon("heart")}</i>` : ""}</button>`).join("")}</div></div>` : ""}
  </div>`;
}

/* "Change more" nudge: suggests the next change level (e.g. décor only → finishes & décor). */
function nextLevelNudge() {
  const i = CHANGE_LEVELS.findIndex((c) => c.id === S.changeLevelId);
  const next = CHANGE_LEVELS[i + 1];
  return next ? `<button type="button" class="nudge" data-action="nudge-level" data-value="${next.id}">${O("Изменить больше", "Change more")}: ${esc(L.change(next.id))}</button>` : "";
}

function needsColor() { return !!GOALS.find((g) => g.id === S.goalId)?.requiresColor && !S.colorId; }

function styleLockChip() {
  const lock = state.styleLock;
  if (!lock) return "";
  return `<div class="lock-chip">${lock.thumb ? `<img src="${esc(lock.thumb)}" alt="">` : icon("lock")}
    <span><b>${O("Стиль зафиксирован", "Style locked")}</b><small>${esc(lock.summary || "")} · ${O("тот же стиль для этой комнаты", "same style for this room")}</small></span>
    <button type="button" class="icon-btn" data-action="unlock-style" aria-label="${O("Сбросить стиль", "Clear style")}" title="${O("Сбросить стиль", "Clear style")}">${icon("close")}</button></div>`;
}

function panelView() {
  const ready = !!S.goalId && (S.goalId !== "custom_style" || !!S.styleId), busy = state.phase === "busy";
  const activeSummary = [
    S.spaceType === "auto_free" ? "" : L.room(S.spaceType),
    S.goalId === "custom_style" ? L.style(S.styleId) : L.goal(S.goalId),
    L.change(S.changeLevelId),
    S.colorId ? L.color(S.colorId) : "",
    state.ownerNoRef ? O("Без референса", "No reference") : ""
  ].filter(Boolean).join(" · ");
  if (state.openStep === undefined) state.openStep = 1;
  const step = (n, title, value, body, cls = "block-goal") => {
    const open = state.openStep === n;
    return `<section class="block ${cls} acc-step${open ? " is-open" : ""}">
      <button type="button" class="block-head acc-head" data-action="open-step" data-step-n="${n}" aria-expanded="${open}">
        <span class="num">${n}</span><span class="acc-title"><h2>${title}</h2>${open ? "" : `<small class="acc-value">${esc(value)}</small>`}</span>${icon("chevron", "chev")}
      </button>
      ${open ? `<div class="acc-body">${body}</div>` : ""}
    </section>`;
  };
  const preset = (() => { const p = PRESETS.find((x) => x.id === S.presetId); return p ? `<p class="preset-chip">${icon("transform")}<span>${t("presetActive")}: <b>${esc((p[locale] || p.en).title)} · ${esc((p[locale] || p.en).note)}</b></span></p>` : ""; })();
  const extrasValue = [S.colorId ? L.color(S.colorId) : O("цвет любой", "any colour"), S.specialRequests ? O("есть пожелания", "with wishes") : ""].filter(Boolean).join(" · ");
  const extras = `${group("color", t("colorTitle"), S.colorId ? L.color(S.colorId) : t("anyColor"), colorBody())}
        ${OWNER_MODE ? group("reference", O("Референсы (видно только вам)", "References (owner only)"), state.ownerNoRef ? O("без референса", "no reference") : (referenceName() || O("автоподбор", "auto")), referenceBody()) : ""}
        <label class="comment">
          <span class="field-label">${t("commentLabel")} <em>${t("optional")}</em></span>
          <textarea id="commentInput" maxlength="360" rows="2" placeholder="${t("commentPlaceholder")}">${esc(S.specialRequests)}</textarea>
          <small id="commentCount">${S.specialRequests.length}/360</small>
        </label>`;
  return `<aside class="panel">
    <nav class="stepper" aria-label="Steps">
      <button type="button" class="is-done" data-action="replace"><span>${icon("check")}</span>${t("stepPhoto")}</button>
      <i></i>
      <button type="button" class="${state.step === "goal" ? "is-current" : ""} ${ready ? "is-done" : ""}" data-action="step" data-step="goal"><span>${ready ? icon("check") : "2"}</span>${O("Комната и стиль", "Room & style")}</button>
      <i></i>
      <button type="button" class="${state.step === "details" ? "is-current" : ""}" data-action="step" data-step="details"><span>3</span>${t("stepDetails")}</button>
    </nav>
    <div class="panel-scroll" id="panelScroll">
      ${styleLockChip()}
      ${step(1, O("Что за помещение?", "What space is it?"), L.room(S.spaceType), `<p class="g-note">${O("Можно не указывать — подходит для совмещённых и нестандартных комнат.", "Optional — fine for open-plan or mixed rooms.")}</p>${roomBody()}`)}
      ${step(2, O("Как хотите преобразить?", "How should it change?"), L.goal(S.goalId), preset + goalBody())}
      ${step(3, O("Что меняем?", "What may change?"), L.change(S.changeLevelId), changesBody())}
      ${S.goalId === "custom_style" ? step(4, O("Стиль", "Style"), L.style(S.styleId), styleBody()) : ""}
      ${step(S.goalId === "custom_style" ? 5 : 4, O("Цвет и пожелания", "Colour & wishes"), extrasValue, extras, "block-details")}
    </div>
    <footer class="panel-footer">
      <p class="footer-hint is-ready">${icon("check")}<span>${esc(activeSummary)}</span></p>
      <div class="footer-actions">
        <button class="btn btn-outline only-phone show-step-goal" type="button" data-action="step" data-step="details">${icon("sliders")}<span>${t("moreSettings")}</span></button>
        <button class="btn btn-outline only-phone show-step-details" type="button" data-action="step" data-step="goal">${icon("back")}<span>${t("back")}</span></button>
        ${OWNER_MODE ? `<button class="btn btn-outline btn-sm" type="button" data-action="debug" data-mode="preview" title="${O("Посмотреть промпт и референсы перед отправкой", "Preview prompt and references before sending")}">${icon("tool")}<span>${O("Промпт", "Prompt")}</span></button>` : ""}
        <button class="btn btn-primary btn-create${ready && !busy ? " is-ready" : ""}" type="button" data-action="generate" ${!ready || busy ? "disabled" : ""}>
          <span class="btn-create-label">${busy ? t("creating") : t("create")}${busy ? "" : icon("back", "flip")}</span><small>${icon("coin")}${creditText()}</small>
        </button>
      </div>
    </footer>
  </aside>`;
}

function group(id, title, value, body, extraClass = "") {
  const open = state.openGroups.has(id);
  return `<details class="group${extraClass ? ` ${extraClass}` : ""}" data-group="${id}"${open ? " open" : ""}>
    <summary><span class="g-title">${title}</span><span class="g-value">${esc(value)}</span>${icon("chevron", "chev")}</summary>
    <div class="g-body">${body}</div>
  </details>`;
}

function changesBody() {
  const who = (c) => (locale === "ru" ? c.ru.who : c.who) || "";
  return `<div class="opt-list">${CHANGE_LEVELS.map((c, i) => `
    <button type="button" class="opt-row${S.changeLevelId === c.id ? " is-selected" : ""}" data-set="changeLevelId" data-value="${c.id}" aria-pressed="${S.changeLevelId === c.id}">
      <span class="meter" aria-hidden="true">${[0, 1, 2, 3].map((n) => `<i class="${n <= i ? "on" : ""}"></i>`).join("")}</span>
      <span class="opt-text"><strong>${esc(L.change(c.id))}</strong><small>${esc(L.changeNote(c.id))}</small>${who(c) ? `<em class="opt-who">${esc(who(c))}</em>` : ""}</span>
      <span class="tick">${icon("check")}</span>
    </button>`).join("")}</div>`;
}

function goalBody() {
  return `<div class="goal-grid">${GOALS.filter((g) => g.ui).map((g) => `
    <button type="button" class="goal-card${S.goalId === g.id ? " is-selected" : ""}" data-set="goalId" data-value="${g.id}" aria-pressed="${S.goalId === g.id}">
      ${icon(g.icon, "goal-ic")}<strong>${esc(L.goal(g.id))}</strong><small>${esc(L.goalNote(g.id))}</small><span class="tick">${icon("check")}</span>
    </button>`).join("")}</div>`;
}

function roomBody() {
  return `<div class="segmented">
      <button type="button" class="${S.category === "interior" ? "is-active" : ""}" data-action="category" data-value="interior">${t("interior")}</button>
      <button type="button" class="${S.category === "exterior" ? "is-active" : ""}" data-action="category" data-value="exterior">${t("exterior")}</button>
    </div>
    <div class="pills">${SPACE_TYPES[S.category].map((r) => `<button type="button" class="pill${S.spaceType === r.id ? " is-selected" : ""}" data-set="spaceType" data-value="${r.id}" aria-pressed="${S.spaceType === r.id}">${esc(L.room(r.id))}</button>`).join("")}</div>`;
}

function styleBody() {
  return `<div class="style-grid style-grid-rich">
    ${STYLES.map((s) => `<button type="button" class="style-card${S.styleId === s.id ? " is-selected" : ""}" data-set="styleId" data-value="${s.id}" aria-pressed="${S.styleId === s.id}">
      <span class="style-thumb"><img src="${s.image}" alt="" loading="lazy"><span class="tick">${icon("check")}</span></span>
      <span class="style-info"><strong>${esc(L.style(s.id))}</strong><small>${esc(L.styleNote(s.id))}</small></span>
    </button>`).join("")}
  </div>`;
}

function colorBody() {
  return `<p class="g-note">${icon("bulb")}${O("Цвет добавим в обивку, текстиль и акценты — стиль комнаты сохранится.", "We add the colour to upholstery, textiles and accents — the style stays.")}</p>
  <div class="swatches">
    <button type="button" class="swatch any${!S.colorId ? " is-selected" : ""}" data-set="colorId" data-value=""><span class="sw"><i></i></span><small>${t("anyColor")}</small></button>
    ${COLORS.map((c) => `<button type="button" class="swatch${S.colorId === c.id ? " is-selected" : ""}" data-set="colorId" data-value="${c.id}"><span class="sw">${c.palette.map((x) => `<i style="background:${x}"></i>`).join("")}</span><small>${esc(L.color(c.id))}</small></button>`).join("")}
  </div>`;
}

function referenceName() {
  if (state.ownReference) return state.ownReference.file.name;
  const ref = state.references.find((x) => x.id === S.selectedReferenceId);
  return ref ? (ref.metadata?.primary_direction || "LAV") : "";
}

function referenceBody() {
  const own = state.ownReference;
  const gallery = !state.openGroups.has("reference") ? "" : state.references.length
    ? state.references.map((ref, i) => `<button type="button" class="ref-card${S.selectedReferenceId === ref.id ? " is-selected" : ""}" data-action="select-ref" data-id="${esc(ref.id)}"><img src="${esc(ref.imageUrl)}" alt="${esc(ref.metadata?.primary_direction || `LAV ${i + 1}`)}" loading="lazy"><span class="tick">${icon("check")}</span></button>`).join("")
    : `<p class="muted">${t("loadingRefs")}</p>`;
  const ownerNoRefToggle = OWNER_MODE
    ? `<label class="owner-check"><input type="checkbox" data-action="toggle-no-ref" ${state.ownerNoRef ? "checked" : ""}> ${O("Режим теста: без референса (отправить только промпт)", "Test mode: no reference (send prompt only)")}</label>`
    : "";
  return `<p class="g-note">${t("referenceHint")}</p>
    ${ownerNoRefToggle}
    <div class="ref-actions">
      <button type="button" class="btn btn-outline btn-sm${own ? " is-selected" : ""}" data-action="own-ref">${own ? `<img class="own-thumb" src="${esc(own.url)}" alt="">` : icon("upload")}<span>${own ? esc(own.file.name) : t("ownReference")}</span></button>
      ${own || S.selectedReferenceId ? `<button type="button" class="btn btn-link btn-sm" data-action="clear-ref">${t("removeReference")}</button>` : ""}
    </div>
    <p class="g-sub">${t("libraryPicks")} (${esc(L.room(S.spaceType))} · ${esc(activeStyle() ? L.style(activeStyle()) : L.goal(S.goalId))})</p>
    <div class="ref-grid">${gallery}</div>`;
}

/* ───────────────────────── events ───────────────────────── */

function onInput(event) {
  if (event.target.id === "commentInput") {
    S.specialRequests = event.target.value;
    $("#commentCount").textContent = `${S.specialRequests.length}/360`;
    saveSettings();
  }
}

function onToggle(event) {
  const el = event.target;
  if (!(el instanceof HTMLDetailsElement) || !el.dataset.group) return;
  const id = el.dataset.group;
  if (el.open) state.openGroups.add(id); else state.openGroups.delete(id);
  if (id === "reference" && el.open) {
    const grid = $(".ref-grid", el);
    if (grid && !grid.children.length) { $(".g-body", el).innerHTML = referenceBody(); }
  }
}

function onClick(event) {
  const localeBtn = event.target.closest("[data-locale]");
  if (localeBtn) { switchLocale(localeBtn.dataset.locale); return; }
  const setBtn = event.target.closest("[data-set]");
  if (setBtn) { setValue(setBtn.dataset.set, setBtn.dataset.value || null); return; }
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  const handlers = {
    home: goHome,
    upload: () => $("#fileInput").click(),
    camera: () => $("#cameraInput").click(),
    replace: () => (touchMQ.matches ? $("#cameraInput") : $("#fileInput")).click(),
    demo: loadDemo,
    history: openHistory,
    owner: openOwner,
    credits: openCredits,
    preset: () => applyPreset(actionEl.dataset.id),
    generate,
    rate: () => rateResult(Number(actionEl.dataset.value)),
    favorite: toggleFavorite,
    "lock-style": lockStyle,
    "unlock-style": unlockStyle,
    "open-step": () => { const n = Number(actionEl.dataset.stepN); state.openStep = state.openStep === n ? 0 : n; render(); },
    "toggle-brighter": () => {
      S.brighter = !S.brighter;
      S.presetId = null;
      saveSettings();
      refreshReferences();
      render();
    },
    "toggle-no-ref": () => {
      state.ownerNoRef = !state.ownerNoRef;
      render();
    },
    nudge: () => { state.variation = actionEl.dataset.value; generate(); },
    "nudge-level": () => { S.changeLevelId = actionEl.dataset.value; S.presetId = null; saveSettings(); showToast(`${O("Что меняем", "What changes")}: ${L.change(S.changeLevelId)}`); generate(); },
    "coach-close": () => hideCoach(true),
    step: () => { state.step = actionEl.dataset.step; render(); $("#panelScroll")?.scrollTo({ top: 0 }); },
    view: () => { state.view = actionEl.dataset.view; render(); },
    variant: () => { state.activeResult = Number(actionEl.dataset.index) || 0; render(); },
    edit: () => { state.phase = "edit"; state.step = "goal"; render(); },
    share: shareResult,
    download: () => trackStudioEvent("result_download", {}),
    category: () => { S.category = actionEl.dataset.value; S.spaceType = S.category === "exterior" ? "house" : "auto_free"; saveSettings(); render(); refreshReferences(); },
    "select-ref": () => selectReference(actionEl.dataset.id),
    "own-ref": () => $("#refInput").click(),
    "clear-ref": clearReference,
    "dismiss-error": () => { state.error = null; render(); },
    "open-project": () => { closeHistory(); loadProject(actionEl.dataset.id); },
    "delete-project": () => deleteProject(actionEl.dataset.id),
    "close-history": closeHistory,
    "new-photo": () => { closeHistory(); goHome(); },
    debug: () => { $("#ownerDialog").close(); openDebug(actionEl.dataset.mode); },
    "owner-send": ownerSend,
    "owner-reset": () => { state.ownerNoRef = false; openDebug("preview"); },
    "owner-pin": () => ownerPin(actionEl),
    "owner-journal": openJournal,
    "close-dialog": () => actionEl.closest("dialog")?.close(),
    "open-lightbox": () => {
      const runIdx = Number(actionEl.dataset.run);
      const itemIdx = Number(actionEl.dataset.item);
      const gallery = journalGalleries[runIdx];
      if (gallery) openLightbox(gallery, itemIdx);
    },
    "open-single-lightbox": () => {
      const src = actionEl.dataset.src;
      const title = actionEl.dataset.title || "";
      const filename = actionEl.dataset.filename || "lav-image.jpg";
      if (src) openLightbox([{ src, highRes: src, label: O("Просмотр", "Preview"), title, filename }], 0);
    },
    "download-url": () => {
      const url = actionEl.dataset.url;
      const filename = actionEl.dataset.filename || "lav-image.jpg";
      downloadImageFile(url, filename);
    },
    "lightbox-dl": () => {
      const g = state.lightboxGallery;
      if (!g) return;
      const cur = g.items[g.index];
      if (cur) downloadImageFile(cur.highRes || cur.src, cur.filename);
    },
    "lightbox-prev": lightboxPrev,
    "lightbox-next": lightboxNext,
    "lightbox-select": () => {
      const idx = Number(actionEl.dataset.index);
      if (state.lightboxGallery && !Number.isNaN(idx)) {
        state.lightboxGallery.index = idx;
        renderLightbox();
      }
    },
    "close-lightbox": closeLightbox
  };
  if (handlers[action]) {
    if (action !== "download" && action !== "download-url" && action !== "toggle-no-ref") event.preventDefault();
    handlers[action]();
  }
}

function setValue(key, value) {
  if (state.phase === "busy") return;
  S[key] = value;
  const custom = S.goalId === "custom_style";
  const NEXT = { spaceType: 2, goalId: 3, changeLevelId: 4, styleId: 5 };
  if (key === "goalId" && !custom) state.openStep = 3;
  if (NEXT[key]) state.openStep = NEXT[key];
  if (["goalId", "styleId", "colorId", "changeLevelId", "spaceType"].includes(key)) S.presetId = null;
  saveSettings();
  if (["goalId", "spaceType", "styleId", "colorId"].includes(key)) refreshReferences();
  render();
  if (key === "changeLevelId" && value) {
    const c = CHANGE_LEVELS.find((x) => x.id === value);
    if (c) coach(`level-${value}`, `${L.change(value)}: ${locale === "ru" ? c.ru.who : c.who}`);
  }
}

function switchLocale(next) {
  if (next === locale) return;
  locale = next;
  history.pushState({}, "", `/${next}/visual-studio/${location.search}`);
  shell();
  showToast(t("languageSaved"));
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast"); if (!toast) return;
  clearTimeout(toastTimer); toast.textContent = message; toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

/* ───────────────────────── sources & projects ───────────────────────── */

function revokeProject(project) {
  if (!project) return;
  if (project.sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(project.sourceUrl);
  project.results?.forEach((r) => { if (r.url?.startsWith("blob:")) URL.revokeObjectURL(r.url); });
}

async function handleSource(file) {
  if (!file || state.phase === "busy") return;
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) { showToast(t("invalidImage")); return; }
  if (file.size > MAX_RAW) { showToast(t("largeImage")); return; }
  const prepared = await prepareImage(file);
  if (!ACCEPTED_TYPES.includes(prepared.blob.type)) { showToast(t("invalidImage")); return; }
  if (prepared.blob.size > MAX_UPLOAD) { showToast(t("largeImage")); return; }
  await startProject(prepared.blob, file.name.replace(/\.[^.]+$/, "") || "LAV");
  trackStudioEvent("upload_completed", { file_type: prepared.blob.type, file_size: prepared.blob.size });
}

async function startProject(blob, name) {
  revokeProject(state.project);
  state.project = { id: newId(), name, createdAt: new Date().toISOString(), sourceBlob: blob, sourceUrl: URL.createObjectURL(blob), results: [] };
  Object.assign(state, { phase: "edit", step: "goal", view: "original", activeResult: 0, error: null });
  localStorage.setItem(CURRENT_KEY, state.project.id);
  render();
  await persistProject();
  if (state.styleLock) coach("lock-applied", O("Применяем сохранённый стиль и настройки. Сбросить можно крестиком на плашке сверху.", "Applying your saved style: same references and settings. Clear it with the × on the card above."), true);
  else coach("start", O("Отлично! Выберите цель — что хочется получить. Остальные настройки можно не трогать: мы подберём их сами.", "Great! Pick a goal — what you'd like to get. Other settings are optional: we'll pick them for you."));
}

async function loadDemo() {
  try {
    const blob = await urlToBlob(DEMO.original);
    S.category = DEMO.category; S.spaceType = DEMO.spaceType; saveSettings();
    await startProject(blob, locale === "ru" ? "Демо-гостиная" : DEMO.projectName);
    refreshReferences();
  } catch { showToast(t("uploadFailed")); }
}

function goHome() {
  if (state.phase === "busy") return;
  revokeProject(state.project);
  state.project = null; state.error = null; state.phase = "edit";
  localStorage.removeItem(CURRENT_KEY);
  render();
  scrollTo({ top: 0 });
}

function serializeProject() {
  const p = state.project;
  return {
    id: p.id, name: p.name, createdAt: p.createdAt, sourceBlob: p.sourceBlob,
    settings: { ...S },
    results: p.results.map((r) => ({ id: r.id, blob: r.blob || null, remoteUrl: r.remoteUrl || null, createdAt: r.createdAt, summary: r.summary, debug: r.debug || null, taskId: r.taskId || null, rating: r.rating || 0, favorite: !!r.favorite }))
  };
}

async function persistProject() {
  if (!state.project) return;
  await HistoryStore.put(serializeProject());
  await refreshHistoryCount();
}

async function loadProject(id) {
  const saved = await HistoryStore.get(id);
  if (!saved?.sourceBlob) { localStorage.removeItem(CURRENT_KEY); return false; }
  revokeProject(state.project);
  state.project = {
    id: saved.id, name: saved.name, createdAt: saved.createdAt, sourceBlob: saved.sourceBlob, sourceUrl: URL.createObjectURL(saved.sourceBlob),
    results: (saved.results || []).map((r) => ({ ...r, url: r.blob ? URL.createObjectURL(r.blob) : r.remoteUrl })).filter((r) => r.url)
  };
  if (saved.settings) { Object.assign(S, DEFAULTS, saved.settings); saveSettings(); }
  const hasResults = state.project.results.length > 0;
  Object.assign(state, { phase: hasResults ? "result" : "edit", step: "goal", view: hasResults ? "compare" : "original", activeResult: Math.max(0, state.project.results.length - 1), error: null });
  localStorage.setItem(CURRENT_KEY, state.project.id);
  render();
  refreshReferences();
  return true;
}

async function deleteProject(id) {
  if (!confirm(t("removeConfirm"))) return;
  await HistoryStore.remove(id);
  if (state.project?.id === id) goHome();
  await refreshHistoryCount();
  renderHistory();
}

/* ───────────────────────── references ───────────────────────── */

let referenceRequest = 0;
async function refreshReferences() {
  const request = ++referenceRequest;
  const refs = await services.references.getReferences({ category: S.category, spaceType: S.spaceType, styleId: activeStyle(), colorId: S.colorId, goal: GOALS.find((x) => x.id === S.goalId) });
  if (request !== referenceRequest) return;
  state.references = refs || [];
  if (S.selectedReferenceId && !state.references.some((x) => x.id === S.selectedReferenceId)) { S.selectedReferenceId = null; saveSettings(); }
  const body = $('details[data-group="reference"] .g-body');
  if (body) body.innerHTML = referenceBody();
}

function selectReference(id) {
  if (state.ownReference) { URL.revokeObjectURL(state.ownReference.url); state.ownReference = null; }
  S.selectedReferenceId = S.selectedReferenceId === id ? null : id;
  saveSettings(); render();
  if (S.selectedReferenceId) showToast(t("refSelected"));
}

async function handleOwnReference(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast(t("invalidImage")); return; }
  const prepared = await prepareImage(file);
  if (!ACCEPTED_TYPES.includes(prepared.blob.type)) { showToast(t("invalidImage")); return; }
  if (state.ownReference) URL.revokeObjectURL(state.ownReference.url);
  const named = new File([prepared.blob], file.name, { type: prepared.blob.type });
  state.ownReference = { file: named, url: URL.createObjectURL(named) };
  S.selectedReferenceId = null; saveSettings();
  state.openGroups.add("reference");
  render(); showToast(t("refSelected"));
}

function clearReference() {
  if (state.ownReference) { URL.revokeObjectURL(state.ownReference.url); state.ownReference = null; }
  S.selectedReferenceId = null; saveSettings(); render();
}

function referenceMatchReasons(ref, auto = false) {
  const has = (v, id) => Array.isArray(v) ? v.includes(id) : v === id;
  const reasons = auto ? ["auto"] : [];
  if (has(ref?.tags?.spaceType, S.spaceType)) reasons.push("room");
  if (activeStyle() && has(ref?.tags?.style, activeStyle())) reasons.push("style");
  if (S.colorId && has(ref?.tags?.color, S.colorId)) reasons.push("color");
  if (S.goalId) reasons.push("goal ranking");
  return reasons.length ? reasons : ["explicit user selection"];
}

/* Goal references pinned by the owner (visual-studio/data/goal_references.json). */
let goalPins = null;
async function loadGoalPins(force = false) {
  if (goalPins && !force) return goalPins;
  try { const res = await fetch("/visual-studio/data/goal_references.json", { cache: "no-store" }); goalPins = res.ok ? (await res.json()).goals || {} : {}; }
  catch { goalPins = {}; }
  return goalPins;
}

/* When the user picked nothing, references are still attached so the result never drifts (e.g. "cozy" ≠ yellow).
   AUTO_REFS different images from one style family are sent, so the style is blended and nothing gets copied.
   Order: owner-pinned refs for the goal → weighted random draw from the best ~30 library matches
   (refs from liked results rank higher, refs already used in this project are skipped → every variant differs). */
const AUTO_REFS = 2;
const AUTO_POOL = 30;
async function autoReferences() {
  const picked = [];
  const pins = (await loadGoalPins())[S.goalId] || [];
  const turn = state.project?.results?.length || 0;
  if (pins.length && services.references.getById) {
    for (let i = 0; i < Math.min(pins.length, AUTO_REFS); i++) {
      const ref = await services.references.getById(pins[(turn + i) % pins.length]);
      if (ref && !picked.some((x) => x.ref.id === ref.id)) picked.push({ ref, reasons: ["auto", "pinned for goal"] });
    }
  }
  if (picked.length >= AUTO_REFS) return picked;
  const ranked = await services.references.getReferences({ category: S.category, spaceType: S.spaceType, styleId: activeStyle(), colorId: S.colorId, goal: GOALS.find((x) => x.id === S.goalId), limit: AUTO_POOL, bonus: state.refScores });
  const used = new Set((state.project?.results || []).flatMap((r) => (r.debug?.references || []).map((x) => x.id)).filter(Boolean));
  let pool = (ranked || []).filter((x) => x.imageUrl && !picked.some((p) => p.ref.id === x.id));
  if (pool.filter((x) => !used.has(x.id)).length >= AUTO_REFS - picked.length) pool = pool.filter((x) => !used.has(x.id));
  while (picked.length < AUTO_REFS && pool.length) {
    // earlier (better ranked) refs are more likely, but any of the top matches can appear
    const weights = pool.map((_, i) => 1 / (1 + i * 0.25));
    let roll = Math.random() * weights.reduce((a, b) => a + b, 0), index = 0;
    while (roll > weights[index] && index < pool.length - 1) { roll -= weights[index]; index++; }
    const ref = pool.splice(index, 1)[0];
    picked.push({ ref, reasons: referenceMatchReasons(ref, true) });
  }
  return picked;
}

async function loadReferenceScores() {
  try { const res = await fetch("/api/reference-scores", { cache: "no-store" }); if (res.ok) state.refScores = (await res.json()).scores || {}; } catch { /* offline: no bonus */ }
}

const libraryRef = (ref, reasons, selection) => ({ source: ref.sourceProvider, id: ref.id, name: ref.metadata?.primary_direction || ref.metadata?.filename || ref.id, url: ref.imageUrl, preview: ref.imageUrl, tags: ref.tags, matchedBy: reasons, selection });

/* ───────────────────────── style lock: same references for another room ───────────────────────── */

function lockableRefs(result) {
  return (result?.debug?.references || []).filter((x) => x.role === "style_reference" && x.previewUrl);
}

function lockStyle() {
  const r = currentResult(), refs = lockableRefs(r);
  if (!refs.length) return;
  const task = r.debug?.understoodTask || {};
  state.styleLock = {
    refs: refs.map((x) => ({ source: x.source || "google_drive", id: x.id, name: x.name, url: x.previewUrl, preview: x.previewUrl, matchedBy: ["saved style"], selection: "style_lock" })),
    goalId: task.goal || S.goalId, styleId: task.style || S.styleId, colorId: task.color || S.colorId, changeLevelId: task.changeLevel || S.changeLevelId,
    summary: r.summary || summaryLine(), thumb: refs[0].previewUrl, createdAt: new Date().toISOString()
  };
  localStorage.setItem(STYLE_LOCK_KEY, JSON.stringify(state.styleLock));
  Object.assign(S, { goalId: state.styleLock.goalId, styleId: state.styleLock.styleId, colorId: state.styleLock.colorId, changeLevelId: state.styleLock.changeLevelId, selectedReferenceId: null, presetId: null });
  saveSettings();
  if (r.rating !== 1 && !r.favorite) rateResult(1, true);
  render();
  coach("lock", O("Стиль сохранён. Загрузите фото другой комнаты — мы применим тот же стиль и настройки.", "Style saved. Upload a photo of another room — we'll apply the same references and settings."), true);
  setTimeout(() => (touchMQ.matches ? $("#cameraInput") : $("#fileInput")).click(), 350);
}

function unlockStyle() {
  state.styleLock = null;
  localStorage.removeItem(STYLE_LOCK_KEY);
  render();
  showToast(O("Стиль сброшен", "Style cleared: references are picked automatically again"));
}

/* ───────────────────────── feedback ───────────────────────── */

async function sendFeedback(result, body) {
  if (!result?.taskId) return;
  try { await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: result.taskId, ...body }) }); } catch { /* best effort */ }
}

async function rateResult(value, silent = false) {
  const r = currentResult(); if (!r) return;
  r.rating = r.rating === value ? 0 : value;
  sendFeedback(r, { rating: r.rating });
  trackStudioEvent("result_rating", { rating: r.rating });
  await persistProject();
  render();
  if (silent) return;
  if (r.rating === -1) coach("dislike", O("Жаль! Попробуйте вариант «Выразительнее» или «Спокойнее» — или измените больше, если хотелось сильнее преображения.", "Sorry! Try “Bolder” or “Calmer” — or change more if you wanted a bigger transformation."), true);
  else if (r.rating === 1) showToast(O("Спасибо! Учтём, что вам нравится", "Thanks! We'll remember what you like"));
}

async function toggleFavorite() {
  const r = currentResult(); if (!r) return;
  r.favorite = !r.favorite;
  sendFeedback(r, { favorite: r.favorite });
  await persistProject();
  render();
  showToast(r.favorite ? O("Добавлено в избранное", "Added to favourites") : O("Убрано из избранного", "Removed from favourites"));
}

/* ───────────────────────── tips (gentle, translucent, each shown once) ───────────────────────── */

let coachTimer;
function tipsSeen() { try { return JSON.parse(localStorage.getItem(TIPS_KEY) || "[]"); } catch { return []; } }
function coach(key, text, always = false) {
  const seen = tipsSeen();
  if (!always && seen.includes(key)) return;
  if (!seen.includes(key)) localStorage.setItem(TIPS_KEY, JSON.stringify([...seen, key].slice(-60)));
  const el = $("#coach"); if (!el) return;
  el.innerHTML = `${icon("bulb")}<p>${esc(text)}</p><button type="button" class="coach-close" data-action="coach-close" aria-label="${t("close")}">${icon("close")}</button>`;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add("is-visible"));
  clearTimeout(coachTimer);
  coachTimer = setTimeout(() => hideCoach(), 11000);
}
function hideCoach() {
  const el = $("#coach"); if (!el) return;
  el.classList.remove("is-visible");
  clearTimeout(coachTimer);
  setTimeout(() => { if (!el.classList.contains("is-visible")) el.hidden = true; }, 300);
}

/* ───────────────────────── generation ───────────────────────── */

const SUPPORTED_RATIOS = ["1:1", "1:2", "2:1", "1:3", "3:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "21:9", "9:21", "16:9"];
function nearestAspectRatio(width, height) {
  const ratio = width / height;
  return SUPPORTED_RATIOS.reduce((best, item) => { const [w, h] = item.split(":").map(Number); return Math.abs(w / h - ratio) < Math.abs(best.value - ratio) ? { name: item, value: w / h } : best; }, { name: "1:1", value: 1 }).name;
}

function summaryLine() {
  return [L.goal(S.goalId), activeStyle() ? L.style(activeStyle()) : "", S.colorId ? L.color(S.colorId) : "", L.change(S.changeLevelId)].filter(Boolean).join(" · ");
}

async function generationPayload({ withData = true } = {}) {
  const p = state.project, ref = state.references.find((x) => x.id === S.selectedReferenceId);
  const size = await readImageSize(p.sourceUrl);
  const ext = (p.sourceBlob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const sourceImage = { source: "user_upload", name: `${p.name}.${ext}`, type: p.sourceBlob.type, size: p.sourceBlob.size, dataUrl: withData ? await blobToDataURL(p.sourceBlob) : undefined };
  const own = state.ownReference;
  let references = [];
  if (own) references = [{ source: "user_upload", name: own.file.name, type: own.file.type, matchedBy: ["explicit user upload"], selection: "user", dataUrl: withData ? await blobToDataURL(own.file) : undefined }];
  else if (ref) references = [libraryRef(ref, referenceMatchReasons(ref), "user")];
  else if (state.styleLock?.refs?.length) references = state.styleLock.refs.map((x) => ({ ...x }));
  else references = (await autoReferences()).map((auto) => libraryRef(auto.ref, auto.reasons, "auto"));
  const reference = references[0] || null;
  const payload = { mode: "image", sourceImage, category: S.category, room: S.spaceType, goal: S.goalId === "custom_style" ? null : S.goalId, changeLevel: S.changeLevelId, style: activeStyle(), color: S.colorId, reference, references, variation: state.variation || null, specialRequests: S.specialRequests?.trim() || null, aspectRatio: nearestAspectRatio(size.width, size.height), resolution: "1k", locale, preset: S.presetId || null, pricing: { userPrice: CREDITS.perGeneration, currency: "CREDITS", display: creditText() } };
  if (OWNER_MODE) {
    if (state.ownerNoRef) payload.noReference = true;
    if (withData && state.ownerOverride?.prompt) payload.promptOverride = state.ownerOverride.prompt;
  }
  return payload;
}

function errorMessage(code) {
  return t(({ upload_failed: "uploadFailed", provider_not_configured: "serviceUnavailable", provider_unavailable: "serviceUnavailable", provider_http_error: "serviceUnavailable", service_unavailable: "serviceUnavailable", generation_timeout: "generationTimeout" })[code] || "generationFailed");
}

let busyTimer;
function updateBusy() {
  const b = state.busy; if (!b) return;
  const elapsed = (Date.now() - b.startedAt) / 1000;
  let stage = 0, progress = Math.min(10, 3 + elapsed * 2);
  if (b.status === "running") {
    const runFor = elapsed - (b.runningAt ? (b.runningAt - b.startedAt) / 1000 : 0);
    stage = runFor < 6 ? 1 : runFor < 18 ? 2 : 3;
    progress = 12 + 83 * (1 - Math.exp(-runFor / 22));
  }
  const bar = $("#busyBar"); if (bar) bar.style.width = `${progress.toFixed(1)}%`;
  $$("#busyStages li").forEach((li, i) => { li.classList.toggle("is-done", i < stage); li.classList.toggle("is-active", i === stage); });
}

async function generate() {
  if (!state.project || !S.goalId || state.phase === "busy") return;
  if (needsColor()) { state.openGroups.add("color"); render(); showToast(O("Сначала выберите цвет", "Choose a colour first")); return; }
  const previousPhase = state.project.results.length ? "result" : "edit";
  const variation = state.variation;
  const variationLabel = { bolder: O("выразительнее", "bolder"), calmer: O("спокойнее", "calmer"), more_decor: O("больше декора", "more décor") }[variation];
  state.phase = "busy"; state.error = null; state.busy = { status: "uploading", startedAt: Date.now() };
  render();
  if (phoneMQ.matches) scrollTo({ top: 0 });
  clearInterval(busyTimer); busyTimer = setInterval(updateBusy, 250);
  try {
    const payload = await generationPayload();
    const result = await services.ai.generateImage(payload, (status, detail = {}) => {
      if (status === "running" && !state.busy.runningAt) state.busy.runningAt = Date.now();
      state.busy.status = status; state.busy.taskId = detail.taskId || state.busy.taskId;
      updateBusy();
    });
    const urls = result.imageUrls?.length ? result.imageUrls : [result.imageUrl];
    const firstNew = state.project.results.length;
    for (const url of urls) {
      let blob = null;
      try { blob = await urlToBlob(url); } catch { /* temporary cross-origin URL: keep remote */ }
      state.project.results.push({ id: newId("r"), url: blob ? URL.createObjectURL(blob) : url, blob, remoteUrl: url, createdAt: result.createdAt, summary: [summaryLine(), variationLabel].filter(Boolean).join(" · "), debug: result.debug, taskId: result.taskId || null, rating: 0, favorite: false });
    }
    Object.assign(state, { phase: "result", view: "compare", activeResult: firstNew });
    await persistProject();
    showToast(t("generationSuccess"));
    trackStudioEvent("generation_success", { provider: result.provider, goal: S.goalId, room: S.spaceType });
    setTimeout(() => coach("first-result", O("Сравните «до/после» ползунком. Понравилось — поставьте 👍 или сохраните стиль для другой комнаты. Не то — ниже есть варианты «Выразительнее» и «Спокойнее».", "Drag the slider to compare. Like it — tap 👍 or reuse the style for another room. Not quite — try “Bolder” or “Calmer” below.")), 900);
  } catch (error) {
    console.error("LAV generation failed", { code: error?.code || "unknown", status: error?.status || 0 });
    state.phase = previousPhase; state.error = errorMessage(error?.code);
    trackStudioEvent("generation_failed", { code: error?.code || "unknown" });
  } finally {
    clearInterval(busyTimer); state.busy = null; state.ownerOverride = null; state.variation = null;
    render();
  }
}

async function shareResult() {
  const r = currentResult(); if (!r) return;
  try {
    const blob = r.blob || await urlToBlob(r.url);
    const ext = (blob.type.split("/")[1] || "png").replace("jpeg", "jpg");
    const file = new File([blob], `lav-interior.${ext}`, { type: blob.type });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "LAV Visual Studio", text: t("shareText") });
      trackStudioEvent("result_share", {});
      return;
    }
  } catch (error) { if (error?.name === "AbortError") return; }
  const link = $('.result-actions a[download]'); link?.click();
  showToast(t("shareFallback"));
}

/* ───────────────────────── history drawer ───────────────────────── */

let historyThumbs = [];
async function refreshHistoryCount() {
  const items = await HistoryStore.list();
  state.historyCount = items.filter((p) => p.results?.length).length;
  renderHeader();
  return items;
}

async function renderHistory() {
  const drawer = $("#historyDrawer");
  historyThumbs.forEach((u) => URL.revokeObjectURL(u)); historyThumbs = [];
  const items = await HistoryStore.list();
  const thumb = (p) => { const r = [...(p.results || [])].reverse().find((x) => x.blob); const blob = r?.blob || p.sourceBlob; if (!blob) return ""; const u = URL.createObjectURL(blob); historyThumbs.push(u); return u; };
  const fmt = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  drawer.innerHTML = `
    <header class="drawer-head"><h2 id="historyTitle">${t("historyTitle")}</h2><button class="icon-btn" type="button" data-action="close-history" aria-label="${t("close")}">${icon("close")}</button></header>
    <button class="btn btn-primary drawer-new" type="button" data-action="new-photo">${icon("plus")}<span>${t("newPhoto")}</span></button>
    ${items.length ? `<ul class="history-list">${items.map((p) => `
      <li class="${state.project?.id === p.id ? "is-current" : ""}">
        <button type="button" class="history-item" data-action="open-project" data-id="${esc(p.id)}">
          <span class="history-thumb"><img src="${thumb(p)}" alt=""></span>
          <span class="history-meta"><strong>${esc(p.results?.[p.results.length - 1]?.summary || p.name)}</strong><small>${fmt.format(new Date(p.updatedAt || p.createdAt))} · ${p.results?.length ? resultsLabel(p.results.length) : t("noResultsYet")}</small></span>
        </button>
        <button type="button" class="icon-btn" data-action="delete-project" data-id="${esc(p.id)}" aria-label="${t("remove")}">${icon("trash")}</button>
      </li>`).join("")}</ul>` : `<p class="drawer-empty">${icon("image")}<span>${t("historyEmpty")}</span></p>`}
    <p class="drawer-note">${t("historyNote")}</p>`;
}

function resultsLabel(n) {
  if (locale !== "ru") return `${n} ${n === 1 ? "result" : "results"}`;
  const m10 = n % 10, m100 = n % 100;
  const word = m10 === 1 && m100 !== 11 ? "результат" : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? "результата" : "результатов";
  return `${n} ${word}`;
}

async function openHistory() {
  await renderHistory();
  $("#drawerBackdrop").hidden = false;
  const d = $("#historyDrawer"); d.classList.add("is-open"); d.setAttribute("aria-hidden", "false");
  state.historyOpen = true;
}
function closeHistory() {
  $("#drawerBackdrop").hidden = true;
  const d = $("#historyDrawer"); d.classList.remove("is-open"); d.setAttribute("aria-hidden", "true");
  state.historyOpen = false;
}

/* ───────────────────────── owner / debug ───────────────────────── */

function openCredits() {
  const dialog = $("#ownerDialog");
  dialog.innerHTML = `<div class="sheet credits-sheet"><header class="drawer-head"><h2>${t("credits")}</h2><button class="icon-btn" type="button" data-action="close-dialog" aria-label="${t("close")}">${icon("close")}</button></header>
    <div class="credits-balance">${icon("coin")}<div><small>${t("creditsBalance")}</small><strong>${creditBalance()} <span>${creditWord(creditBalance())}</span></strong></div></div>
    <p class="credits-rule">${icon("wand")}<span>${t("creditsPer")}</span></p>
    <p class="muted">${t("creditsInfo")}</p>
    <p class="credits-soon">${t("creditsSoon")}</p></div>`;
  dialog.onclick = (e) => { if (e.target === dialog) dialog.close(); };
  dialog.showModal();
}

/* Owner-only UI. Never visible to visitors (OWNER_MODE = localhost or ?debug=1); server re-checks localhost. */
const O = (ru, en) => (locale === "ru" ? ru : en);

function openOwner() {
  const dialog = $("#ownerDialog");
  dialog.innerHTML = `<div class="sheet"><header class="drawer-head"><h2>${t("ownerTools")}</h2><button class="icon-btn" type="button" data-action="close-dialog" aria-label="${t("close")}">${icon("close")}</button></header>
    <button class="owner-row" type="button" data-action="debug" data-mode="preview"><span>${O("Тест промпта: что уйдёт сейчас", "Prompt test: what will be sent now")}</span>${icon("back", "flip")}</button>
    <button class="owner-row" type="button" data-action="debug" data-mode="actual"><span>${t("lastRequest")}</span>${icon("back", "flip")}</button>
    <button class="owner-row" type="button" data-action="owner-journal"><span>${O("Журнал тестов", "Test journal")}</span>${icon("back", "flip")}</button></div>`;
  dialog.onclick = (e) => { if (e.target === dialog) dialog.close(); };
  dialog.showModal();
}

function reasonLabel(reason) {
  const map = { room: t("room"), style: t("style"), color: t("color"), "goal ranking": t("goal"), auto: O("подобран автоматически", "auto-picked"), "pinned for goal": O("закреплён для цели", "pinned for goal"), "explicit user selection": O("выбран вручную", "explicit selection"), "explicit user upload": O("загружен пользователем", "user upload"), "primary layout": O("основной кадр", "primary layout"), camera: O("камера", "camera"), geometry: O("геометрия", "geometry"), "object placement": O("расположение объектов", "object placement") };
  return map[reason] || reason;
}

function driverLabel(driver) {
  const map = { images: O("картинки", "images"), always: O("всегда", "always"), changeLevel: O("уровень изменений", "change level"), "changeLevel+goal": O("уровень, повышен целью", "level, raised by goal"), goal: t("goal"), style: t("style"), color: t("color"), room: t("room"), comment: O("комментарий", "comment"), owner: O("ручной промпт", "manual prompt") };
  return map[driver] || driver || "";
}

function debugImage(item) {
  if (item.position === 1) return state.project?.sourceUrl || "";
  if (item.previewUrl) return item.previewUrl;
  if (state.ownReference && item.selection === "user") return state.ownReference.url;
  return "";
}

function renderDebug(debug, mode) {
  const dialog = $("#debugDialog"), target = $("#debugContent");
  const close = `<button class="icon-btn debug-close" type="button" data-action="close-dialog" aria-label="${t("close")}">${icon("close")}</button>`;
  if (!debug) { target.innerHTML = `${close}<h2>${t("requestData")}</h2><p>${t("noActualRequest")}</p>`; }
  else {
    state.ownerPreview = debug;
    const task = debug.understoodTask || {};
    const pins = (goalPins || {})[task.goal] || [];
    const rows = [[t("room"), L.room(task.room) || t("notSelected")], [t("goal"), L.goal(task.goal) || t("notSelected")], [t("style"), task.style ? L.style(task.style) : t("autoStyle")], [t("color"), task.color ? L.color(task.color) : t("anyColor")], [t("changes"), L.change(task.changeLevel) || t("notSelected")], [t("special"), task.specialRequests || t("none")]];
    const refs = (debug.references || []).map((item) => {
      const img = debugImage(item), pinned = item.id && pins.includes(item.id);
      const highImg = img && img.includes("drive.google.com/thumbnail") ? img.replace(/sz=w\d+/, "sz=w2400") : img;
      const title = `${item.role === "source" ? O("Исходное фото", "Source photo") : O("Референс", "Reference")}: ${item.sentAs || item.name || item.id || ""}`;
      const filename = `lav-${item.sentAs || item.id || item.position}.jpg`;
      const pin = item.role === "style_reference" && item.id && task.goal
        ? `<button class="btn btn-link btn-sm" type="button" data-action="owner-pin" data-id="${esc(item.id)}" data-goal="${esc(task.goal)}" ${pinned ? 'data-remove="1"' : ""}>${pinned ? O("Открепить от цели", "Unpin from goal") : O(`Закрепить для цели «${L.goal(task.goal)}»`, `Pin for goal "${L.goal(task.goal)}"`)}</button>` : "";
      const dlBtn = img
        ? `<button class="btn btn-link btn-sm" type="button" data-action="download-url" data-url="${esc(highImg)}" data-filename="${esc(filename)}" title="${t("download")}">${icon("download")} <span>${t("download")}</span></button>`
        : "";
      const thumb = img
        ? `<button type="button" class="debug-ref-thumb" data-action="open-single-lightbox" data-src="${esc(highImg)}" data-title="${esc(title)}" data-filename="${esc(filename)}" title="${O("Нажмите, чтобы увеличить", "Click to enlarge")}"><img src="${esc(img)}" alt="" loading="lazy"><span class="debug-zoom-ic">${icon("zoom")}</span></button>`
        : `<span>${item.position}</span>`;
      return `<article class="debug-ref">${thumb}<div><p>${t("imageOrder")} ${item.position} · ${esc(item.role || "")}</p><strong>${esc(item.sentAs || item.name || item.id || "")}</strong>${item.sentAs ? `<small>${esc(item.name || item.id || "")}</small>` : ""}<small>${esc(item.source || "")}${item.selection ? ` · ${esc(item.selection)}` : ""}</small><small>${t("matchedBy")}: ${(item.reason || []).map(reasonLabel).map(esc).join(" + ")}</small><div class="debug-ref-actions">${pin}${dlBtn}</div></div></article>`;
    }).join("") + (debug.noReference ? `<p class="muted">${O("Отправка без референса (тест).", "Sent without a reference (test).")}</p>` : "");
    const sections = (debug.promptSections || []).map((s, i) => `<details ${i === 0 ? "open" : ""}><summary>${String(i + 1).padStart(2, "0")} · ${esc(s.title || s.id)}<em class="driver">${esc(driverLabel(s.driver))}</em></summary><p>${esc(s.text)}</p></details>`).join("");
    const tester = mode === "preview" ? `<section class="owner-test"><h3>${O("Тест промпта", "Prompt test")}</h3>
        <label class="owner-check"><input type="checkbox" id="ownerNoRef" ${state.ownerNoRef ? "checked" : ""}> ${O("Без референса (только промпт)", "No reference (prompt only)")}</label>
        <textarea id="ownerPrompt" rows="12" spellcheck="false">${esc(debug.finalPrompt || "")}</textarea>
        <div class="owner-actions"><button class="btn btn-primary btn-sm" type="button" data-action="owner-send">${O("Отправить с этим промптом", "Send with this prompt")}</button><button class="btn btn-link btn-sm" type="button" data-action="owner-reset">${O("Вернуть автоматический", "Restore automatic")}</button></div>
        <small class="muted">${O("Можно править текст. Имена файлов подставятся реальные. В боевом режиме — 1 платный запрос.", "Edit freely. Real file names are substituted. In live mode this is 1 paid request.")}</small></section>` : "";
    target.innerHTML = `${close}<p class="eyebrow">${mode === "preview" ? O("Тест промпта", "Prompt test") : t("lastRequest")} · ${esc(debug.promptVersion || "")}${debug.overridden ? ` · ${O("ручной промпт", "manual prompt")}` : ""}</p><h2>${t("requestData")}</h2>
      <section><h3>${t("understoodTask")}</h3><dl class="debug-task">${rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl></section>
      <section><h3>${t("appliedReferences")}</h3><div class="debug-refs">${refs}</div></section>
      ${tester}
      <section><h3>${t("promptSections")}</h3><div class="debug-sections">${sections}</div></section>
      <section><details class="debug-raw"><summary>${t("rawPrompt")}</summary><pre>${esc(debug.finalPrompt || "")}</pre></details></section>
      <section><details class="debug-raw"><summary>${t("finalPayload")}</summary><pre>${esc(JSON.stringify(debug.payload || {}, null, 2))}</pre></details></section>`;
    const noRef = $("#ownerNoRef");
    if (noRef) noRef.onchange = () => { state.ownerNoRef = noRef.checked; openDebug("preview"); };
  }
  dialog.onclick = (e) => { if (e.target === dialog) dialog.close(); };
  if (!dialog.open) dialog.showModal();
}

async function openDebug(mode) {
  await loadGoalPins();
  if (mode === "actual") { renderDebug([...(state.project?.results || [])].reverse().find((r) => r.debug)?.debug || null, mode); return; }
  if (!state.project) { showToast(t("needPhoto")); return; }
  if (!S.goalId) { showToast(O("Сначала выберите цель", "Choose a goal first")); return; }
  $("#debugContent").innerHTML = `<h2>${t("loadingPreview")}</h2>`;
  if (!$("#debugDialog").open) $("#debugDialog").showModal();
  try { renderDebug(await services.ai.previewRequest(await generationPayload({ withData: false })), mode); }
  catch (error) { $("#debugDialog").close(); showToast(errorMessage(error?.code)); }
}

function ownerSend() {
  const text = $("#ownerPrompt")?.value.trim() || "";
  const auto = (state.ownerPreview?.finalPrompt || "").trim();
  state.ownerOverride = text && text !== auto ? { prompt: text } : null;
  $("#debugDialog").close();
  generate();
}

async function ownerPin(el) {
  try {
    const res = await fetch("/api/owner/goal-references", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal: el.dataset.goal, referenceId: el.dataset.id, remove: !!el.dataset.remove }) });
    if (!res.ok) throw new Error(String(res.status));
    goalPins = (await res.json()).goals || {};
    showToast(el.dataset.remove ? O("Откреплено", "Unpinned") : O("Закреплено: этот референс будет подставляться для цели", "Pinned for this goal"));
    if (state.ownerPreview) renderDebug(state.ownerPreview, $(".owner-test") ? "preview" : "actual");
  } catch { showToast(O("Не удалось сохранить (только на localhost)", "Could not save (localhost only)")); }
}

let journalGalleries = [];

async function downloadImageFile(url, filename = "lav-image.jpg") {
  if (!url) return;
  const isLocal = url.startsWith("/") || url.startsWith(location.origin);
  if (isLocal) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        showToast(O("Файл скачивается", "Downloading image"));
        return;
      }
    } catch {}
  }
  const a = document.createElement("a");
  a.href = url.includes("?") ? `${url}&download=1` : `${url}?download=1`;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast(O("Файл открыт для сохранения", "Opened image for download"));
}

function openLightbox(items, index = 0) {
  if (!items || !items.length) return;
  state.lightboxGallery = { items, index: Math.max(0, Math.min(index, items.length - 1)) };
  const dlg = $("#lightboxDialog");
  if (!dlg) return;
  dlg.innerHTML = `
    <div class="lightbox-wrap">
      <header class="lightbox-head">
        <div class="lightbox-meta">
          <span class="lightbox-counter" id="lightboxCounter"></span>
          <strong class="lightbox-title" id="lightboxTitle"></strong>
        </div>
        <div class="lightbox-actions">
          <button type="button" class="lightbox-btn lightbox-btn-primary" data-action="lightbox-dl">
            ${icon("download")} <span>${O("Скачать", "Download")}</span>
          </button>
          <a class="lightbox-btn" id="lightboxExternal" href="#" target="_blank" rel="noopener noreferrer">
            ${icon("external")} <span>${O("Оригинал", "Original")}</span>
          </a>
          <button type="button" class="lightbox-close-btn" data-action="close-lightbox" aria-label="${t("close")}">
            ${icon("close")}
          </button>
        </div>
      </header>
      <div class="lightbox-body">
        <button type="button" class="lightbox-nav lightbox-prev" data-action="lightbox-prev" aria-label="${O("Предыдущее", "Previous")}">
          ${icon("back")}
        </button>
        <div class="lightbox-stage">
          <img class="lightbox-img" id="lightboxImg" referrerpolicy="no-referrer" src="" alt="">
        </div>
        <button type="button" class="lightbox-nav lightbox-next" data-action="lightbox-next" aria-label="${O("Следующее", "Next")}">
          ${icon("forward")}
        </button>
      </div>
      <footer class="lightbox-thumbs" id="lightboxThumbs"></footer>
    </div>`;
  dlg.onclick = (e) => { if (e.target === dlg) closeLightbox(); };
  renderLightbox();
  if (!dlg.open) dlg.showModal();
}

function renderLightbox() {
  const g = state.lightboxGallery;
  if (!g || !g.items.length) return;
  const cur = g.items[g.index];
  const highUrl = cur.highRes || cur.src;

  const counter = $("#lightboxCounter");
  if (counter) counter.textContent = `${g.index + 1} / ${g.items.length}`;

  const title = $("#lightboxTitle");
  if (title) {
    title.textContent = cur.title || cur.label || "";
    title.title = cur.title || "";
  }

  const img = $("#lightboxImg");
  if (img) {
    img.referrerPolicy = "no-referrer";
    img.onerror = () => { if (cur.src && !img.src.endsWith(cur.src) && img.src !== cur.src) img.src = cur.src; };
    img.removeAttribute("src");
    img.src = highUrl;
    img.alt = cur.title || cur.label || "";
  }

  const ext = $("#lightboxExternal");
  if (ext) ext.href = highUrl;

  const prevBtn = $(".lightbox-prev");
  const nextBtn = $(".lightbox-next");
  if (prevBtn) prevBtn.disabled = g.items.length <= 1;
  if (nextBtn) nextBtn.disabled = g.items.length <= 1;

  const thumbs = $("#lightboxThumbs");
  if (thumbs) {
    if (g.items.length <= 1) {
      thumbs.hidden = true;
    } else {
      thumbs.hidden = false;
      thumbs.innerHTML = g.items.map((it, idx) => `
        <button type="button" class="lightbox-thumb-btn${idx === g.index ? " is-active" : ""}" data-action="lightbox-select" data-index="${idx}" title="${esc(it.title || it.label)}">
          <img src="${esc(it.src)}" alt="" loading="lazy">
          <span class="lightbox-thumb-label">${esc(it.label)}</span>
        </button>
      `).join("");
    }
  }
}

function lightboxPrev() {
  const g = state.lightboxGallery;
  if (!g || g.items.length <= 1) return;
  g.index = (g.index - 1 + g.items.length) % g.items.length;
  renderLightbox();
}

function lightboxNext() {
  const g = state.lightboxGallery;
  if (!g || g.items.length <= 1) return;
  g.index = (g.index + 1) % g.items.length;
  renderLightbox();
}

function closeLightbox() {
  const dlg = $("#lightboxDialog");
  if (dlg?.open) dlg.close();
  state.lightboxGallery = null;
}

async function openJournal() {
  $("#ownerDialog").close();
  const dialog = $("#debugDialog"), target = $("#debugContent");
  const close = `<button class="icon-btn debug-close" type="button" data-action="close-dialog" aria-label="${t("close")}">${icon("close")}</button>`;
  target.innerHTML = `${close}<h2>${O("Журнал тестов", "Test journal")}</h2><p class="muted">${t("loadingPreview")}</p>`;
  if (!dialog.open) dialog.showModal();
  dialog.onclick = (e) => { if (e.target === dialog) dialog.close(); };
  try {
    const res = await fetch("/api/owner/journal", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const runs = (await res.json()).runs || [];
    journalGalleries = [];
    const card = (run, runIdx) => {
      const s = run.settings || {}, refs = (run.references || []).filter((r) => r.role === "style_reference");
      const line = [L.goal(s.goal), s.style ? L.style(s.style) : "", s.color ? L.color(s.color) : "", L.change(s.changeLevel)].filter(Boolean).join(" · ");
      const items = [];
      if (run.source) {
        items.push({
          src: run.source,
          highRes: run.source,
          label: O("фото", "photo"),
          sub: O("исходное фото", "source photo"),
          title: `${O("Исходное фото", "Original photo")} · ${line || run.taskId}`,
          filename: `lav-${run.taskId || runIdx}-source.jpg`
        });
      }
      refs.forEach((r, i) => {
        const refNum = refs.length > 1 ? `${O("референс", "reference")} ${i + 1}` : O("референс", "reference");
        const refName = r.name || r.id || "";
        let highRes = r.previewUrl || r.url || "";
        if (highRes.includes("drive.google.com/thumbnail") && highRes.includes("sz=")) {
          highRes = highRes.replace(/sz=w\d+/, "sz=w1600");
        }
        items.push({
          src: r.previewUrl || r.url,
          highRes,
          label: refNum,
          sub: refName,
          title: `${refNum}: ${refName}${r.id ? ` (${r.id})` : ""}`,
          filename: `lav-${run.taskId || runIdx}-ref-${r.id || (i + 1)}.jpg`
        });
      });
      const resultUrl = (run.results || [])[0];
      if (resultUrl) {
        items.push({
          src: resultUrl,
          highRes: resultUrl,
          label: O("результат", "result"),
          sub: line || O("готовый интерьер", "finished interior"),
          title: `${O("Результат генерации", "Generated result")} · ${line || run.taskId}`,
          filename: `lav-${run.taskId || runIdx}-result.jpg`
        });
      }
      journalGalleries[runIdx] = items;

      const figHtml = (it, itemIdx) => `
        <figure class="journal-fig">
          <button type="button" class="journal-thumb" data-action="open-lightbox" data-run="${runIdx}" data-item="${itemIdx}" title="${O("Нажмите, чтобы увеличить", "Click to enlarge")}">
            <img src="${esc(it.src)}" alt="${esc(it.title)}" loading="lazy" referrerpolicy="no-referrer">
            <span class="journal-zoom-badge">${icon("zoom")} <span>${O("Увеличить", "Zoom")}</span></span>
          </button>
          <div class="journal-caption">
            <div class="journal-caption-text">
              <strong>${esc(it.label)}</strong>
              ${it.sub ? `<small title="${esc(it.sub)}">${esc(it.sub)}</small>` : ""}
            </div>
            <button type="button" class="journal-dl-btn" data-action="download-url" data-url="${esc(it.highRes || it.src)}" data-filename="${esc(it.filename)}" title="${t("download")}">
              ${icon("download")}
            </button>
          </div>
        </figure>`;

      const sourceFig = run.source && items[0]
        ? figHtml(items[0], 0)
        : `<figure class="journal-fig is-empty"><span>—</span><div class="journal-caption"><div class="journal-caption-text"><strong>${O("фото", "photo")}</strong></div></div></figure>`;

      const refFigs = refs.length
        ? refs.map((_, i) => {
            const itemIdx = (run.source ? 1 : 0) + i;
            const it = items[itemIdx];
            return it ? figHtml(it, itemIdx) : "";
          }).join("")
        : `<figure class="journal-fig is-empty"><span>—</span><div class="journal-caption"><div class="journal-caption-text"><strong>${O("без референса", "no reference")}</strong></div></div></figure>`;

      const resultItemIdx = items.length - (resultUrl ? 1 : 0);
      const resultFig = resultUrl && items[resultItemIdx]
        ? figHtml(items[resultItemIdx], resultItemIdx)
        : `<figure class="journal-fig is-empty"><span>...</span><div class="journal-caption"><div class="journal-caption-text"><strong>${O("результат", "result")}</strong><small>${esc(run.status || O("в работе", "running"))}</small></div></div></figure>`;

      const totalCols = (run.source ? 1 : 1) + Math.max(1, refs.length) + 1;
      return `<article class="journal-card"><header><strong>${esc(line || run.taskId)}</strong><small>${esc(run.time || "")} · ${esc(run.provider || "")} · ${esc(run.status || O("в работе", "running"))}${run.overridden ? ` · ${O("ручной промпт", "manual prompt")}` : ""}${run.promptVersion ? ` · ${esc(run.promptVersion)}` : ""}${run.providerCost ? ` · ${esc(run.providerCost)}` : ""}${run.rating === 1 ? " · 👍" : run.rating === -1 ? " · 👎" : ""}${run.favorite ? " · ♥" : ""}${(run.finalPrompt || "").includes("Variation for this version") ? ` · ${O("вариация", "variation")}` : ""}</small></header>
        <div class="journal-images" style="--cols:${totalCols}">
          ${sourceFig}
          ${refFigs}
          ${resultFig}
        </div>
        ${s.specialRequests ? `<p class="muted">${esc(s.specialRequests)}</p>` : ""}
        <details class="debug-raw"><summary>${t("rawPrompt")}</summary><pre>${esc(run.finalPrompt || "")}</pre></details></article>`;
    };
    target.innerHTML = `${close}<p class="eyebrow">${runs.length} ${O("запусков", "runs")}</p><h2>${O("Журнал тестов", "Test journal")}</h2>${runs.length ? `<div class="journal-list">${runs.map((r, i) => card(r, i)).join("")}</div>` : `<p class="muted">${O("Пока пусто.", "Empty so far.")}</p>`}`;
  } catch { target.innerHTML = `${close}<h2>${O("Журнал тестов", "Test journal")}</h2><p class="muted">${O("Журнал доступен только на localhost.", "Journal is available on localhost only.")}</p>`; }
}

/* ───────────────────────── drag & drop ───────────────────────── */

let dragDepth = 0;
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes("Files");
addEventListener("dragenter", (e) => { if (!hasFiles(e) || state.phase === "busy") return; e.preventDefault(); dragDepth++; $("#dropOverlay").hidden = false; });
addEventListener("dragover", (e) => { if (hasFiles(e)) e.preventDefault(); });
addEventListener("dragleave", (e) => { if (!hasFiles(e)) return; dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) $("#dropOverlay").hidden = true; });
addEventListener("drop", (e) => { if (!hasFiles(e)) return; e.preventDefault(); dragDepth = 0; $("#dropOverlay").hidden = true; handleSource(e.dataTransfer.files[0]); });
addEventListener("keydown", (e) => {
  if (state.lightboxGallery) {
    if (e.key === "Escape") { closeLightbox(); return; }
    if (e.key === "ArrowLeft") { lightboxPrev(); return; }
    if (e.key === "ArrowRight") { lightboxNext(); return; }
  }
  if (e.key === "Escape" && state.historyOpen) closeHistory();
});
addEventListener("popstate", () => { locale = routeLocale(); shell(); });
phoneMQ.addEventListener("change", render);
touchMQ.addEventListener("change", () => { document.documentElement.classList.toggle("is-touch", touchMQ.matches); if (!state.project) render(); });

/* ───────────────────────── boot ───────────────────────── */

async function boot() {
  shell();
  const currentId = localStorage.getItem(CURRENT_KEY);
  if (currentId) await loadProject(currentId);
  await refreshHistoryCount();
  services.references.load().then(refreshReferences);
  loadReferenceScores();
  trackStudioEvent("visual_studio_open", { mode: "workspace", locale });
}
boot();
