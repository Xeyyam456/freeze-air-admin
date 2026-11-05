// Axtarış kod kimidirsə (1–2 simvol, hərf/rəqəm): xəritədə həmin sətir/kod işıqlanır, 2 simvolda kod seçilir
export function isCodeQuery(q: string) {
  return /^[0-9a-z]{1,2}$/i.test(q.trim());
}
