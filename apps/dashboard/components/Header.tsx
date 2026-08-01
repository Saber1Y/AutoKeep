import Link from "next/link";
import { CopyButton } from "./CopyButton";
import { getKeeperHubClient } from "../lib/server/keeperhub";
import { getNetworkLabel } from "../lib/server/data";
import { shortAddress } from "../lib/format";

export async function Header() {
  let walletAddress: string | null = null;
  try {
    const result = await getKeeperHubClient().getOrganizationWalletAddress();
    walletAddress = result.walletAddress;
  } catch {
    walletAddress = null;
  }

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">AutoKeep</span>
      </Link>
      <nav className="nav">
        <Link href="/">Overview</Link>
        <Link href="/audit">Audit</Link>
      </nav>
      <div className="topbar-right">
        <span className="network-badge">{getNetworkLabel()}</span>
        {walletAddress ? (
          <span className="wallet-pill">
            <code>{shortAddress(walletAddress)}</code>
            <CopyButton value={walletAddress} />
          </span>
        ) : (
          <span className="wallet-pill muted">wallet unavailable</span>
        )}
      </div>
    </header>
  );
}
