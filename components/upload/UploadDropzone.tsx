"use client";

import { useRef, useState } from "react";
import { Camera, CheckCircle2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UploadFileList } from "@/components/upload/UploadFileList";
import type { UploadItemState } from "@/components/upload/UploadProgressItem";
import { ACCEPTED_MIME_TYPES, MAX_FILES_PER_UPLOAD, MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } from "@/lib/constants";
import { validateFileByRules } from "@/lib/validators";
import { cn } from "@/lib/utils";

type UploadDropzoneProps = {
  eventSlug: string;
};

type PresignResponse = {
  uploadUrl: string;
  filePath: string;
  fileUrl: string;
  fileName: string;
  fileType: "image" | "video";
};

export function UploadDropzone({ eventSlug }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItemState[]>([]);
  const [dragging, setDragging] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const readyToUpload = items.some((item) => item.status === "ready");
  const uploading = items.some((item) => item.status === "uploading");

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    setMessage(null);

    setItems((current) => {
      const slots = MAX_FILES_PER_UPLOAD - current.length;
      const selected = incoming.slice(0, Math.max(slots, 0));
      const next = selected.map((file) => {
        const error = validateFileByRules(file.type, file.size);

        return {
          id: crypto.randomUUID(),
          file,
          progress: error ? 0 : 0,
          status: error ? ("error" as const) : ("ready" as const),
          error: error ?? undefined
        };
      });

      if (incoming.length > slots) {
        setMessage(`Tek seferde en fazla ${MAX_FILES_PER_UPLOAD} dosya seçebilirsiniz.`);
      }

      return [...current, ...next];
    });
  }

  function updateItem(id: string, patch: Partial<UploadItemState>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function uploadWithProgress(url: string, file: File, onProgress: (progress: number) => void) {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error("Dosya Contabo Object Storage'a yüklenemedi."));
      };
      xhr.onerror = () => reject(new Error("Bağlantı sırasında hata oluştu."));
      xhr.send(file);
    });
  }

  async function uploadOne(item: UploadItemState) {
    updateItem(item.id, { status: "uploading", progress: 4, error: undefined });

    const presignResponse = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventSlug,
        fileName: item.file.name,
        mimeType: item.file.type,
        fileSize: item.file.size
      })
    });

    const presignJson = await presignResponse.json();
    if (!presignResponse.ok) throw new Error(presignJson.error || "Upload bağlantısı alınamadı.");
    const presign = presignJson as PresignResponse;

    await uploadWithProgress(presign.uploadUrl, item.file, (progress) => updateItem(item.id, { progress }));

    const completeResponse = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventSlug,
        fileName: presign.fileName,
        originalFileName: item.file.name,
        filePath: presign.filePath,
        fileUrl: presign.fileUrl,
        fileType: presign.fileType,
        mimeType: item.file.type,
        fileSize: item.file.size,
        uploadedByName: guestName,
        uploadedByNote: guestNote
      })
    });

    const completeJson = await completeResponse.json();
    if (!completeResponse.ok) throw new Error(completeJson.error || "Yükleme kaydı oluşturulamadı.");

    updateItem(item.id, { status: "success", progress: 100 });
  }

  async function startUpload() {
    setMessage(null);
    const queue = items.filter((item) => item.status === "ready");

    for (const item of queue) {
      try {
        await uploadOne(item);
      } catch (error) {
        updateItem(item.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
        });
      }
    }

    setMessage("Anınız başarıyla gönderildi. Onaylandıktan sonra galeride görünecektir.");
  }

  return (
    <div className="rounded-xl border border-border bg-white/70 p-4 shadow-line md:p-5">
      <div
        className={cn(
          "rounded-xl border border-dashed p-5 text-center transition md:p-8",
          dragging ? "border-primary bg-champagne/35" : "border-border bg-background/60"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <UploadCloud className="mx-auto h-10 w-10 text-rose" />
        <h2 className="mt-4 text-xl font-semibold">Fotoğraf veya videonuzu seçin</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Tek seferde {MAX_FILES_PER_UPLOAD} dosyaya kadar yükleyebilirsiniz. Fotoğraflar {MAX_IMAGE_SIZE_MB} MB, videolar{" "}
          {MAX_VIDEO_SIZE_MB} MB ile sınırlıdır.
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_MIME_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <Button className="mt-5 w-full sm:w-auto" size="lg" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Camera className="h-5 w-5" />
          Dosya Seç
        </Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Adınız
          <input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            maxLength={80}
            placeholder="İsteğe bağlı"
            className="h-11 rounded-lg border border-border bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Kısa notunuz
          <input
            value={guestNote}
            onChange={(event) => setGuestNote(event.target.value)}
            maxLength={500}
            placeholder="İsteğe bağlı"
            className="h-11 rounded-lg border border-border bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <UploadFileList items={items} />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {message ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Yükledikleriniz onaylandıktan sonra galeride görünecek.</p>
        )}
        <Button onClick={startUpload} disabled={!readyToUpload || uploading} className="w-full sm:w-auto">
          {uploading ? "Yükleniyor" : "Yüklemeyi Başlat"}
        </Button>
      </div>
    </div>
  );
}
