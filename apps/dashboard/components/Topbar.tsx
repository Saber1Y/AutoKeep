import { CopyButton } from "./CopyButton";
import { NavLink } from "./NavLink";
import { getKeeperHubClient } from "../lib/server/keeperhub";
import { getNetworkLabel } from "../lib/server/data";
import { shortAddress } from "../lib/format";

export async function Topbar() {
  let walletAddress: string | null = null;
  try {
    const result = await getKeeperHubClient().getOrganizationWalletAddress();
    walletAddress = result.walletAddress;
  } catch {
    walletAddress = null;
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">Treasury operations</span>
        <span className="topbar-sub">autonomous agent · onchain</span>
      </div>

      <div className="mobile-nav">
        <a href="/dashboard" className="mobile-brand">
          <span className="brand-mark" aria-hidden="true" />
          AutoKeep
        </a>
        <NavLink href="/dashboard">Overview</NavLink>
        <NavLink href="/dashboard/strategy">Strategy</NavLink>
        <NavLink href="/dashboard/audit">Audit</NavLink>
      </div>

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
