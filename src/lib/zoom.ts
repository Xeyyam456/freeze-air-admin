// Böyük ekranda səhifə `zoom` ilə böyüdülür (index.css). getBoundingClientRect və window.innerWidth/Height isə ekran pikselindədir,
// `position: fixed` koordinatları isə zoom-lu piksellə yazılır: portal ilə açılan siyahılar bu köməkçilərlə hesablanmalıdır.
export const pageZoom = () => parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

export function rectOf(el: Element) {
  const r = el.getBoundingClientRect();
  const z = pageZoom();
  return { left: r.left / z, right: r.right / z, top: r.top / z, bottom: r.bottom / z, width: r.width / z, height: r.height / z };
}

// Görünən sahənin ölçüsü (səhifə pikseli ilə)
export function viewport() {
  const z = pageZoom();
  return { w: window.innerWidth / z, h: window.innerHeight / z };
}

// Açılan siyahı ekranın kənarından çıxmasın: eni ekrana sığdırılır, sol kənar içəri çəkilir (12px boşluq)
export function fitX(left: number, width: number) {
  const vw = viewport().w;
  const w = Math.min(width, vw - 24);
  return { left: Math.max(12, Math.min(left, vw - w - 12)), width: w };
}
