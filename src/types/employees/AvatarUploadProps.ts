import type { Employee } from "./Employee";

export type AvatarUploadProps = { employee: Pick<Employee, "id" | "full_name" | "photo_url">; onChange?: () => void };
