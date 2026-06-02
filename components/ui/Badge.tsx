import { cn } from "@/lib/utils";

const styles = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  neutral: "bg-muted text-muted-foreground border-border"
};

type BadgeProps = {
  children: React.ReactNode;
  tone?: keyof typeof styles;
  className?: string;
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", styles[tone], className)}>
      {children}
    </span>
  );
}
