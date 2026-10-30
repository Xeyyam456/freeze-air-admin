// Seansın sıra nömrəsi: yenidən işə çıxanda "1) ", "2) " ... (tək seansda boş)
export function sessionNo(i: number, count: number) {
  return count > 1 ? `${i + 1}) ` : "";
}
