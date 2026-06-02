import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Yükleniyor" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white/65 p-6 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
