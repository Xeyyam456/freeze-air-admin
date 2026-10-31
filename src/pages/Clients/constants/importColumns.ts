// Excel sütunlarının qəbul olunan adları (başlıq sadələşdirildikdən sonra)
export const IMPORT_COLUMNS: Record<string, string[]> = {
  code: ["kod", "code"],
  name: ["ad", "name", "magaza"],
  address: ["unvan", "address"],
  coords: ["koordinat", "coords", "coordinates"],
  lat: ["enlik", "lat", "latitude"],
  lng: ["uzunluq", "lng", "lon", "longitude"],
  phone: ["telefon", "phone", "tel"],
};
