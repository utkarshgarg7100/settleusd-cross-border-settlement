import { NextResponse } from "next/server";

export const revalidate = 300; // FX moves slowly enough; spare the free API.

export async function GET() {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR", {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`FX upstream ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.INR;
    if (typeof rate !== "number") throw new Error("FX upstream returned no INR rate");
    return NextResponse.json({ rate, date: data.date, source: "frankfurter.app (ECB reference)" });
  } catch {
    // Stale-but-labelled beats a broken panel in a demo.
    return NextResponse.json({ rate: 88.5, date: null, source: "fallback (live rate unavailable)" });
  }
}
