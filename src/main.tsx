import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "@/services/i18n/I18nProvider";
import { authenticatePi, initPi } from "@/services/pi/piService";
import App from "@/App";
import "@/styles/index.css";

// Initialize Pi SDK early but gracefully (Spec §8): a missing/broken SDK
// never crashes the app — only Pi-specific features stay unavailable.
void (async () => {
  await initPi();
  // Auto-trigger Pi authentication on load (App Studio integration prompt).
  // Safe no-op outside Pi Browser; never blocks or crashes rendering.
  void authenticatePi(["username"]);
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
