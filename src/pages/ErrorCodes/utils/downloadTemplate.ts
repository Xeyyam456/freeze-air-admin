// Boş şablon: düzgün başlıqlarla (nümunə sətir yoxdur ki, səhvən yüklənməsin)
export async function downloadTemplate() {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const head = (value: string) => ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: "#0a7ea4", alignVertical: "center" as const, height: 24 });
  await writeXlsxFile([[head("Model"), head("Kod"), head("Açıqlama"), head("Edilecək iş")]], {
    sheet: "Xəta kodları",
    columns: [{ width: 28 }, { width: 14 }, { width: 50 }, { width: 70 }],
    stickyRowsCount: 1,
  }).toFile("xeta-kodlari-sablon.xlsx");
}
