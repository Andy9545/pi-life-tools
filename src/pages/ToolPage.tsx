import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/services/i18n/context";
import {
  isToolSlug,
  toolIconKey,
  toolNameKey,
  toolTaglineKey,
} from "@/tools/registry";
import { toolComponents } from "@/tools";

export function ToolPage() {
  const { slug = "" } = useParams();
  const { t } = useI18n();

  if (!isToolSlug(slug)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">{t("empty.default")}</p>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-medium"
        >
          {t("common.backHome")}
        </Link>
      </div>
    );
  }

  const ToolComponent = toolComponents[slug];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        ← {t("common.backHome")}
      </Link>

      <header className="flex items-center gap-3 mb-6">
        <span className="text-3xl" aria-hidden>
          {t(toolIconKey(slug))}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t(toolNameKey(slug))}
          </h1>
          <p className="text-sm text-gray-500">{t(toolTaglineKey(slug))}</p>
        </div>
      </header>

      <ToolComponent />
    </div>
  );
}
