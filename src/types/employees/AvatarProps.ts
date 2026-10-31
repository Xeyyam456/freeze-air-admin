import type { Employee } from "./Employee";

export type AvatarProps = { employee: Pick<Employee, "full_name" | "photo_url">; className?: string };
