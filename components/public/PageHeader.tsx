type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="container-shell py-10 md:py-14">
      {eyebrow ? <p className="mb-3 text-sm font-medium uppercase text-rose">{eyebrow}</p> : null}
      <h1 className="max-w-3xl font-serif text-4xl text-foreground md:text-5xl">{title}</h1>
      {description ? <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p> : null}
    </section>
  );
}
