// Rəqəm və sual redaktorlarının ortaq pəncərəsi
export type EditorShellProps = { title: string; onClose: () => void; onSubmit: (fd: FormData) => void; pending: boolean; children: React.ReactNode; wide?: boolean };
