import { NextResponse } from "next/server";
import { formatUnits } from "viem";
import { publicClient, contractAddress, issuerWallet, payerWallet, SUSD_ABI, explorerTxUrl } from "@/lib/chain";

export const dynamic = "force-dynamic";

/** The demo starts here, so topping back up to it keeps a public link working indefinitely. */
const TARGET_SUSD = 1_000_000n * 10n ** 6n;

/**
 * Reset: mint the demo payer back up to its starting balance.
 * Deliberately takes no amount — a public endpoint that mints an arbitrary
 * number on request is an easy way for a stranger to burn your gas.
 */
export async function POST() {
  try {
    const address = contractAddress();
    const payer = payerWallet().account.address;
    const { client } = issuerWallet();

    const balance = await publicClient.readContract({
      address,
      abi: SUSD_ABI,
      functionName: "balanceOf",
      args: [payer],
    });

    if (balance >= TARGET_SUSD) {
      return NextResponse.json({
        skipped: true,
        message: "Demo payer is already topped up.",
        balance: formatUnits(balance, 6),
      });
    }

    const amount = TARGET_SUSD - balance;
    const hash = await client.writeContract({
      address,
      abi: SUSD_ABI,
      functionName: "mint",
      args: [payer, amount],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      return NextResponse.json({ error: "Mint reverted on-chain.", hash }, { status: 502 });
    }

    return NextResponse.json({
      hash,
      explorerUrl: explorerTxUrl(hash),
      minted: formatUnits(amount, 6),
      balance: formatUnits(TARGET_SUSD, 6),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
