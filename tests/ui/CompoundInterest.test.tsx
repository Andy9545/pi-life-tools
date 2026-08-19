import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@/services/i18n/I18nProvider";
import { CompoundInterestTool } from "@/tools/compound-interest/component";
import { resetState } from "@/services/storage/storageService";

beforeEach(() => {
  resetState();
});

afterEach(() => {
  resetState();
});

function renderTool() {
  return render(
    <I18nProvider>
      <CompoundInterestTool />
    </I18nProvider>,
  );
}

describe("CompoundInterestTool UI", () => {
  it("calculates and renders the final amount (no NaN/Infinity)", () => {
    renderTool();
    fireEvent.change(screen.getByLabelText("Initial Principal"), {
      target: { value: "10000" },
    });
    fireEvent.change(screen.getByLabelText("Monthly Contribution"), {
      target: { value: "200" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));

    expect(screen.getByText("Final Amount")).toBeDefined();
    const doc = document.body.textContent ?? "";
    expect(doc).toMatch(/\$[\d,]+\.\d{2}/);
    expect(doc).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("shows a localized error when a field is empty", () => {
    renderTool();
    fireEvent.change(screen.getByLabelText("Monthly Contribution"), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText("Initial Principal"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));

    expect(screen.getByText("Please enter a value.")).toBeDefined();
  });

  it("guards against extreme input (too large, never NaN)", () => {
    renderTool();
    fireEvent.change(screen.getByLabelText("Initial Principal"), {
      target: { value: "10000" },
    });
    fireEvent.change(screen.getByLabelText("Monthly Contribution"), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText("Investment Years"), {
      target: { value: "1000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));

    expect(screen.getByText("Value is too large.")).toBeDefined();
    expect(document.body.textContent ?? "").not.toMatch(/NaN|Infinity/);
  });
});
