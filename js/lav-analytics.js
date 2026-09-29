(function () {
  'use strict';

  var COUNTER_ID = 113155027;
  var CONSENT_KEY = 'lavCookieAnalytics';
  var CONSENT_SAVED_KEY = 'lavCookieConsent';
  var loaded = false;

  function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === 'true';
  }

  function loadMetrika() {
    if (loaded || !hasConsent()) return;
    loaded = true;

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Number(new Date());

    if (!document.querySelector('script[src*="mc.yandex.ru/metrika/tag.js"]')) {
      var tag = document.createElement('script');
      tag.async = true;
      tag.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + COUNTER_ID;
      document.head.appendChild(tag);
    }

    window.ym(COUNTER_ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      accurateTrackBounce: true,
      trackLinks: true,
      referrer: document.referrer,
      url: location.href
    });
  }

  function saveConsent(allowed) {
    localStorage.setItem(CONSENT_SAVED_KEY, 'saved');
    localStorage.setItem(CONSENT_KEY, allowed ? 'true' : 'false');
    if (allowed) loadMetrika();
    document.querySelector('[data-lav-cookie-banner]')?.remove();
  }

  function injectConsentBanner() {
    if (document.getElementById('cookieBanner') || localStorage.getItem(CONSENT_SAVED_KEY)) return;

    var banner = document.createElement('aside');
    banner.className = 'lav-cookie-consent';
    banner.setAttribute('data-lav-cookie-banner', '');
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Настройки аналитики');
    banner.innerHTML = '<p>Мы используем Яндекс Метрику для анализа посещений и улучшения сайта. Данные собираются только с вашего согласия. <a href="/cookies.html">Подробнее</a></p>' +
      '<div><button type="button" data-lav-consent="necessary">Только необходимые</button><button type="button" data-lav-consent="analytics">Разрешить аналитику</button></div>';
    document.body.appendChild(banner);

    if (!document.getElementById('lav-cookie-consent-style')) {
      var style = document.createElement('style');
      style.id = 'lav-cookie-consent-style';
      style.textContent = '.lav-cookie-consent{position:fixed;z-index:2147483000;left:50%;bottom:16px;transform:translateX(-50%);width:min(920px,calc(100% - 28px));box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 16px;background:rgba(246,242,235,.96);color:#1b1916;border:1px solid rgba(27,25,22,.2);box-shadow:0 18px 52px rgba(0,0,0,.18);backdrop-filter:blur(16px);font:12px/1.55 Manrope,Arial,sans-serif}.lav-cookie-consent p{margin:0;max-width:620px}.lav-cookie-consent a{text-decoration:underline}.lav-cookie-consent>div{display:flex;gap:8px;flex:0 0 auto}.lav-cookie-consent button{min-height:44px;padding:10px 16px;border:1px solid #1b1916;background:transparent;color:#1b1916;font:600 10px/1 Manrope,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}.lav-cookie-consent button:last-child{background:#1b1916;color:#fff}@media(max-width:700px){.lav-cookie-consent{align-items:stretch;flex-direction:column}.lav-cookie-consent>div{display:grid;grid-template-columns:1fr}.lav-cookie-consent button{width:100%}}';
      document.head.appendChild(style);
    }
  }

  function goal(name, params) {
    if (!hasConsent()) return;
    loadMetrika();
    window.ym(COUNTER_ID, 'reachGoal', name, params || {});
  }

  function linkKind(link) {
    var href = (link.getAttribute('href') || '').toLowerCase();
    if (href.indexOf('max.ru/') !== -1) return 'max_click';
    if (href.indexOf('t.me/') !== -1 || href.indexOf('telegram.me/') !== -1) return 'telegram_click';
    if (href.indexOf('mailto:') === 0) return 'email_click';
    if (href.indexOf('wa.me/') !== -1 || href.indexOf('whatsapp.com/') !== -1) return 'whatsapp_click';
    return '';
  }

  function projectParams() {
    return {
      page_path: location.pathname,
      project_title: document.querySelector('[data-portfolio] [data-title]')?.textContent?.trim() || '',
      project_index: document.querySelector('[data-portfolio] [data-index]')?.textContent?.trim() || ''
    };
  }

  function bindEvents() {
    document.addEventListener('click', function (event) {
      var consent = event.target.closest('[data-lav-consent]');
      if (consent) {
        saveConsent(consent.getAttribute('data-lav-consent') === 'analytics');
        return;
      }

      var accept = event.target.closest('[data-cookie-accept], #acceptAllCookies, [data-consent="accepted"]');
      var reject = event.target.closest('[data-cookie-necessary], #rejectOptionalCookies, [data-consent="rejected"]');
      if (accept) saveConsent(true);
      if (reject) saveConsent(false);

      var link = event.target.closest('a[href]');
      if (link) {
        var kind = linkKind(link);
        if (kind) goal(kind, { page_path: location.pathname, link_text: link.textContent.trim() });
      }

      var next = event.target.closest('[data-next]');
      var prev = event.target.closest('[data-prev]');
      if (next) goal('portfolio_next', projectParams());
      if (prev) goal('portfolio_prev', projectParams());
    }, true);

    var index = document.querySelector('[data-portfolio] [data-index]');
    if (index && window.MutationObserver) {
      var lastIndex = index.textContent;
      new MutationObserver(function () {
        if (index.textContent && index.textContent !== lastIndex) {
          lastIndex = index.textContent;
          goal('portfolio_project_view', projectParams());
        }
      }).observe(index, { childList: true, characterData: true, subtree: true });
    }

    var contact = document.querySelector('#contact');
    if (contact && window.IntersectionObserver) {
      var seen = false;
      var observer = new IntersectionObserver(function (entries) {
        if (!seen && entries.some(function (entry) { return entry.isIntersecting; })) {
          seen = true;
          goal('contact_section_view', { page_path: location.pathname });
          observer.disconnect();
        }
      }, { threshold: 0.45 });
      observer.observe(contact);
    }
  }

  function boot() {
    bindEvents();
    loadMetrika();
    injectConsentBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
