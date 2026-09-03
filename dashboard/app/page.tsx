"use client";

import { useEffect, useState } from "react";

type State = {
  contract: string; chain: string; isSepolia: boolean;
  totalSupply: string; reserveRatioBps: number; paused: boolean;
  payer: { address: string; balance: string };
  payee: { address: string; balance: string };
  error?: string;
};
type Receipt = {
  hash: string; explorerUrl: string; settledMs: number;
  blockNumber: string; gasUsed: string; gasEth: string; amountUsd: number;
};
type Fx = { rate: number; date: string | null; source: string };

// Labelled assumptions — every one of these is visible in the UI, not hidden in the math.
const SWIFT_FLAT_FEE_USD = 35;      // correspondent + lifting charges, midpoint of $25–50
const SWIFT_FX_SPREAD = 0.02;       // bank markup vs mid-market, midpoint of 1–3%
const OFFRAMP_SPREAD = 0.002;       // stablecoin off-ramp, midpoint of 0.1–0.3%
const ETH_USD = 3000;               // for expressing gas in dollars

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const inr = (n: number) => n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const susd = (raw: string) => (Number(raw) / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 });
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export default function Home() {
  const [state, setState] = useState<State | null>(null);
  const [fx, setFx] = useState<Fx | null>(null);
  const [payerName, setPayerName] = useState("Northwind Analytics, Inc. (Delaware)");
  const [payeeName, setPayeeName] = useState("Meridian Labs Pvt Ltd (Bengaluru)");
  const [amount, setAmount] = useState("50000");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const loadState = () => fetch("/api/state").then((r) => r.json()).then(setState).catch(() => {});
  useEffect(() => {
    loadState();
    fetch("/api/fx").then((r) => r.json()).then(setFx).catch(() => {});
  }, []);

  async function settle() {
    setBusy(true); setError(null); setReceipt(null); setStep(1);
    try {
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amountUsd: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Settlement failed");
      setStep(2); setReceipt(data);
      setTimeout(() => setStep(4), 400);
      loadState();
    } catch (e) {
      setError((e as Error).message); setStep(0);
    } finally {
      setBusy(false);
    }
  }

  async function redeem() {
    if (!state) return;
    const payeeUsd = Number(state.payee.balance) / 1e6;
    setRedeeming(true); setError(null);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amountUsd: payeeUsd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Redemption failed");
      loadState();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRedeeming(false);
    }
  }

  const amt = Number(amount) || 0;
  const swiftCost = SWIFT_FLAT_FEE_USD + amt * SWIFT_FX_SPREAD;
  const gasUsd = receipt ? Number(receipt.gasEth) * ETH_USD : 0;
  const stableCost = amt * OFFRAMP_SPREAD + gasUsd;
  const saving = swiftCost - stableCost;
  const payoutUsd = amt - stableCost;
  const swiftPayoutUsd = amt - swiftCost;

  return (
    <main className="min-h-screen bg-[#0a0d14] text-slate-200 antialiased">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Header state={state} />

        {state?.error && <Banner tone="err">{state.error}</Banner>}
        {error && <Banner tone="err">{error}</Banner>}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          <Card title="Invoice" sub="Raised by the exporter, payable by the US client.">
            <div className="space-y-4">
              <Field label="Payer" value={payerName} onChange={setPayerName} />
              <Field label="Payee" value={payeeName} onChange={setPayeeName} />
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Invoice amount (USD)
                </label>
                <div className="flex items-center rounded-lg border border-white/10 bg-black/30 focus-within:border-emerald-500/50">
                  <span className="pl-3 text-slate-500">$</span>
                  <input
                    type="number" value={amount} min="1"
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent px-2 py-2.5 text-lg font-semibold tabular-nums text-white outline-none"
                  />
                  <span className="pr-3 text-xs font-medium text-slate-500">SUSD</span>
                </div>
              </div>

              <button
                onClick={settle}
                disabled={busy || !state || amt <= 0}
                className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {busy ? "Settling on-chain…" : "Settle via stablecoin"}
              </button>

              <Steps step={step} />
            </div>
          </Card>

          <div className="space-y-5">
            <Card title="Settlement receipt" sub={receipt ? "Confirmed on-chain." : "Runs once you settle."}>
              {receipt ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tabular-nums text-emerald-400">
                      {(receipt.settledMs / 1000).toFixed(1)}s
                    </span>
                    <span className="text-sm text-slate-500">click to confirmation</span>
                  </div>
                  <Row label="Tx hash">
                    {state?.isSepolia ? (
                      <a href={receipt.explorerUrl} target="_blank" rel="noreferrer"
                         className="font-mono text-emerald-400 underline decoration-emerald-400/30 underline-offset-2">
                        {short(receipt.hash)} ↗
                      </a>
                    ) : (
                      <span className="font-mono">{short(receipt.hash)}</span>
                    )}
                  </Row>
                  <Row label="Block">{receipt.blockNumber}</Row>
                  <Row label="Gas">{Number(receipt.gasEth).toFixed(6)} ETH · ≈{usd(gasUsd)}</Row>
                </div>
              ) : (
                <Empty>No settlement yet.</Empty>
              )}
            </Card>

            <Card title="Reserve &amp; supply" sub="Read live from the SettleUSD contract.">
              {state ? (
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Total supply" value={`${susd(state.totalSupply)} SUSD`} />
                  <Stat label="Reserve ratio" value={`${(state.reserveRatioBps / 100).toFixed(2)}%`}
                        tone={state.reserveRatioBps >= 10000 ? "good" : "warn"} />
                  <Stat label="Payer balance" value={`${susd(state.payer.balance)} SUSD`} />
                  <Stat label="Payee balance" value={`${susd(state.payee.balance)} SUSD`} />
                  <div className="col-span-2 mt-1 border-t border-white/10 pt-3">
                    <button
                      onClick={redeem}
                      disabled={redeeming || Number(state.payee.balance) === 0}
                      className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-600"
                    >
                      {redeeming
                        ? "Burning…"
                        : Number(state.payee.balance) === 0
                        ? "Nothing to redeem"
                        : `Redeem ${susd(state.payee.balance)} SUSD → burn supply`}
                    </button>
                    <p className="mt-1.5 text-[11px] leading-snug text-slate-600">
                      The exporter hands SUSD back; the issuer burns it and a licensed partner wires INR.
                      Watch total supply fall.
                    </p>
                  </div>
                </div>
              ) : (
                <Empty>Connecting to chain…</Empty>
              )}
            </Card>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card title="Traditional SWIFT wire" sub="What this invoice costs on correspondent banking rails." tone="muted">
            <div className="space-y-3">
              <BigStat value="2–5 business days" label="Settlement time" tone="muted" />
              <Row label="Correspondent + lifting fees">{usd(SWIFT_FLAT_FEE_USD)}</Row>
              <Row label={`Bank FX markup (${(SWIFT_FX_SPREAD * 100).toFixed(0)}%)`}>{usd(amt * SWIFT_FX_SPREAD)}</Row>
              <Divider />
              <Row label="Total cost" strong>{usd(swiftCost)}</Row>
              <Row label="Exporter receives" strong>{usd(swiftPayoutUsd)}</Row>
            </div>
          </Card>

          <Card title="Stablecoin settlement" sub="Same invoice, SUSD rail." tone="accent">
            <div className="space-y-3">
              <BigStat
                value={receipt ? `${(receipt.settledMs / 1000).toFixed(1)} seconds` : "seconds"}
                label="Settlement time (measured)" tone="accent"
              />
              <Row label="Network gas">{receipt ? `≈${usd(gasUsd)}` : "—"}</Row>
              <Row label={`Off-ramp spread (${(OFFRAMP_SPREAD * 100).toFixed(1)}%)`}>{usd(amt * OFFRAMP_SPREAD)}</Row>
              <Divider />
              <Row label="Total cost" strong>{usd(stableCost)}</Row>
              <Row label="Exporter receives" strong accent>{usd(payoutUsd)}</Row>
            </div>
          </Card>
        </div>

        <Card
          className="mt-5"
          title="INR payout (simulated)"
          sub="Off-ramp leg. No real fiat moves — this is where a licensed partner would settle to the exporter's account."
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Lands in exporter&apos;s account</div>
              <div className="mt-1 text-4xl font-semibold tabular-nums text-white">
                {fx ? inr(payoutUsd * fx.rate) : "—"}
              </div>
              <div className="mt-1.5 text-xs text-slate-500">
                {fx ? `at ${fx.rate.toFixed(4)} USD/INR · ${fx.source}${fx.date ? ` · ${fx.date}` : ""}` : "loading rate…"}
              </div>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
              <div className="text-xs uppercase tracking-wider text-emerald-500/80">Saved vs SWIFT</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-emerald-400">
                {usd(saving)} {fx && <span className="text-base text-emerald-500/70">· {inr(saving * fx.rate)}</span>}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {amt > 0 ? `${((saving / amt) * 100).toFixed(2)}% of invoice value` : ""}
              </div>
            </div>
          </div>
        </Card>

        <Card className="mt-5" title="About this project" sub="Portfolio artifact — Utkarsh Garg.">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
            An Indian exporter invoicing US clients waits 2&ndash;5 business days for a SWIFT wire and loses
            1&ndash;3% to a bank&apos;s FX markup before the money lands. This demo settles the same invoice on a
            stablecoin rail and measures what actually happens: a real ERC-20 transfer, a real confirmation time,
            real gas. The redemption leg burns supply the way an issuer retires tokens against reserves. Nothing
            here touches Indian banking rails &mdash; under the RBI&apos;s current stance it can&apos;t, which is
            why the off-ramp is drawn as a licensed partner rather than a bank integration.
          </p>
        </Card>

        <footer className="mt-8 border-t border-white/5 pt-5 text-xs leading-relaxed text-slate-500">
          <strong className="text-slate-400">This is a simulation, not a production system.</strong> SUSD is an
          unbacked testnet token; no reserves exist and no fiat moves. SWIFT figures are labelled midpoint
          assumptions, not quotes. Built as a portfolio artifact to demonstrate stablecoin settlement mechanics
          against traditional cross-border rails.
        </footer>
      </div>
    </main>
  );
}

