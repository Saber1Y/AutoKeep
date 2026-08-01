# Real Executions

Every transaction in this file was executed by the AutoKeep agent through KeeperHub onchain.
This is the evidence trail for the hackathon submission.

## 2026-08-01 - First direct transfer (ETH)

- Network: Ethereum Sepolia (chainId 11155111)
- Type: native ETH transfer, 0.001 ETH
- From (treasury): `0x0f952ead67ba55f763eedb89c79eb947389f1a8d`
- To: `0x1111111111111111111111111111111111111111`
- Transaction: [sepolia.etherscan.io/tx/0x127b4229977fa8c9fdcdcb7840f998285596b80f03cc7aab1b69d938f836912e](https://sepolia.etherscan.io/tx/0x127b4229977fa8c9fdcdcb7840f998285596b80f03cc7aab1b69d938f836912e)
- Gas: **sponsored by KeeperHub** (`sponsored: true` in execution result)
- Confirmed onchain: yes, success
- Execution id: `zr22r4jds7czc2r8xqlou`
- Agent flow: simulate (`wouldRevert: false`) -> broadcast with idempotency key -> status polled for tx hash

## 2026-08-01 - Real payroll run (workflow)

- Network: Ethereum Sepolia (chainId 11155111)
- Workflow: `autokeep-payroll-Acme DAO Treasury` (`gxhepx4pi4ynyfg5n3znj`)
- Trigger: manual (`agent run`), execution `zl8vft89qeo0dy1sfgcbn`
- Three USDC transfers, all gas sponsored by KeeperHub, all confirmed onchain:

| Step | Recipient | Amount | Transaction |
| --- | --- | --- | --- |
| Pay Core Dev | `0x3Aa77077a0c8eddc7cCbb28Eff31605b7e6A79EA` | 8 USDC | [0x0586ca...](https://sepolia.etherscan.io/tx/0x0586cab284944e57e8418709aab56562e7e329afad42cc5ba648716793325f33) |
| Pay Community Lead | `0x06c2D94CD4b3AAF10C077C341f2f1FB0D203348c` | 6 USDC | [0xa52848...](https://sepolia.etherscan.io/tx/0xa52848189340b842f81ce3d346b3b71715fb89eb20711f142fae825cd08602c4) |
| Pay Designer | `0x4Aebb76C8D0BB9e46f44B97333e516335CeC49B7` | 4 USDC | [0x363984...](https://sepolia.etherscan.io/tx/0x36398418e9342842c917a1c02580187bb02f06b0614fc7421cf4b1781df32b36) |

- Recipient USDC balances confirmed onchain after the run: 8.0 / 6.0 / 4.0. Treasury: 20 -> 2 USDC.
- Agent verification: `agent verify zl8vft89qeo0dy1sfgcbn` -> **VERIFIED 15/15 checks passed** (count, recipient, amount, tx hash, gas bounds, all roster paid, no step errors).
- Observed quirk: the top-level execution `transactionHashes` array omitted the final transfer hash; the per-node log still carries it, so verification must read the logs (it does).
