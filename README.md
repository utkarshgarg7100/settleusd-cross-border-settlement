# SettleUSD (SUSD)

**Live on Sepolia:** [`0x6b887a87BC07749957690ed197296dCb8Ab532F0`](https://sepolia.etherscan.io/address/0x6b887a87BC07749957690ed197296dCb8Ab532F0#code) — source verified.
Measured settlement: **4.3s** end to end, ~$0.12 gas, against 2&ndash;5 business days on a SWIFT wire.

Testnet payment stablecoin backing a B2B cross-border settlement demo. **Portfolio artifact — not production.** No real reserves back this token.

`contracts/SettleUSD.sol` — ERC20, 6 decimals (mirrors USDC), `ISSUER_ROLE` for mint/burn/pause, plus a display-only `reserveRatioBps` the dashboard reads. Events: `Minted`, `Burned`, `ReserveRatioUpdated`.

## Test

```bash
npm test          # or: npx hardhat test
```

## Deploy to Sepolia

1. `cp .env.example .env` and fill in:
   - `SEPOLIA_RPC_URL` — Alchemy/Infura endpoint
   - `DEPLOYER_PRIVATE_KEY` — a **burner** key, funded with Sepolia ETH from a faucet
   - `ETHERSCAN_API_KEY` — for source verification
2. Deploy (also mints 1,000,000 SUSD to the deployer so the dashboard has supply to move):

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. Verify — the deploy script prints the exact command:

```bash
npx hardhat verify --network sepolia <ADDRESS> <DEPLOYER_ADDRESS>
```

The verified Etherscan link is the point: it makes the demo independently checkable.

## Feeding the dashboard

The frontend needs the deployed address and `artifacts/contracts/SettleUSD.sol/SettleUSD.json` (the ABI).
