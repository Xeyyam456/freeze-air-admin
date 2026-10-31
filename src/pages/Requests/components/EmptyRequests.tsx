import { Inbox } from "lucide-react";
import type { EmptyRequestsProps } from "@/types/requests";

export function EmptyRequests({ searching, filter }: EmptyRequestsProps) {
  return (
    <div className="card grid min-h-[360px] place-items-center text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-bg text-muted"><Inbox size={24} /></span>
        <p className="mt-3 font-semibold">{searching ? "Heç nə tapılmadı" : filter === "new" ? "Yeni müraciət yoxdur" : "Müraciət yoxdur"}</p>
        <p className="muted text-sm">{searching ? "Axtarışı dəyişin." : "Saytdan yazılan mesajlar burada görünəcək."}</p>
      </div>
    </div>
  );
}
