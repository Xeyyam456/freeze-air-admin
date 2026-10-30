import type { AttendanceEmployee } from "./AttendanceEmployee";

export type PersonPhotoProps = { employee: Pick<AttendanceEmployee, "full_name" | "photo_url">; className: string };
