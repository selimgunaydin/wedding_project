import { CheckCircle2, File, Loader2, XCircle } from "lucide-react";
import { formatBytes } from "@/lib/format";

export type UploadItemState = {
  id: string;
  file: globalThis.File;
  progress: number;
  status: "ready" | "uploading" | "success" | "error";
  error?: string;
};

export function UploadProgressItem({ item }: { item: UploadItemState }) {
  const icon =
    item.status === "success" ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
    ) : item.status === "error" ? (
      <XCircle className="h-5 w-5 text-red-600" />
    ) : item.status === "uploading" ? (
      <Loader2 className="h-5 w-5 animate-spin text-rose" />
    ) : (
      <File className="h-5 w-5 text-muted-foreground" />
    );

  return (
    <li className="rounded-lg border border-border bg-white/70 p-3">
      <div className="flex items-start gap-3">
        {icon}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium">{item.file.name}</p>
            <p className="shrink-0 text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
          </div>
          {item.error ? <p className="mt-2 text-xs text-red-700">{item.error}</p> : null}
        </div>
      </div>
    </li>
  );
}
