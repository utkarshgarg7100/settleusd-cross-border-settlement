import { NextResponse } from "next/server";
import { publicClient, contractAddress, payerWallet, payeeAddress, SUSD_ABI, isSepolia, chain } from "@/lib/chain";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const address = contractAddress();
    const payer = payerWallet().account.address;
    const payee = payeeAddress();
    const contract = { address, abi: SUSD_ABI } as const;

    const [totalSupply, reserveRatioBps, paused, payerBalance, payeeBalance] = await Promise.all([
      publicClient.readContract({ ...contract, functionName: "totalSupply" }),
      publicClient.readContract({ ...contract, functionName: "reserveRatioBps" }),
      publicClient.readContract({ ...contract, functionName: "paused" }),
      publicClient.readContract({ ...contract, functionName: "balanceOf", args: [payer] }),
      publicClient.readContract({ ...contract, functionName: "balanceOf", args: [payee] }),
    ]);

    return NextResponse.json({
      contract: address,
      chain: chain.name,
      isSepolia,
      totalSupply: totalSupply.toString(),
      reserveRatioBps: Number(reserveRatioBps),
      paused,
      payer: { address: payer, balance: payerBalance.toString() },
      payee: { address: payee, balance: payeeBalance.toString() },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
