import type { Locale } from "@/services/i18n";
import {
  saveDataCard as persistCard,
  getDataCards,
  deleteDataCard as removeCard,
} from "@/services/storage/storageService";
import { shareViaPi } from "@/services/pi/piService";
import type { SavedDataCard } from "@/services/storage/storageKeys";

/**
 * Life Data Card service (Spec §5). Each tool produces a DataCardInput; this
 * service builds the card payload, renders a plain-text version (for sharing
 * and accessibility), and orchestrates save / share / list / delete.
 *
 * Image download (Spec §5: "若平台能力允許") is handled by the DataCard
 * component via canvas, not here — this service stays DOM-free and testable.
 */

export interface DataCardInput {
  tool: string;
  title: string;
  summary: string;
  fields: { label: string; value: string }[];
}

export interface DataCard extends DataCardInput {
  id: string;
  createdAt: string;
  locale: Locale;
}

const BRAND = "PI LIFE TOOLS";
const HEADER = "MY LIFE DATA";

export function buildDataCard(
  input: DataCardInput,
  locale: Locale,
): DataCard {
  return {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    locale,
  };
}

/** Plain-text render used for sharing and as an accessible fallback. */
export function renderCardText(card: DataCardInput): string {
  const lines = [
    HEADER,
    "",
    card.title.toUpperCase(),
    "",
    ...card.fields.map((f) => `${f.label.padEnd(16)}${f.value}`),
    "",
    card.summary,
    "",
    BRAND,
  ];
  return lines.join("\n");
}

export function saveCard(card: DataCard): void {
  const saved: SavedDataCard = {
    id: card.id,
    tool: card.tool,
    title: card.title,
    summary: card.summary,
    fields: card.fields,
    createdAt: card.createdAt,
    locale: card.locale,
  };
  persistCard(saved);
}

export function listCards(): SavedDataCard[] {
  return getDataCards();
}

export function removeDataCard(id: string): void {
  removeCard(id);
}

/** Share via Pi SDK dialog (with Web Share fallback). */
export function shareCard(card: DataCard, locale: Locale): boolean {
  void locale;
  return shareViaPi(card.title, renderCardText(card));
}
