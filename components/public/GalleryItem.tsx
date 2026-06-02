/* eslint-disable @next/next/no-img-element */
import { Play } from "lucide-react";
import type { UploadRecord } from "@/types/database";

export function GalleryItem({ upload }: { upload: UploadRecord }) {
  return (
    <figure className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-muted">
      {upload.file_type === "image" ? (
        <img
          src={upload.file_url}
          alt={upload.original_file_name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="grid h-full place-items-center bg-ink text-white">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white/16">
            <Play className="h-7 w-7 fill-white" />
          </div>
          <video src={upload.file_url} preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        </div>
      )}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-3 text-xs text-white">
        {upload.uploaded_by_name || "Misafir anısı"}
      </figcaption>
    </figure>
  );
}
