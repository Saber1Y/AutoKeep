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
      <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g fill="none">
          <circle fill="#3E73C4" cx="16" cy="16" r="16" />
          <g fill="#FFF">
            <path d="M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.243-2.193-.728-2.193-1.578 0-.85.61-1.396 1.828-1.396 1.097 0 1.707.364 2.011 1.275a.458.458 0 00.427.303h.975a.416.416 0 00.427-.425v-.06a3.04 3.04 0 00-2.743-2.489V9.142c0-.243-.183-.425-.487-.486h-.915c-.243 0-.426.182-.487.486v1.396c-1.829.242-2.986 1.456-2.986 2.974 0 2.002 1.218 2.791 3.778 3.095 1.707.303 2.255.668 2.255 1.639 0 .97-.853 1.638-2.011 1.638-1.585 0-2.133-.667-2.316-1.578-.06-.242-.244-.364-.427-.364h-1.036a.416.416 0 00-.426.425v.06c.243 1.518 1.219 2.61 3.23 2.914v1.457c0 .242.183.425.487.485h.915c.243 0 .426-.182.487-.485V21.34c1.829-.303 3.047-1.578 3.047-3.217z" />
            <path d="M12.892 24.497c-4.754-1.7-7.192-6.98-5.424-11.653.914-2.55 2.925-4.491 5.424-5.402.244-.121.365-.303.365-.607v-.85c0-.242-.121-.424-.365-.485-.061 0-.183 0-.244.06a10.895 10.895 0 00-7.13 13.717c1.096 3.4 3.717 6.01 7.13 7.102.244.121.488 0 .548-.243.061-.06.061-.122.061-.243v-.85c0-.182-.182-.424-.365-.546zm6.46-18.936c-.244-.122-.488 0-.548.242-.061.061-.061.122-.061.243v.85c0 .243.182.485.365.607 4.754 1.7 7.192 6.98 5.424 11.653-.914 2.55-2.925 4.491-5.424 5.402-.244.121-.365.303-.365.607v.85c0 .242.121.424.365.485.061 0 .183 0 .244-.06a10.895 10.895 0 007.13-13.717c-1.096-3.46-3.778-6.07-7.13-7.162z" />
          </g>
        </g>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="none" fillRule="evenodd">
        <circle cx="16" cy="16" r="16" fill="#627EEA" />
        <g fill="#FFF" fillRule="nonzero">
          <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
          <path d="M16.498 4L9 16.22l7.498-3.35z" />
          <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
          <path d="M16.498 27.995v-6.028L9 17.616z" />
          <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
          <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
        </g>
      </g>
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
      className="asset-tile"
      style={{ width: size, height: size }}
      title={`${ASSETS[asset].name} (${ASSETS[asset].address})`}
    >
      <AssetIcon asset={asset} size={size} />
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
