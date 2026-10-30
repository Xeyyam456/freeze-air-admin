// Davamiyyət (migrasiya 0059, 0061): iş həftəsi 6 gündür, bazar günü iş günü deyil.
// Usta səhər "İşə gəldim" (check_in), axşam "İşi bitirdim" (check_out) basır; bazar günü çağırılıbsa da basa bilər (0062, əlavə gün);
// icazəni usta istəyir, admin təsdiqləyir. Təsdiqlənmiş icazə günü "icazəli" sayılır (həmin gün işə gəlib sonra icazə alıbsa da).

// Davamiyyət bu gündən aparılır (istifadəçi qərarı: oktyabrın 1-dən; 1–21 oktyabr hamıya "işdə" yazılıb): əvvəlki günlər "gəlmədi" sayılmır
export const ATTENDANCE_START = "2026-10-01";

// Davamiyyət keşi (useData açarları): attendance, leave_requests, attendance_absences dəyişəndə yenilənir
export const ATTENDANCE_KEYS = ["month-attendance", "employee-month", "my-leaves"];
