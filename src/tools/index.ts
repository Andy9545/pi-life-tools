import type { ComponentType } from "react";
import type { ToolSlug } from "./registry";
import { FinancialHealthTool } from "./financial-health/component";
import { CompoundInterestTool } from "./compound-interest/component";
import { GoalPlannerTool } from "./goal-planner/component";
import { LifeTimeTool } from "./life-time/component";
import { MortgageTool } from "./mortgage/component";
import { DebtPayoffTool } from "./debt-payoff/component";
import { LifeDecisionTool } from "./life-decision/component";
import { TimeValueTool } from "./time-value/component";

/** Slug → tool UI component. Adding a tool means adding one entry here. */
export const toolComponents: Record<ToolSlug, ComponentType> = {
  "financial-health": FinancialHealthTool,
  "compound-interest": CompoundInterestTool,
  "goal-planner": GoalPlannerTool,
  "life-time": LifeTimeTool,
  mortgage: MortgageTool,
  "debt-payoff": DebtPayoffTool,
  "life-decision": LifeDecisionTool,
  "time-value": TimeValueTool,
};
