import type { LucideIcon } from "lucide-react";

type StepCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
};

export function StepCard({ icon: Icon, title, description, index }: StepCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white/62 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm text-muted-foreground">0{index}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
