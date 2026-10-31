import type { ContactRequest } from "./ContactRequest";

export type RequestListProps = { list: ContactRequest[]; selectedId: number | undefined; onSelect: (id: number) => void };
