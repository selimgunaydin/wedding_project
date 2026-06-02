/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { EventRecord } from "@/types/database";
import { formatDate } from "@/lib/format";
import { getQrPosterFileName } from "@/lib/qr";

type QRCodeCardProps = {
  event: EventRecord;
  url: string;
  printHref: string;
};

export function QRCodeCard({ event, url, printHref }: QRCodeCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 2,
      width: 420,
      color: {
        dark: "#2f2821",
        light: "#fffaf0"
      }
    }).then(setQrDataUrl);
  }, [url]);

  function downloadQr() {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${getQrPosterFileName(event)}.png`;
    link.click();
  }

  return (
    <article className="rounded-xl border border-border bg-white/70 p-5 shadow-line">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">{event.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(event.event_date)}</p>
        </div>
      </div>
      <div className="mt-5 grid place-items-center rounded-xl border border-border bg-background p-4">
        {qrDataUrl ? <img src={qrDataUrl} alt={`${event.title} QR kodu`} className="h-auto w-full max-w-60" /> : null}
      </div>
      <p className="mt-4 break-all rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{url}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={downloadQr}>
          <Download className="h-4 w-4" />
          PNG indir
        </Button>
        <ButtonLink href={printHref} size="sm" variant="secondary">
          <Printer className="h-4 w-4" />
          Baskı görünümü
        </ButtonLink>
      </div>
    </article>
  );
}
