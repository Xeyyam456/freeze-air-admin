type Place = { lat: number | null; lng: number | null; address: string | null };

// Koordinat varsa dəqiq nöqtə, yoxdursa ünvan.
function query(p: Place) {
  if (p.lat != null && p.lng != null) return `${p.lat},${p.lng}`;
  return p.address ?? "";
}

// Panel içində iframe ilə göstərmək üçün
export function mapEmbedUrl(p: Place) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query(p))}&z=16&output=embed`;
}

// Ayrıca tabda Google Maps-də açmaq üçün
export function mapSearchUrl(p: Place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query(p))}`;
}

// Yol tapmaq: Google Maps marşrutu (cari yerdən təyinat nöqtəsinə). Koordinat varsa dəqiq nöqtə, yoxsa ünvan.
export function directionsUrl(p: Place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query(p))}&travelmode=driving`;
}

// Waze yalnız koordinatla işləyir (ünvanla dəqiq deyil); koordinat yoxdursa null
export function wazeUrl(p: Place) {
  if (p.lat == null || p.lng == null) return null;
  return `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
}

// "40.40930, 49.86710" formatını (Google Maps-dən kopyalanan) oxuyur.
export function parseCoordinates(input: string): { lat: number; lng: number } | null {
  const m = input.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}
