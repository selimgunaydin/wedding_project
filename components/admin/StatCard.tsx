import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
};

export function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white/70 p-4 shadow-line">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-rose" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}
