import { Input } from "@/shared/components/Input";
import type { RequestRejectProps } from "@/types/depot";
import { Button } from "@/shared/components/Button";

// Rədd səbəbi (istəyə görə) + "Rədd et"
export function RequestReject({ d }: RequestRejectProps) {
  return (
    <div className="mt-2 flex gap-2 sm:ml-[6.25rem]">
      <Input value={d.note} onChange={(e) => d.setNote(e.target.value)} autoFocus placeholder="Rədd səbəbi (istəyə görə)" className="!h-9 flex-1 !text-[13px]" />
      <Button type="button" disabled={d.pending} onClick={() => d.decide(false)} variant="plain" size="sm" className="!h-9 bg-danger text-white hover:bg-danger/90">Rədd et</Button>
    </div>
  );
}
