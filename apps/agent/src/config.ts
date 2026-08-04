import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { StrategyConfig } from "@autokeep/shared";
import { validateStrategy } from "@autokeep/strategy";
import { projectRoot } from "./env.js";

export interface LoadedStrategy {
  config: StrategyConfig;
  path: string;
}

export function loadStrategy(path?: string): LoadedStrategy {
  const configPath = path
    ? resolve(path)
    : resolve(projectRoot(), "apps", "agent", "config", "strategy.json");
  if (!existsSync(configPath)) {
    throw new Error(
      `Strategy config not found at ${configPath}. Copy apps/agent/config/strategy.example.json to strategy.json and edit it.`
    );
  }
  const raw = readFileSync(configPath, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Strategy config is not valid JSON: ${(error as Error).message}`);
  }
  const config = validateStrategy(parsed);
  return { config, path: configPath };
}

export { validateStrategy };
