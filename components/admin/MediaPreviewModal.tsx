/* eslint-disable @next/next/no-img-element */
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { UploadRecord } from "@/types/database";

type MediaPreviewModalProps = {
  upload: UploadRecord | null;
  onClose: () => void;
};

function getMediaViewUrl(upload: UploadRecord) {
  return `/api/admin/uploads/${upload.id}/file`;
}

function getGuestName(upload: UploadRecord) {
  return upload.uploaded_by_name || "İsim belirtilmemiş";
}

export function MediaPreviewModal({ upload, onClose }: MediaPreviewModalProps) {
  if (!upload) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-background shadow-soft">
        <div className="flex items-center justify-between border-b border-border p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{upload.original_file_name}</p>
            <p className="text-xs text-muted-foreground">{getGuestName(upload)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Kapat">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid max-h-[76vh] place-items-center overflow-auto bg-ink/5 p-4">
          {upload.file_type === "image" ? (
            <img src={getMediaViewUrl(upload)} alt={upload.original_file_name} className="max-h-[70vh] rounded-lg object-contain" />
          ) : (
            <video src={getMediaViewUrl(upload)} controls preload="metadata" className="max-h-[70vh] w-full rounded-lg" />
          )}
        </div>
        {upload.uploaded_by_note ? (
          <div className="border-t border-border bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Misafir notu</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{upload.uploaded_by_note}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
