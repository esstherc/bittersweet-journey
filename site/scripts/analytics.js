/* Google Analytics: one shared loader and the project's six intentional events. */
(() => {
  "use strict";

  if (window.JOURNEY_ANALYTICS) return;

  const MEASUREMENT_ID = "G-G4Y7367LWY";
  const EVENTS = new Set([
    "landing_view",
    "atlas_view",
    "chapter_start",
    "chapter_complete",
    "journey_complete",
    "finale_view"
  ]);
  const STORAGE_PREFIX = "bittersweet-journey:analytics:";
  const LANDING_PENDING_KEY = `${STORAGE_PREFIX}landing_pending`;
  const localPreview =
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "[::1]";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  // Local previews still queue events for automated checks, but never send them to GA.
  if (!localPreview) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.append(script);
  }

  function event(name, parameters = {}) {
    if (!EVENTS.has(name)) return false;
    const clean = Object.fromEntries(
      Object.entries(parameters).filter(([, value]) => value !== undefined && value !== null)
    );
    window.gtag("event", name, clean);
    return true;
  }

  function once(storage, name, key, parameters) {
    const storageKey = `${STORAGE_PREFIX}${key || name}`;
    try {
      if (storage.getItem(storageKey) === "true") return false;
    } catch {}
    const queued = event(name, parameters);
    if (queued) {
      try { storage.setItem(storageKey, "true"); } catch {}
    }
    return queued;
  }

  const analytics = Object.freeze({
    measurementId: MEASUREMENT_ID,
    event,
    onceSession: (name, key = name, parameters = {}) => once(sessionStorage, name, key, parameters),
    onceLocal: (name, key = name, parameters = {}) => once(localStorage, name, key, parameters)
  });
  window.JOURNEY_ANALYTICS = analytics;

  function hasReadingTrace() {
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        const value = localStorage.getItem(key);
        if (/^bittersweet-journey:[^:]+:(complete|started)$/.test(key) && value === "true") return true;
        if (key === "bittersweet-journey:kashgar:scene" && Number(value) > 0) return true;
      }
      return false;
    } catch { return true; }
  }

  function consumePendingLanding() {
    let parameters;
    try { parameters = JSON.parse(sessionStorage.getItem(LANDING_PENDING_KEY)); } catch {}
    if (!parameters) return;
    analytics.onceSession("landing_view", "landing_view", parameters);
    try { sessionStorage.removeItem(LANDING_PENDING_KEY); } catch {}
  }

  const atlas = new URL("../index.html", document.currentScript.src);
  const currentPath = location.pathname.endsWith("/") ? `${location.pathname}index.html` : location.pathname;
  if (currentPath === atlas.pathname) {
    const query = new URLSearchParams(location.search);
    let siteLanguage = query.get("lang");
    if (!["zh", "en"].includes(siteLanguage)) {
      try { siteLanguage = localStorage.getItem("bittersweet-journey:language"); } catch {}
    }
    try {
      sessionStorage.setItem(LANDING_PENDING_KEY, JSON.stringify({
        entry_path: location.pathname,
        site_language: siteLanguage === "zh" ? "zh" : "en"
      }));
    } catch {}
    // A new reader is synchronously redirected to the opening tour. Let that stable page send the event.
    if (hasReadingTrace()) consumePendingLanding();
  } else {
    consumePendingLanding();
  }
})();
