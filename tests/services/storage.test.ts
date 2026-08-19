import { beforeEach, describe, expect, it } from "vitest";
import {
  addToolHistory,
  deleteDataCard,
  getDataCards,
  getLanguage,
  getToolHistory,
  resetState,
  saveDataCard,
  setLanguage,
  setResult,
  getResult,
} from "@/services/storage/storageService";
import { CURRENT_VERSION } from "@/services/storage/storageVersion";
import type { SavedDataCard } from "@/services/storage/storageKeys";

beforeEach(() => {
  resetState();
});

describe("storage service", () => {
  it("starts with no preferred language", () => {
    expect(getLanguage()).toBeNull();
  });

  it("persists and reads language", () => {
    setLanguage("ja");
    expect(getLanguage()).toBe("ja");
  });

  it("stores versioned state", () => {
    const raw = window.localStorage.getItem("pi-life-tools:state");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string).version).toBe(CURRENT_VERSION);
  });

  it("records tool history (capped)", () => {
    for (let i = 0; i < 60; i++) addToolHistory("mortgage");
    expect(getToolHistory().length).toBeLessThanOrEqual(50);
  });

  it("saves and deletes data cards", () => {
    const card: SavedDataCard = {
      id: "c1",
      tool: "life-time",
      title: "Life Time",
      summary: "52%",
      fields: [{ label: "Age", value: "42" }],
      createdAt: new Date().toISOString(),
      locale: "en",
    };
    saveDataCard(card);
    expect(getDataCards()).toHaveLength(1);
    deleteDataCard("c1");
    expect(getDataCards()).toHaveLength(0);
  });

  it("stores arbitrary results", () => {
    setResult("mortgage:last", { monthly: 1234 });
    expect(getResult<{ monthly: number }>("mortgage:last")?.monthly).toBe(1234);
  });

  it("survives corruption by resetting to defaults", () => {
    window.localStorage.setItem("pi-life-tools:state", "{not valid json");
    resetState();
    expect(getLanguage()).toBeNull();
    expect(getDataCards()).toEqual([]);
  });
});
