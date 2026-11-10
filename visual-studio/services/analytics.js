const COUNTER_ID = 113155027;

export function trackStudioEvent(name, params = {}) {
  const payload = { page_path: location.pathname, ...params };
  window.dispatchEvent(new CustomEvent("lav:studio-event", { detail: { name, params: payload } }));
  if (typeof window.ym === "function") window.ym(COUNTER_ID, "reachGoal", name, payload);
}
