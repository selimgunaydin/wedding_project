"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Fotoğraf yüklemek için üyelik gerekiyor mu?",
    answer: "Hayır. QR kodu açmanız ve dosyanızı seçmeniz yeterli."
  },
  {
    question: "Video yükleyebilir miyim?",
    answer: "Evet. MP4, MOV ve WebM videolarını belirtilen limitler içinde yükleyebilirsiniz."
  },
  {
    question: "Yüklediklerim hemen görünür mü?",
    answer: "Hayır. Anılar önce admin onayına düşer, onaylandıktan sonra galeride görünür."
  },
  {
    question: "Yanlış dosya yüklersem ne olur?",
    answer: "Admin panelinden yanlış yüklemeler silinebilir veya reddedilebilir."
  },
  {
    question: "Hangi etkinliğe yükleme yapacağımı nasıl seçerim?",
    answer: "Her QR kod doğrudan kendi etkinlik sayfasına gider. Etkinlik listesinden de seçim yapabilirsiniz."
  },
  {
    question: "QR kod çalışmazsa ne yapmalıyım?",
    answer: "Etkinlik bağlantısını manuel açabilir veya QR kodlar sayfasından ilgili etkinliği seçebilirsiniz."
  }
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-white/62">
      {faqs.map((faq, index) => (
        <div key={faq.question}>
          <button
            className="flex w-full items-center justify-between gap-4 p-4 text-left font-medium"
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          >
            {faq.question}
            <ChevronDown className={cn("h-4 w-4 transition", openIndex === index && "rotate-180")} />
          </button>
          {openIndex === index ? (
            <div className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{faq.answer}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
