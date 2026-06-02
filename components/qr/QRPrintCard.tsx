/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { EventRecord } from "@/types/database";
import { formatLongDate } from "@/lib/format";

type QRPrintCardProps = {
  event: EventRecord;
  url: string;
  autoPrint?: boolean;
};

export function QRPrintCard({ event, url, autoPrint }: QRPrintCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 2,
      width: 900,
      color: {
        dark: "#2f2821",
        light: "#fffaf0"
      }
    }).then(setQrDataUrl);
  }, [url]);

  useEffect(() => {
    if (autoPrint && qrDataUrl) {
      const timer = window.setTimeout(() => window.print(), 500);
      return () => window.clearTimeout(timer);
    }
  }, [autoPrint, qrDataUrl]);

  return (
    <div className="a4-page mx-auto flex flex-col items-center justify-center border border-border bg-[#fffaf0] p-10 text-center shadow-soft">
      <p className="text-sm uppercase text-muted-foreground">Anı Kutusu</p>
      <h1 className="mt-5 max-w-2xl font-serif text-5xl leading-tight">Fotoğraf ve videolarınızı bizimle paylaşın</h1>
      <p className="mt-5 text-xl text-muted-foreground">QR kodu okutun, anınızı yükleyin.</p>

      <div className="my-12 grid h-80 w-80 place-items-center rounded-xl border border-border bg-white p-4">
        {qrDataUrl ? <img src={qrDataUrl} alt={`${event.title} QR kodu`} className="h-full w-full" /> : null}
      </div>

      <h2 className="font-serif text-4xl">{event.title}</h2>
      <p className="mt-2 text-lg text-muted-foreground">{formatLongDate(event.event_date)}</p>
      <p className="mt-8 max-w-md break-all text-sm text-muted-foreground">{url}</p>
    </div>
  );
}
