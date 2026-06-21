"use client";

import { useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, MessageCircle, Send, UploadCloud, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UploadFileList } from "@/components/upload/UploadFileList";
import type { UploadItemState } from "@/components/upload/UploadProgressItem";
import { ACCEPTED_MIME_TYPES } from "@/lib/constants";
import { validateFileByRules } from "@/lib/validators";
import { cn } from "@/lib/utils";

type UploadDropzoneProps = {
  eventSlug: string;
};

type UploadMessage = {
  text: string;
  tone: "success" | "warning" | "error";
};

export function UploadDropzone({ eventSlug }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItemState[]>([]);
  const [dragging, setDragging] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const [message, setMessage] = useState<UploadMessage | null>(null);

  const readyToUpload = items.some((item) => item.status === "ready");
  const uploading = items.some((item) => item.status === "uploading");

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    setMessage(null);

    setItems((current) => {
      const next = incoming.map((file) => {
        const error = validateFileByRules(file.type, file.size);

        return {
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: error ? ("error" as const) : ("ready" as const),
          error: error ?? undefined
        };
      });

      return [...current, ...next];
    });
  }

  function updateItem(id: string, patch: Partial<UploadItemState>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function uploadWithProgress(item: UploadItemState, onProgress: (progress: number) => void) {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      const params = new URLSearchParams({ eventSlug });
      xhr.open("POST", `/api/upload?${params.toString()}`);
      xhr.setRequestHeader("Content-Type", item.file.type);
      xhr.setRequestHeader("X-Upload-File-Name", encodeURIComponent(item.file.name));
      xhr.setRequestHeader("X-Upload-File-Size", String(item.file.size));
      xhr.setRequestHeader("X-Uploaded-By-Name", encodeURIComponent(guestName));
      xhr.setRequestHeader("X-Uploaded-By-Note", encodeURIComponent(guestNote));

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }

        let errorMessage = `Dosya yüklenemedi. HTTP ${xhr.status || "0"}`;
        try {
          const response = JSON.parse(xhr.responseText || "null") as { error?: string } | null;
          errorMessage = response?.error || errorMessage;
        } catch {
          // Non-JSON responses usually come from nginx/proxy errors such as 413 or 504.
        }
        reject(new Error(errorMessage));
      };
      xhr.onerror = () => reject(new Error("Sunucuya yükleme sırasında bağlantı hatası oluştu."));
      xhr.onabort = () => reject(new Error("Yükleme iptal edildi."));
      xhr.send(item.file);
    });
  }

  async function uploadOne(item: UploadItemState) {
    updateItem(item.id, { status: "uploading", progress: 4, error: undefined });

    await uploadWithProgress(item, (progress) => updateItem(item.id, { progress }));

    updateItem(item.id, { status: "success", progress: 100 });
  }

  async function startUpload() {
    setMessage(null);
    const queue = items.filter((item) => item.status === "ready");
    let successCount = 0;
    let errorCount = 0;

    for (const item of queue) {
      try {
        await uploadOne(item);
        successCount += 1;
      } catch (error) {
        errorCount += 1;
        updateItem(item.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
        });
      }
    }

    if (successCount > 0 && errorCount === 0) {
      setMessage({
        text: "Anınız başarıyla gönderildi. Bizimle paylaştığınız için teşekkür ederiz.",
        tone: "success"
      });
    } else if (successCount > 0) {
      setMessage({
        text: `${successCount} dosya yüklendi, ${errorCount} dosya yüklenemedi. Detayları listede görebilirsiniz.`,
        tone: "warning"
      });
    } else if (errorCount > 0) {
      setMessage({
        text: "Dosya yüklenemedi. Hata detayını dosya listesinde görebilirsiniz.",
        tone: "error"
      });
    }
  }

  return (
    <div className="paper-surface rounded-[18px] border border-white/70 p-3 md:p-4">
      <div
        className={cn(
          "rounded-xl border border-dashed p-4 text-center transition md:p-5",
          dragging ? "border-primary bg-champagne/55 shadow-soft" : "border-copper/35 bg-white/52"
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
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-copper/25 bg-white/70 text-copper shadow-line">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h2 className="mt-3 font-serif text-2xl leading-tight">Fotoğraf veya videonuzu seçin</h2>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-muted-foreground">
          Dilediğiniz kadar fotoğraf veya video yükleyebilirsiniz.
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

        <Button className="mt-4 w-full sm:w-auto" size="lg" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Camera className="h-5 w-5" />
          Dosya Seç
        </Button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <User className="h-4 w-4 text-copper" />
            Adınız
          </span>
          <span className="relative">
            <input
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              maxLength={80}
              placeholder="İsteğe bağlı"
              className="h-11 w-full rounded-lg border border-copper/20 bg-white/72 px-3 font-normal outline-none transition focus:border-copper/40 focus:ring-2 focus:ring-copper/15"
            />
          </span>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-copper" />
            Kısa notunuz
          </span>
          <span className="relative">
            <input
              value={guestNote}
              onChange={(event) => setGuestNote(event.target.value)}
              maxLength={500}
              placeholder="İsteğe bağlı"
              className="h-11 w-full rounded-lg border border-copper/20 bg-white/72 px-3 font-normal outline-none transition focus:border-copper/40 focus:ring-2 focus:ring-copper/15"
            />
          </span>
        </label>
      </div>

      <UploadFileList items={items} />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {message ? (
          <p
            className={cn(
              "flex items-center gap-2 text-sm",
              message.tone === "success" && "text-emerald-700",
              message.tone === "warning" && "text-amber-700",
              message.tone === "error" && "text-red-700"
            )}
          >
            {message.tone === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">İsterseniz adınızı ve notunuzu ekleyip yüklemeyi başlatın.</p>
        )}
        <Button onClick={startUpload} disabled={!readyToUpload || uploading} className="w-full sm:w-auto">
          <Send className="h-4 w-4" />
          {uploading ? "Yükleniyor" : "Yüklemeyi Başlat"}
        </Button>
      </div>
    </div>
  );
}
