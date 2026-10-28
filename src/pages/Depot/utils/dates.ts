// max(0): kompüterin saatı bazadan bir neçə saniyə geri qalanda yeni götürülən "-1 gün" göstərməsin
export const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
export const dateAz = (iso: string) => iso.slice(0, 10).split("-").reverse().join(".");
export const timeAz = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
