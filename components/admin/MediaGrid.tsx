/* eslint-disable @next/next/no-img-element */
"use client";

import { Check, Download, Eye, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { UploadRecord } from "@/types/database";
import { formatBytes } from "@/lib/format";

type MediaGridProps = {
  uploads: UploadRecord[];
  selectedIds: string[];
  onSelect: (id: string, selected: boolean) => void;
  onPreview: (upload: UploadRecord) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
};

// Izgarada küçük önizlemeyi aynı origin'deki proxy üzerinden çekeriz
// (?thumb=1). Cross-origin Contabo URL'leri CSP'ye takıldığı için proxy
// kullanıyoruz; thumbnail küçük olduğu için sunucu yükü ihmal edilebilir.
function getMediaViewUrl(upload: UploadRecord) {
  return `/api/admin/uploads/${upload.id}/file?thumb=1`;
}

// İndirme orijinal dosya adıyla insin diye proxy ucundan gider.
function getAdminDownloadUrl(upload: UploadRecord) {
  return `/api/admin/uploads/${upload.id}/file?download=1`;
}

function getGuestName(upload: UploadRecord) {
  return upload.uploaded_by_name || "İsim belirtilmemiş";
}

function getGuestNote(upload: UploadRecord) {
  return upload.uploaded_by_note || "Not eklenmemiş";
}

export function MediaGrid({ uploads, selectedIds, onSelect, onPreview, onApprove, onReject, onDelete }: MediaGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {uploads.map((upload) => (
        <article key={upload.id} className="overflow-hidden rounded-xl border border-border bg-white/70 shadow-line">
          <div className="relative aspect-[4/3] bg-muted">
            {upload.file_type === "image" ? (
              <img
                src={getMediaViewUrl(upload)}
                alt={upload.original_file_name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <video src={getMediaViewUrl(upload)} preload="metadata" className="h-full w-full object-cover" />
            )}
            <label className="absolute left-3 top-3 rounded-lg bg-white/85 p-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(upload.id)}
                onChange={(event) => onSelect(upload.id, event.target.checked)}
              />
            </label>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{upload.original_file_name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatBytes(upload.file_size)}</p>
              </div>
              <Badge tone={upload.status}>{upload.status}</Badge>
            </div>
            <div className="mt-3 rounded-lg border border-border/70 bg-white/55 p-3 text-sm">
              <p className="truncate font-medium">{getGuestName(upload)}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{getGuestNote(upload)}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              <Button size="icon" variant="ghost" onClick={() => onPreview(upload)} aria-label="Önizle">
                <Eye className="h-4 w-4" />
              </Button>
              <a href={getAdminDownloadUrl(upload)} download className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted">
                <Download className="h-4 w-4" />
              </a>
              <Button size="icon" variant="ghost" onClick={() => onApprove(upload.id)} aria-label="Onayla">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onReject(upload.id)} aria-label="Reddet">
                <X className="h-4 w-4" />
              </Button>
              {upload.status !== "rejected" ? (
                <Button size="icon" variant="ghost" onClick={() => onDelete(upload.id)} aria-label="Sil">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
