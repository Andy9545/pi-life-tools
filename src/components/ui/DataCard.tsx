import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import {
  saveCard,
  shareCard,
  type DataCard,
} from "@/services/data-card/dataCardService";

interface DataCardViewProps {
  card: DataCard;
  onSaved?: () => void;
}

function downloadPng(card: DataCard, header: string, brand: string): boolean {
  try {
    const canvas = document.createElement("canvas");
    const W = 720;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#6d28d9";
    ctx.fillRect(0, 0, W, 8);

    ctx.textBaseline = "top";
    ctx.fillStyle = "#a78bfa";
    ctx.font = "600 28px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(header, 56, 64);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "700 44px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(card.title.toUpperCase(), 56, 120);

    let y = 220;
    ctx.font = "400 26px ui-monospace, monospace";
    for (const f of card.fields) {
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(f.label, 56, y);
      ctx.fillStyle = "#f8fafc";
      ctx.fillText(f.value, 360, y);
      y += 56;
    }

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "400 24px ui-sans-serif, system-ui, sans-serif";
    wrapText(ctx, card.summary, 56, y + 24, W - 112, 34);

    ctx.fillStyle = "#6d28d9";
    ctx.font = "700 26px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(brand, 56, H - 72);

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `life-data-card-${card.tool}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    return false;
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(/\s+/);
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

export function DataCardView({ card, onSaved }: DataCardViewProps) {
  const { t } = useI18n();
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 text-gray-100">
      <div className="h-2 bg-[var(--color-brand)]" />
      <div className="p-6">
        <p className="text-sm font-semibold tracking-wider text-[var(--color-brand)]">
          {t("dataCard.header")}
        </p>
        <p className="mt-1 text-2xl font-bold uppercase">
          {card.title}
        </p>
        <dl className="mt-6 space-y-3">
          {card.fields.map((f) => (
            <div key={f.label} className="flex justify-between gap-4 text-sm">
              <dt className="text-gray-400">{f.label}</dt>
              <dd className="font-semibold text-right break-words">{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-gray-300">{card.summary}</p>
        <p className="mt-8 text-sm font-bold tracking-wider text-[var(--color-brand)]">
          {t("dataCard.brand")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-4 border-t border-gray-800 bg-gray-950">
        <button
          type="button"
          onClick={() => {
            saveCard(card);
            onSaved?.();
            flash(t("dataCard.saved"));
          }}
          className="px-4 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-medium active:scale-95 transition"
        >
          {t("dataCard.save")}
        </button>
        <button
          type="button"
          onClick={() => flash(shareCard(card, card.locale) ? t("common.shared") : "")}
          className="px-4 py-2.5 rounded-lg bg-gray-800 text-gray-100 text-sm font-medium active:scale-95 transition"
        >
          {t("dataCard.share")}
        </button>
        <button
          type="button"
          onClick={() => downloadPng(card, t("dataCard.header"), t("dataCard.brand"))}
          className="px-4 py-2.5 rounded-lg bg-gray-800 text-gray-100 text-sm font-medium active:scale-95 transition"
        >
          {t("dataCard.download")}
        </button>
        {toast && <span className="self-center text-xs text-gray-400">{toast}</span>}
      </div>
    </div>
  );
}
