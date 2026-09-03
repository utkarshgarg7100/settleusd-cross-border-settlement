# Settlement simulator dashboard

Next.js + Tailwind front end for the SettleUSD demo. One page: raise an invoice, settle it in SUSD on-chain, and compare the measured result against a correspondent-banking wire.

**No wallet required.** The demo payer signs server-side with a burner key, so anyone opening the link can run the full flow. The trade-off is deliberate: a recruiter with no MetaMask and no Sepolia ETH still sees the demo work.

## Run locally

Against a local chain (fastest loop):

```bash
# terminal 1, from the repo root
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# terminal 2
cd dashboard
cp .env.example .env.local     # fill in the address + keys the deploy printed
npm run dev
```

A local Hardhat node keeps state in memory — restart it and you must redeploy and update `CONTRACT_ADDRESS`.

Against Sepolia: set `CHAIN=sepolia`, a real `RPC_URL`, and the deployed address. Tx hashes then link to Etherscan and settlement takes ~12–15s instead of ~0.1s — still the honest number to screenshot.

## Env

| Var | Purpose |
| --- | --- |
| `CHAIN` | `sepolia` or `localhost` — drives chain config and explorer links |
| `RPC_URL` | JSON-RPC endpoint |
| `CONTRACT_ADDRESS` | Deployed SettleUSD |
| `PAYER_PRIVATE_KEY` | Burner key holding SUSD; signs the settlement server-side |
| `PAYEE_ADDRESS` | Demo exporter address |
| `ISSUER_PRIVATE_KEY` | Optional — holder of `ISSUER_ROLE` for redemption burns. Defaults to `PAYER_PRIVATE_KEY`, which is correct when the deployer is also the demo payer. |

## Routes

- `GET /api/state` — supply, reserve ratio, pause state, payer/payee balances
- `POST /api/settle` — `{ amountUsd }` → transfers SUSD, returns tx hash, measured settlement time, gas
- `POST /api/redeem` — `{ amountUsd }` → issuer burns the exporter's SUSD, dropping total supply
- `GET /api/fx` — live USD/INR from frankfurter.app (ECB reference), 5-min cache, falls back to a labelled static rate

## Cost assumptions

The SWIFT-versus-stablecoin comparison uses labelled midpoint constants at the top of `app/page.tsx` — $35 flat fees, 2% bank FX markup, 0.2% off-ramp spread, $3000/ETH for expressing gas in dollars. They are visible in the UI, not buried in the math. Swap them for figures from your own cost model.
