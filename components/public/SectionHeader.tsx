type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="mb-3 text-sm font-medium uppercase text-rose">{eyebrow}</p> : null}
      <h2 className="font-serif text-3xl text-foreground md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
