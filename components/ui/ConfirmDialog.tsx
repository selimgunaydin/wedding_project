"use client";

import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Onayla",
  busy,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-soft">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Vazgeç
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? "İşleniyor" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
