// Tost bildirişləri: istənilən yerdən toast.success("...") / toast.error("..."), <Toaster /> göstərir.
export type Toast = { id: number; kind: "success" | "error"; title: string; text?: string };
