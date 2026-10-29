import { createClient } from "@/lib/supabase/client";
import type { ExistingLog, WorkLogFields } from "@/types/workLogs";

function ext(file: File) {
  return file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
}

// Yeni iş (ustanın adından) və ya mövcud işi dəyiş: iş qeydinin id-si və ya xəta
export async function upsertLog(fields: WorkLogFields, employeeId: number, existingId?: number): Promise<{ error: string } | { logId: number }> {
  const supabase = createClient();
  if (existingId) {
    const { error } = await supabase.from("work_logs").update(fields).eq("id", existingId);
    return error ? { error: error.message } : { logId: existingId };
  }
  const { data: log, error } = await supabase.from("work_logs").insert({ ...fields, employee_id: employeeId }).select("id").single();
  return error || !log ? { error: error?.message ?? "Yadda saxlanmadı." } : { logId: log.id };
}

// Faylları sil (storage + qeyd)
export async function removeLogFiles(files: ExistingLog["files"]) {
  const supabase = createClient();
  await supabase.storage.from("work").remove(files.map((f) => f.path));
  await supabase.from("work_files").delete().in("id", files.map((f) => f.id));
}

// Yeni fayllar: work/<log id>/<təsadüfi ad>; yüklənməyənlərin adları qaytarılır
export async function uploadLogFiles(logId: number, files: { file: File; kind: string }[]) {
  const supabase = createClient();
  const failed: string[] = [];
  for (const { file, kind } of files) {
    const path = `${logId}/${crypto.randomUUID()}.${ext(file)}`;
    const { error: upError } = await supabase.storage.from("work").upload(path, file, { contentType: file.type });
    if (upError) {
      failed.push(file.name);
      continue;
    }
    await supabase.from("work_files").insert({ work_log_id: logId, kind, path });
  }
  return failed;
}
