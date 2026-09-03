import { NextResponse } from "next/server";
import { parseUnits, formatEther } from "viem";
import { publicClient, contractAddress, payerWallet, payeeAddress, SUSD_ABI, explorerTxUrl } from "@/lib/chain";

export const dynamic = "force-dynamic";

const MAX_INVOICE_USD = 1_000_000;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amountUsd = Number(body?.amountUsd);

    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return NextResponse.json({ error: "Invoice amount must be a positive number." }, { status: 400 });
    }
    if (amountUsd > MAX_INVOICE_USD) {
      return NextResponse.json({ error: `Demo caps invoices at $${MAX_INVOICE_USD.toLocaleString()}.` }, { status: 400 });
    }

    // 6 decimals; reject sub-cent precision rather than silently truncating money.
    const amount = parseUnits(amountUsd.toFixed(6), 6);
    const address = contractAddress();
    const { account, client } = payerWallet();
    const payee = payeeAddress();

    const balance = await publicClient.readContract({
      address, abi: SUSD_ABI, functionName: "balanceOf", args: [account.address],
    });
    if (balance < amount) {
      return NextResponse.json(
        { error: "Demo payer is out of SUSD — mint more to the payer address." },
        { status: 400 }
      );
    }

    const startedAt = Date.now();
    const hash = await client.writeContract({
      address, abi: SUSD_ABI, functionName: "transfer", args: [payee, amount],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const settledMs = Date.now() - startedAt;

    if (receipt.status !== "success") {
      return NextResponse.json({ error: "Transfer reverted on-chain.", hash }, { status: 502 });
    }

    const gasEth = formatEther(receipt.gasUsed * (receipt.effectiveGasPrice ?? 0n));

    return NextResponse.json({
      hash,
      explorerUrl: explorerTxUrl(hash),
      settledMs,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
      gasEth,
      amountUsd,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
