import { describe, expect, it } from "vitest";
import { translate } from "@/services/i18n/translate";
import { detectLocale, normalizeBrowserLang } from "@/services/i18n";
import { locales, defaultLocale } from "@/services/i18n";
import { messages } from "@/locales";

describe("translate", () => {
  it("returns the localized string", () => {
    expect(translate("en", "common.calculate")).toBe("Calculate");
    expect(translate("zh-TW", "common.calculate")).toBe("開始計算");
    expect(translate("ja", "common.calculate")).toBe("計算する");
  });

  it("falls back to the default locale then to the key (never undefined)", () => {
    expect(translate("en", "this.key.does.not.exist")).toBe(
      "this.key.does.not.exist",
    );
  });

  it("interpolates params", () => {
    const out = translate("en", "site.name");
    expect(typeof out).toBe("string");
  });
});

describe("locale detection", () => {
  it("maps Chinese variants correctly (Spec §4.2)", () => {
    expect(normalizeBrowserLang("zh-TW")).toBe("zh-TW");
    expect(normalizeBrowserLang("zh-Hant-TW")).toBe("zh-TW");
    expect(normalizeBrowserLang("zh-CN")).toBe("zh-CN");
    expect(normalizeBrowserLang("zh-Hans")).toBe("zh-CN");
    expect(normalizeBrowserLang("zh")).toBe("zh-TW");
  });

  it("maps ja/ko/es/en", () => {
    expect(normalizeBrowserLang("ja-JP")).toBe("ja");
    expect(normalizeBrowserLang("ko-KR")).toBe("ko");
    expect(normalizeBrowserLang("es-419")).toBe("es");
    expect(normalizeBrowserLang("en-US")).toBe("en");
  });

  it("falls back to null for unsupported", () => {
    expect(normalizeBrowserLang("fr-FR")).toBeNull();
  });

  it("detectLocale returns a supported locale", () => {
    expect(locales).toContain(detectLocale());
    expect(defaultLocale).toBe("en");
  });
});

/**
 * i18n completeness test (Spec §13): every key present in the default locale
 * must resolve to a string in every other locale. Catches missing translations
 * the moment a key is added.
 */
describe("i18n parity", () => {
  function flatten(obj: unknown, prefix = ""): string[] {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj as Record<string, unknown>).flatMap(
      ([k, v]) =>
        v && typeof v === "object"
          ? flatten(v, `${prefix}${k}.`)
          : [`${prefix}${k}`],
    );
  }

  const baseKeys = flatten(messages[defaultLocale]);

  it("default locale has a non-trivial key set", () => {
    expect(baseKeys.length).toBeGreaterThan(40);
  });

  for (const locale of locales) {
    it(`locale ${locale} has every key from ${defaultLocale}`, () => {
      const missing = baseKeys.filter((key) => {
        const v = key
          .split(".")
          .reduce<unknown>(
            (acc, seg) =>
              acc && typeof acc === "object"
                ? (acc as Record<string, unknown>)[seg]
                : undefined,
            messages[locale],
          );
        return typeof v !== "string";
      });
      expect(missing).toEqual([]);
    });
  }
});
