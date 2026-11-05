// Faiz dəyişməsi (keçən dövrə nisbətən); keçən dövr 0-dırsa null (müqayisə yoxdur)
export function deltaPct(now: number, before: number) {
  return before > 0 ? Math.round(((now - before) / before) * 100) : null;
}
