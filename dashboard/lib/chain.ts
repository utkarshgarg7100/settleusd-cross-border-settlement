import { createPublicClient, createWalletClient, http, getAddress, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, hardhat } from "viem/chains";

/** Minimal ABI — only what the dashboard reads and writes. */
export const SUSD_ABI = [
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "reserveRatioBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "paused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "decimals", stateMutability: "pure", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "burn", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [] },
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [] },
] as const;

const useSepolia = process.env.CHAIN === "sepolia";
export const chain = useSepolia ? sepolia : hardhat;

export const explorerTxUrl = (hash: string) =>
  useSepolia ? `https://sepolia.etherscan.io/tx/${hash}` : `#${hash}`;
export const explorerAddressUrl = (addr: string) =>
  useSepolia ? `https://sepolia.etherscan.io/address/${addr}` : `#${addr}`;
export const isSepolia = useSepolia;

const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";

export const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });

/** Throws with a readable message rather than a viem stack trace when unconfigured. */
export function contractAddress(): Address {
  const raw = process.env.CONTRACT_ADDRESS;
  if (!raw) throw new Error("CONTRACT_ADDRESS is not set — deploy SettleUSD and add it to dashboard/.env.local");
  return getAddress(raw);
}

/** The demo payer signs server-side, so a visitor needs no wallet to run the flow. */
export function payerWallet() {
  const key = process.env.PAYER_PRIVATE_KEY;
  if (!key) throw new Error("PAYER_PRIVATE_KEY is not set — add a funded burner key to dashboard/.env.local");
  const account = privateKeyToAccount(key.startsWith("0x") ? (key as `0x${string}`) : (`0x${key}` as `0x${string}`));
  return { account, client: createWalletClient({ account, chain, transport: http(rpcUrl) }) };
}

export function payeeAddress(): Address {
  const raw = process.env.PAYEE_ADDRESS;
  if (!raw) throw new Error("PAYEE_ADDRESS is not set — add the demo exporter address to dashboard/.env.local");
  return getAddress(raw);
}

/** The issuer retires supply on redemption. Deployer holds ISSUER_ROLE, so it defaults to the payer key. */
export function issuerWallet() {
  const key = process.env.ISSUER_PRIVATE_KEY || process.env.PAYER_PRIVATE_KEY;
  if (!key) throw new Error("ISSUER_PRIVATE_KEY is not set — add the deployer key to dashboard/.env.local");
  const account = privateKeyToAccount(key.startsWith("0x") ? (key as `0x${string}`) : (`0x${key}` as `0x${string}`));
  return { account, client: createWalletClient({ account, chain, transport: http(rpcUrl) }) };
}
