import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { DataCardView } from "./DataCard";
import {
  buildDataCard,
  type DataCard,
  type DataCardInput,
} from "@/services/data-card/dataCardService";

/**
 * Reveals a Life Data Card on demand (Spec §5). Renders a "generate" button
 * first; once clicked, builds the card (current locale) and shows the full
 * preview with save / share / download actions.
 */
export function DataCardGate({ cardInput }: { cardInput: DataCardInput }) {
  const { t, locale } = useI18n();
  const [card, setCard] = useState<DataCard | null>(null);

  if (!card) {
    return (
      <button
        type="button"
        onClick={() => setCard(buildDataCard(cardInput, locale))}
        className="mt-4 w-full px-4 py-3 rounded-xl bg-[var(--color-brand)] text-white font-medium active:scale-[0.98] transition"
      >
        {t("common.generateCard")}
      </button>
    );
  }
  return (
    <div className="mt-4">
      <DataCardView card={card} />
    </div>
  );
}
