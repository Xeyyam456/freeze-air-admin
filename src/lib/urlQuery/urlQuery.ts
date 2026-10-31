// Ünvandakı ?q=... (Ctrl+K axtarışından gələndə siyahının axtarış sahəsi bununla doldurulur)
export function urlQuery() {
  return new URLSearchParams(window.location.search).get("q") ?? "";
}
