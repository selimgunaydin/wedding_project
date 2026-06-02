"use client";

import { useMemo, useState } from "react";
import { Check, Grid2X2, List, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { MediaGrid } from "@/components/admin/MediaGrid";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import { MediaTable } from "@/components/admin/MediaTable";
import type { UploadFileType, UploadRecord, UploadStatus } from "@/types/database";

type MediaManagerProps = {
  uploads: UploadRecord[];
  eventSlug?: string;
};

export function MediaManager({ uploads, eventSlug }: MediaManagerProps) {
  const [localUploads, setLocalUploads] = useState(uploads);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [status, setStatus] = useState<UploadStatus | "all">("all");
  const [fileType, setFileType] = useState<UploadFileType | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<UploadRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | "bulk" | null>(null);
  const [busy, setBusy] = useState(false);

  const filteredUploads = useMemo(
    () =>
      localUploads.filter((upload) => {
        if (eventSlug && upload.event_slug !== eventSlug) return false;
        if (status !== "all" && upload.status !== status) return false;
        if (fileType !== "all" && upload.file_type !== fileType) return false;
        return true;
      }),
    [eventSlug, fileType, localUploads, status]
  );

  function select(id: string, checked: boolean) {
    setSelectedIds((current) => (checked ? [...new Set([...current, id])] : current.filter((item) => item !== id)));
  }

  async function updateStatus(id: string, nextStatus: UploadStatus) {
    const response = await fetch(`/api/admin/uploads/${id}/${nextStatus === "approved" ? "approve" : "reject"}`, {
      method: "POST"
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "İşlem tamamlanamadı.");
    setLocalUploads((current) => current.map((upload) => (upload.id === id ? json.upload : upload)));
  }

  async function deleteUpload(id: string) {
    const response = await fetch(`/api/admin/uploads/${id}`, { method: "DELETE" });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Silme işlemi tamamlanamadı.");
    setLocalUploads((current) => current.filter((upload) => upload.id !== id));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
  }

  async function bulkApprove() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/uploads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action: "approve" })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Toplu onay tamamlanamadı.");
      setLocalUploads((current) =>
        current.map((upload) => json.uploads.find((item: UploadRecord) => item.id === upload.id) ?? upload)
      );
      setSelectedIds([]);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      if (deleteTarget === "bulk") {
        const response = await fetch("/api/admin/uploads/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds, action: "delete" })
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Toplu silme tamamlanamadı.");
        setLocalUploads((current) => current.filter((upload) => !selectedIds.includes(upload.id)));
        setSelectedIds([]);
      } else {
        await deleteUpload(deleteTarget);
      }
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  }

  const sharedProps = {
    uploads: filteredUploads,
    selectedIds,
    onSelect: select,
    onPreview: setPreview,
    onApprove: (id: string) => updateStatus(id, "approved"),
    onReject: (id: string) => updateStatus(id, "rejected"),
    onDelete: (id: string) => setDeleteTarget(id)
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-white/60 p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(event) => setStatus(event.target.value as UploadStatus | "all")} className="h-10 rounded-lg border border-border bg-white px-3 text-sm">
            <option value="all">Tüm durumlar</option>
            <option value="pending">Bekleyen</option>
            <option value="approved">Onaylı</option>
            <option value="rejected">Reddedildi</option>
          </select>
          <select value={fileType} onChange={(event) => setFileType(event.target.value as UploadFileType | "all")} className="h-10 rounded-lg border border-border bg-white px-3 text-sm">
            <option value="all">Tüm dosyalar</option>
            <option value="image">Fotoğraf</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setView(view === "grid" ? "list" : "grid")}>
            {view === "grid" ? <List className="h-4 w-4" /> : <Grid2X2 className="h-4 w-4" />}
            {view === "grid" ? "Liste" : "Grid"}
          </Button>
          <Button variant="secondary" size="sm" onClick={bulkApprove} disabled={selectedIds.length === 0 || busy}>
            <Check className="h-4 w-4" />
            Toplu onay
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget("bulk")} disabled={selectedIds.length === 0 || busy}>
            <Trash2 className="h-4 w-4" />
            Toplu sil
          </Button>
        </div>
      </div>

      {filteredUploads.length === 0 ? (
        <EmptyState title="Medya bulunamadı" description="Filtreyi değiştirin veya yeni yüklemeleri bekleyin." />
      ) : view === "grid" ? (
        <MediaGrid {...sharedProps} />
      ) : (
        <MediaTable {...sharedProps} />
      )}

      <MediaPreviewModal upload={preview} onClose={() => setPreview(null)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Medyayı sil"
        description="Bu işlem veritabanı kaydını ve Contabo Object Storage üzerindeki dosyayı siler."
        confirmLabel="Sil"
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
