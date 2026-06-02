import { ImageIcon } from "lucide-react";
import { GalleryItem } from "@/components/public/GalleryItem";
import type { UploadRecord } from "@/types/database";

const placeholders = [
  "Bir kahkaha",
  "Sahne ışığı",
  "İlk kare",
  "Dans anı",
  "Masa detayı",
  "Kutlama"
];

export function GalleryGrid({ uploads }: { uploads: UploadRecord[] }) {
  if (uploads.length === 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {placeholders.map((label) => (
          <div
            key={label}
            className="flex aspect-[4/5] flex-col justify-between rounded-xl border border-dashed border-border bg-white/50 p-4"
          >
            <ImageIcon className="h-6 w-6 text-rose" />
            <div>
              <p className="font-medium">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">Onaylanan anılar burada görünecek.</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {uploads.map((upload) => (
        <GalleryItem key={upload.id} upload={upload} />
      ))}
    </div>
  );
}
