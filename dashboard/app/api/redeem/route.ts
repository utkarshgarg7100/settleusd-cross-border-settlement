import { NextResponse } from "next/server";
import { parseUnits } from "viem";
import { publicClient, contractAddress, issuerWallet, payeeAddress, SUSD_ABI, explorerTxUrl } from "@/lib/chain";

export const dynamic = "force-dynamic";

/**
 * The off-ramp leg: the exporter hands SUSD back to the issuer, the issuer burns it,
 * and (in a real system) a licensed partner wires INR. Supply drops — which is the
 * point of showing it next to the reserve ratio.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amountUsd = Number(body?.amountUsd);
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return NextResponse.json({ error: "Redemption amount must be a positive number." }, { status: 400 });
    }

    const amount = parseUnits(amountUsd.toFixed(6), 6);
    const address = contractAddress();
    const payee = payeeAddress();
    const { client } = issuerWallet();

    const balance = await publicClient.readContract({
      address, abi: SUSD_ABI, functionName: "balanceOf", args: [payee],
    });
    if (balance < amount) {
      return NextResponse.json(
        { error: "Exporter holds less SUSD than that — settle an invoice first." },
        { status: 400 }
      );
    }

    const hash = await client.writeContract({
      address, abi: SUSD_ABI, functionName: "burn", args: [payee, amount],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      return NextResponse.json({ error: "Redemption reverted on-chain.", hash }, { status: 502 });
    }

    return NextResponse.json({ hash, explorerUrl: explorerTxUrl(hash), amountUsd });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
