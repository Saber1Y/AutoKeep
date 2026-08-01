import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadRootEnv() {
  const envPath = resolve(import.meta.dirname, "..", "..", ".env");
  try {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith("#")) {
        continue;
      }
      const eq = trimmed.indexOf("=");
      if (eq === -1) {
        continue;
      }
      const key = trimmed.slice(0, eq).trim();
      if (process.env[key] === undefined) {
        process.env[key] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // No root .env present; rely on the environment.
  }
}

loadRootEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@autokeep/keeperhub-client", "@autokeep/shared"],
};

export default nextConfig;
