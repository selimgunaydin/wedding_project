import { AlertTriangle } from "lucide-react";

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="h-4 w-4" />
        {title}
      </div>
      {description ? <p className="mt-1 text-sm text-red-800">{description}</p> : null}
    </div>
  );
}
