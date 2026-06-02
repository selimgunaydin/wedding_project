export function AdminHeader({ title, description, email }: { title: string; description?: string; email: string }) {
  return (
    <header className="mb-6 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <p className="rounded-full border border-border bg-white/70 px-3 py-1 text-sm text-muted-foreground">{email}</p>
    </header>
  );
}
