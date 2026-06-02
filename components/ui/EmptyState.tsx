import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-xl border border-dashed border-border bg-white/55 p-8 text-center", className)}>
      <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
