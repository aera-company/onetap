import type { EventType } from "@/types/profile";

type TrackEventInput = {
  profileId: string;
  cardCode?: string;
  eventType: EventType;
};

const SESSION_KEY = "one_tap_session_id";
const PAGE_VIEW_KEY = "one_tap_page_view";

function getSessionId() {
  const existingId = window.sessionStorage.getItem(SESSION_KEY);
  if (existingId) return existingId;

  const sessionId = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export function trackEvent(input: TrackEventInput) {
  const payload = JSON.stringify({
    ...input,
    sessionId: getSessionId(),
    referrer: document.referrer || null,
    path: window.location.pathname,
    utmSource: new URLSearchParams(window.location.search).get("utm_source"),
    utmMedium: new URLSearchParams(window.location.search).get("utm_medium"),
    utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign"),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/events",
      new Blob([payload], { type: "application/json" }),
    );
    return;
  }

  void fetch("/api/events", {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
  }).catch(() => undefined);
}

export function trackPageView(input: Omit<TrackEventInput, "eventType">) {
  const key = `${PAGE_VIEW_KEY}:${input.profileId}:${input.cardCode ?? "direct"}`;
  if (window.sessionStorage.getItem(key)) return;

  window.sessionStorage.setItem(key, "1");
  trackEvent({ ...input, eventType: "page_view" });
}
