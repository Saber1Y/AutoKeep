"use client";

import { useState } from "react";
import { ASSETS, type AssetKey } from "@autokeep/shared";
import { shortAddress } from "../lib/format";

const TOKEN_EXPLORERS: Record<string, string> = {
  "11155111": "https://eth-sepolia.blockscout.com",
};

export function AssetIcon({
  asset,
  size = 16,
}: {
  asset: AssetKey;
  size?: number;
}) {
  if (asset === "usdc") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#2775CA" />
        <g
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M12 5.2v13.6" />
          <path d="M9.4 7.9c0-1 .9-1.7 1.9-1.7h1.4c1 0 1.9.7 1.9 1.7s-.9 1.7-1.9 1.7H9.4c-1 0-1.9.7-1.9 1.7s.9 1.7 1.9 1.7h1.3c1 0 1.9.7 1.9 1.7s-.9 1.7-1.9 1.7h-1.4c-1 0-1.9-.7-1.9-1.7" />
        </g>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.6 20.8 12 12 22.4 3.2 12Z" />
      <path d="M12 4.4 17.9 12 12 19.6 6.1 12Z" />
      <path d="M6.4 12h11.2" />
    </svg>
  );
}

export function AssetTile({
  asset,
  size = 26,
}: {
  asset: AssetKey;
  size?: number;
}) {
  return (
    <span
      className={`asset-tile asset-${asset}`}
      style={{ width: size, height: size }}
      title={`${ASSETS[asset].name} (${ASSETS[asset].address})`}
    >
      <AssetIcon asset={asset} size={Math.round(size * 0.62)} />
    </span>
  );
}

export function AssetBadge({
  asset,
  networkId,
}: {
  asset: AssetKey;
  networkId: string;
}) {
  const info = ASSETS[asset];
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(info.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const explorerBase = TOKEN_EXPLORERS[networkId];
  const explorerUrl =
    asset === "usdc" && explorerBase ? `${explorerBase}/token/${info.address}` : null;

  return (
    <span className="asset-badge">
      <AssetIcon asset={asset} size={14} />
      <span className="asset-badge-symbol">{info.symbol}</span>
      <code className="asset-badge-address">{shortAddress(info.address)}</code>
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="asset-badge-link"
          title={`${info.name} ${info.address}`}
        >
          ↗
        </a>
      )}
      <button
        type="button"
        className="asset-badge-copy"
        onClick={copyAddress}
        title="Copy contract address"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}
