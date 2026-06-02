import { UploadProgressItem, type UploadItemState } from "@/components/upload/UploadProgressItem";

export function UploadFileList({ items }: { items: UploadItemState[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-4 grid gap-2">
      {items.map((item) => (
        <UploadProgressItem key={item.id} item={item} />
      ))}
    </ul>
  );
}
