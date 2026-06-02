"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Giriş yapılamadı.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-white/75 p-5 shadow-soft">
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
        <LockKeyhole className="h-5 w-5" />
      </div>
      <h1 className="font-serif text-3xl">Admin giriş</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Yüklenen anıları onaylamak ve etkinlikleri yönetmek için giriş yapın.</p>

      {error ? (
        <div className="mt-4">
          <ErrorState title="Giriş başarısız" description={error} />
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        <label className="grid gap-1 text-sm font-medium">
          E-posta
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            className="h-11 rounded-lg border border-border bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Şifre
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            className="h-11 rounded-lg border border-border bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <Button type="submit" className="mt-5 w-full" disabled={busy}>
        {busy ? "Giriş yapılıyor" : "Giriş yap"}
      </Button>
    </form>
  );
}
