import { KeeperHubClient } from "@autokeep/keeperhub-client";

let client: KeeperHubClient | null = null;

export function getKeeperHubClient(): KeeperHubClient {
  const apiKey = process.env.KEEPERHUB_API_KEY;
  if (!apiKey) {
    throw new Error("KEEPERHUB_API_KEY is not set. Add it to the root .env file.");
  }
  if (!client) {
    client = new KeeperHubClient(apiKey);
  }
  return client;
}
