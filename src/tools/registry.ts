/**
 * Central registry of the 8 life tools (Spec §3). The dashboard, routing, and
 * tool pages all derive from this so they can never drift apart. Adding a tool
 * means adding a slug here plus its calculate() and locale keys — never
 * touching the dashboard or router logic.
 */
export const TOOLS = [
  "financial-health",
  "compound-interest",
  "goal-planner",
  "life-time",
  "mortgage",
  "debt-payoff",
  "life-decision",
  "time-value",
] as const;

export type ToolSlug = (typeof TOOLS)[number];

export function isToolSlug(value: string): value is ToolSlug {
  return (TOOLS as readonly string[]).includes(value);
}

/** Stable display order with the home-page grouping (Spec §9). */
export const TOOL_GROUPS: { labelKey: string; slugs: ToolSlug[] }[] = [
  { labelKey: "dashboard.tools", slugs: ["financial-health", "compound-interest", "goal-planner", "life-time"] },
  { labelKey: "dashboard.tools", slugs: ["mortgage", "debt-payoff", "life-decision", "time-value"] },
];

export function toolNameKey(slug: ToolSlug): string {
  return `tools.${slug}.name`;
}

export function toolTaglineKey(slug: ToolSlug): string {
  return `tools.${slug}.tagline`;
}

export function toolIconKey(slug: ToolSlug): string {
  return `tools.${slug}.icon`;
}