function Header({ state }: { state: State | null }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          SettleUSD <span className="text-slate-600">/</span>{" "}
          <span className="text-slate-400">B2B cross-border settlement</span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-slate-500">
          An Indian exporter invoices a US client. Watch the same invoice settle on a stablecoin rail versus
          correspondent banking.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-400">
          {state?.chain ?? "…"}
        </span>
        {state?.paused && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-400">
            paused
          </span>
        )}
        {state?.contract && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-slate-400">
            {short(state.contract)}
          </span>
        )}
      </div>
    </header>
  );
}

const STEPS = ["Invoice raised", "Payer transfers SUSD", "Confirmed on-chain", "Converted to INR"];

function Steps({ step }: { step: number }) {
  return (
    <ol className="space-y-2 pt-1">
      {STEPS.map((s, i) => {
        const done = step > i;
        const active = step === i + 1;
        return (
          <li key={s} className="flex items-center gap-2.5 text-sm">
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] font-semibold transition ${
                done
                  ? "border-emerald-500 bg-emerald-500 text-emerald-950"
                  : active
                  ? "animate-pulse border-emerald-500 text-emerald-400"
                  : "border-white/15 text-slate-600"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={done ? "text-slate-300" : active ? "text-emerald-400" : "text-slate-600"}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Card({ title, sub, children, tone = "default", className = "" }: {
  title: string; sub?: string; children: React.ReactNode;
  tone?: "default" | "accent" | "muted"; className?: string;
}) {
  const ring =
    tone === "accent" ? "border-emerald-500/25 bg-emerald-500/[0.04]"
    : tone === "muted" ? "border-white/10 bg-white/[0.02]"
    : "border-white/10 bg-white/[0.03]";
  return (
    <section className={`rounded-xl border ${ring} p-5 ${className}`}>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {sub && <p className="mt-0.5 mb-4 text-xs text-slate-500">{sub}</p>}
      {children}
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">{label}</label>
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
      />
    </div>
  );
}

function Row({ label, children, strong, accent }: {
  label: string; children: React.ReactNode; strong?: boolean; accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`tabular-nums ${accent ? "text-emerald-400" : strong ? "text-white" : "text-slate-300"} ${strong ? "font-semibold" : ""}`}>
        {children}
      </span>
    </div>
  );
}

function BigStat({ value, label, tone }: { value: string; label: string; tone: "accent" | "muted" }) {
  return (
    <div className="pb-1">
      <div className={`text-2xl font-semibold ${tone === "accent" ? "text-emerald-400" : "text-slate-300"}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold tabular-nums ${tone === "warn" ? "text-amber-400" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

const Divider = () => <div className="h-px bg-white/10" />;
const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="py-6 text-center text-sm text-slate-600">{children}</div>
);

function Banner({ tone, children }: { tone: "err"; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {children}
    </div>
  );
}
