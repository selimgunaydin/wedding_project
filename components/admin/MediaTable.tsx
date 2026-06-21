"use client";

import { Check, Download, Eye, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { UploadRecord } from "@/types/database";
import { formatBytes, formatDate } from "@/lib/format";

type MediaTableProps = {
  uploads: UploadRecord[];
  selectedIds: string[];
  onSelect: (id: string, selected: boolean) => void;
  onPreview: (upload: UploadRecord) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
};

const statusLabels = {
  pending: "Bekliyor",
  approved: "Onaylı",
  rejected: "Reddedildi"
};

function getAdminDownloadUrl(upload: UploadRecord) {
  return `/api/admin/uploads/${upload.id}/file?download=1`;
}

function getGuestName(upload: UploadRecord) {
  return upload.uploaded_by_name || "İsim belirtilmemiş";
}

function getGuestNote(upload: UploadRecord) {
  return upload.uploaded_by_note || "Not eklenmemiş";
}

export function MediaTable({ uploads, selectedIds, onSelect, onPreview, onApprove, onReject, onDelete }: MediaTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-b border-border bg-muted/70 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-3">Seç</th>
              <th className="px-3 py-3">Dosya</th>
              <th className="px-3 py-3">Misafir</th>
              <th className="px-3 py-3">Etkinlik</th>
              <th className="px-3 py-3">Durum</th>
              <th className="px-3 py-3">Boyut</th>
              <th className="px-3 py-3">Tarih</th>
              <th className="px-3 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {uploads.map((upload) => (
              <tr key={upload.id}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(upload.id)}
                    onChange={(event) => onSelect(upload.id, event.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
                <td className="max-w-[240px] px-3 py-3">
                  <p className="truncate font-medium">{upload.original_file_name}</p>
                  <p className="text-xs text-muted-foreground">{upload.file_type === "image" ? "Fotoğraf" : "Video"}</p>
                </td>
                <td className="max-w-[240px] px-3 py-3">
                  <p className="truncate font-medium">{getGuestName(upload)}</p>
                  <p className="truncate text-xs text-muted-foreground">{getGuestNote(upload)}</p>
                </td>
                <td className="px-3 py-3">{upload.event_slug}</td>
                <td className="px-3 py-3">
                  <Badge tone={upload.status}>{statusLabels[upload.status]}</Badge>
                </td>
                <td className="px-3 py-3">{formatBytes(upload.file_size)}</td>
                <td className="px-3 py-3">{formatDate(upload.created_at.slice(0, 10))}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onPreview(upload)} aria-label="Önizle">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <a
                      href={getAdminDownloadUrl(upload)}
                      download
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
                      aria-label="İndir"
                    >
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
