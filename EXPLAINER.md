# SettleUSD — The Whole Project, Explained From Zero

> **Who this is for:** you, six months from now, having forgotten everything. Or an interviewer. Or a friend who has never heard the word "blockchain."
>
> **Rule for this document:** nothing is assumed. Every word that sounds technical gets explained the first time it shows up.
>
> 🔒 **This is the public version.** Every secret has been replaced with a placeholder like `YOUR_ALCHEMY_KEY`. The addresses are real — those are public by design. Part 4 explains what each secret does and why the private key is the only one that can actually hurt you.

---

# PART 1 — WHAT DID WE ACTUALLY BUILD?

## 1.1 The problem, told as a story

Imagine a small software company in Bengaluru called **Meridian Labs**. They write code for an American company in Delaware called **Northwind Analytics**.

Every month, Meridian sends Northwind a bill — an **invoice** — for **$50,000**.

Now Northwind has to send that money from America to India. Here's what actually happens today:

1. Northwind tells its American bank: "send $50,000 to Meridian in India."
2. The American bank doesn't have an office in India. So it passes the money to another bank. That bank passes it to another. These middlemen are called **correspondent banks** — think of it like a parcel being handed between three delivery companies because no single one covers the whole route.
3. **Each middleman takes a small cut.** Roughly $25–50 in total, in fees with names like "lifting charges."
4. When the dollars finally become rupees, the bank decides the exchange rate — and it gives Meridian a *worse* rate than the real one. If the real rate is ₹95 per dollar, the bank might pay ₹93. That gap is called the **FX spread** or **markup**, and it's usually **1–3%** of the whole amount. On $50,000 that's **$500–1,500** — far more than the fees.
5. The whole thing takes **2 to 5 business days**. If Northwind sends it on a Thursday, Meridian might see it the following Wednesday.

**Add it up:** on a $50,000 invoice, Meridian loses about **$1,035** and waits nearly a week.

That happens every single month. That's ₹10 lakh+ a year, gone, for a company with maybe fifteen employees.

## 1.2 The idea

What if, instead of dollars crawling through three banks, Northwind sent a **digital dollar** that moves directly, in seconds, for pennies?

That's what a **stablecoin** is. And that's what we built a working demonstration of.

## 1.3 What "stablecoin" means

You've heard of Bitcoin. Bitcoin's problem for payments is that its price jumps around — worth $60,000 today, $52,000 next week. Nobody wants to be paid in something that might lose 15% before they can spend it.

A **stablecoin** is a digital coin designed to always be worth exactly **$1**.

How does it stay at $1? The honest answer: a company holds one real dollar in a real bank account for every digital coin it creates. If you hand back the coin, they hand you the dollar. Because you can always swap 1 coin for 1 dollar, nobody will ever pay more or less than $1 for the coin.

Real examples: **USDC** (made by a company called Circle) and **USDT** (Tether). Together they're worth hundreds of billions of dollars.

Our fake one, made for this project, is called **SettleUSD**, ticker **SUSD**.

> **Important and repeated everywhere in this project:** our SUSD is **not backed by anything**. There is no bank account with real dollars in it. It's a demonstration of the *mechanism*, running on a *practice* network. Anyone who reads the code can see this. That honesty is a feature, not an apology — pretending otherwise would be the thing that ruins the project's credibility.

## 1.4 The two halves we built

| Half | What it is | Where it lives |
|---|---|---|
| **The coin** | A program that creates SUSD, moves it between people, and destroys it | On the Ethereum blockchain (Sepolia test network) |
| **The dashboard** | A website that lets you raise an invoice, pay it, and watch the comparison | On your laptop (and later, on the internet) |

Everything in this document is one of those two things, or the glue between them.

---

# PART 2 — THE VOCABULARY, ALL AT ONCE

Read this once. Everything later will make sense.

**Blockchain** — A shared notebook that thousands of computers around the world keep identical copies of. When someone writes a new line in it, every computer checks it and agrees. Because everyone has a copy, nobody can secretly erase or change a line. That's the whole magic: a record nobody controls and nobody can fake.

**Ethereum** — The most popular blockchain that can run *programs*, not just record payments. Bitcoin's notebook can only say "A paid B." Ethereum's notebook can run little apps.

**Smart contract** — A program that lives *on* the blockchain. Once you put it there, it runs exactly as written, forever, and nobody — not even you — can secretly change it. Our SettleUSD coin is a smart contract. The word "contract" is misleading; it's just code. Think of a vending machine: put in the right coin, the right snack comes out, every time, no shopkeeper needed.

**Testnet** — A practice blockchain. Works identically to the real one, but the money is fake and free. Ours is called **Sepolia**. This is how you test without risking real money. Every serious project does this first.

**Mainnet** — The real blockchain, with real money. We are deliberately not touching it.

**Wallet** — Not a place where money is stored. It's a place where your **key** is stored. The money lives on the blockchain; the wallet just proves you're allowed to move it.

**Address** — Your account number on the blockchain. Looks like `0x29fBFA16Df2b37123a104B7c0276dfCbdcd06911`. It's **public** — safe to share, like your email address or bank account number. People need it to send you things.

**Private key** — The password to your address. Looks like `0x` followed by 64 hex characters. **Whoever has this key owns everything at that address, permanently, with no way to reverse it.** There is no "forgot password," no support line, no bank to call. This is the single most important idea in the whole field.

> The relationship: address = your email address, private key = your email password. One you hand out freely. The other you never show anyone.

**Gas** — The fee you pay for making the blockchain's computers do work. Every write to the notebook costs gas. Ours cost about $0.12. It's paid in ETH, Ethereum's own currency.

**ETH** — The currency of Ethereum. On the testnet it's free and worthless (we got ours from a **faucet**). On mainnet it's real money.

**Faucet** — A free tap that gives you fake testnet ETH. You need a little to pay gas even on the practice network, because the practice network is meant to work exactly like the real one.

**Transaction (tx)** — One action written into the notebook. Sending coins is a transaction. Each one gets a unique ID called a **hash** — a long code like `0xe86884fd...` that acts as a permanent receipt anyone can look up.

**Block** — Transactions get bundled into groups called blocks, and blocks are added to the chain one after another. That's why it's a "block-chain." Ours landed in block 11,624,925.

**Etherscan** — A website that lets ordinary humans read the blockchain notebook. Without it you'd be reading raw computer data. With it, you get a nice web page showing every transaction.

**ERC-20** — A rulebook that says "if you want to make a coin on Ethereum, here are the standard functions it must have" — how to check a balance, how to transfer, and so on. Because everyone follows it, every wallet and exchange in the world automatically knows how to handle your coin. We followed it. Following the standard is why our token would show up in MetaMask without us writing any extra code.

**RPC** — Stands for "Remote Procedure Call," but forget that. It just means: **the phone number you dial to talk to the blockchain.** Your laptop doesn't hold a copy of the whole Ethereum notebook (it's enormous). So you call a company that does, and ask them questions. We used a company called Alchemy for this.

**API key** — A password that identifies *you* to a company's service, so they know who's calling and can count your usage. Not the same as a private key — an API key can't steal your money, it just controls access to a service.

---

# PART 3 — EVERY WEBSITE WE USED, AND WHY

We used four outside services. Here is each one, why we needed it, and what it gave us.

## 3.1 Alchemy — our phone line to the blockchain

**Website:** alchemy.com
**Why we needed it:** Our laptop can't talk to Ethereum by itself. Ethereum is thousands of computers; to ask them anything, you need a connection point. Alchemy runs those computers and rents out access.

**The alternative we rejected:** There are free public connection points (`rpc.sepolia.org`) that need no signup. They work, but they limit how often you can call them. If your portfolio site gets shared and twenty people open it at once, a public endpoint starts refusing. Alchemy's free tier is far more generous. For a link you're putting on a resume, reliability matters.

**What it gave us:**
```
https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```
That's a URL with a secret code on the end. **That code *is* the API key** — Alchemy doesn't issue a separate one. This trips people up constantly: the "endpoint URL" and the "API key" are the same secret, presented two ways.

**Is it secret?** Mildly. Anyone with it can use your Alchemy quota. They can't touch your money. You should rotate it when the project's done, but it's not an emergency.

**How we checked it worked:** we asked it "which chain are you?" and it answered `0xaa36a7`, which is the number 11155111, which is Sepolia's official ID. Right network confirmed before we spent any time.

## 3.2 Etherscan — the public window into our contract

**Website:** etherscan.io
**Why we needed it:** Two reasons.

*Reason one:* it's the human-readable view of the blockchain. When our dashboard shows a transaction hash, it links to Etherscan so anyone can click and see the real transaction.

*Reason two, and this is the important one:* **source code verification.**

When you put a smart contract on the blockchain, what actually gets stored is **bytecode** — machine gibberish like `0x60806040523480...`. Nobody can read it. So anyone looking at your contract just sees noise and has to trust you.

Verification fixes that. You send Etherscan your original human-readable code. Etherscan compiles it itself and checks that the result matches the gibberish already on the chain. If it matches, Etherscan publishes your readable source next to the contract, with a green checkmark.

**Why this matters for your portfolio:** an unverified contract is a black box — a recruiter clicks your link and sees nothing meaningful. A verified contract is a green tick and readable code. That's the difference between "trust me, I built something" and "here, read it."

**The key** is used only during verification, and only once.

**A technical detail worth knowing:** Etherscan replaced their old API (V1) with V2 in 2025. Old tools break against it. We checked our verification tool's version (`hardhat-verify 2.1.3`) *before* trying, confirmed it speaks V2, and it worked first time. Checking versions before running a thing that needs a network round-trip is the cheap habit that saves an hour of confused debugging.

## 3.3 MetaMask — where your keys live

**Website:** metamask.io
**What it is:** A browser extension that creates and stores blockchain accounts.

**Why we used it:** you needed two addresses — one to play the American payer, one to play the Indian exporter. MetaMask makes them in a few clicks and remembers them.

**A wrinkle you hit:** you went looking for "export private key" in Settings and it wasn't there. That's because the key export is per-account, not global — it's under the account list (click the account name → the ⋮ next to that specific account → Account details), not the app's Settings drawer. Reasonable design, badly signposted.

**The two accounts:**
- **Account 1** — `0x29fBFA16Df2b37123a104B7c0276dfCbdcd06911` — plays *both* the coin issuer and the American payer
- **Payee** — `0x4FCA6ea4FF5179e30fA01600EE2940698Dc61dEb` — plays the Indian exporter

**Why the payee needs no private key:** receiving money never requires a signature. Only *spending* does. So we only ever needed the exporter's address, never its key. That's a genuinely nice property of how blockchains work.

## 3.4 Google Cloud Faucet — free practice money

**Website:** cloud.google.com/application/web3/faucet/ethereum/sepolia
**Why we needed it:** even on the practice network, writing to the blockchain costs gas. Zero ETH means you can't do anything at all.

**What we got:** 0.05 test ETH.

**Why Google's specifically:** most faucets are hostile. They demand you already own real cryptocurrency on the main network, which is absurd for a beginner — you need money to get free money. Google's asks for a Google login and nothing else.

**How much did we actually need?** The deploy plus all our testing used a tiny fraction of the 0.05. There's plenty left.

---

# PART 4 — EVERY KEY AND SECRET, EXPLAINED

There are three secrets in this project. People mix them up constantly. They do completely different jobs.

## 4.1 The three secrets side by side

| | **Alchemy API key** | **Etherscan API key** | **Private key** |
|---|---|---|---|
| **Looks like** | `alch_` + random characters | 34 random capitals and digits | `0x` + 64 hex characters |
| **What it identifies** | You, to Alchemy | You, to Etherscan | **Ownership of money** |
| **Worst case if leaked** | Someone uses your free quota | Someone uses your free quota | **Everything at that address is gone, instantly, forever** |
| **How to fix a leak** | Click "rotate" in dashboard | Delete and make a new one | **You can't. There is no fix.** |
| **How scared to be** | Mildly annoyed | Mildly annoyed | This is the one that matters |

The first two are like a library card. The third is like the deed to your house, written in a form where whoever holds the paper owns the house.

## 4.2 Where each one lives

Two files hold all the secrets:

**`.env`** (project root) — used by Hardhat, the tool that deploys the contract:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

**`dashboard/.env.local`** — used by the website:
```
CHAIN=sepolia
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
CONTRACT_ADDRESS=0x6b887a87BC07749957690ed197296dCb8Ab532F0
PAYER_PRIVATE_KEY=YOUR_PRIVATE_KEY
PAYEE_ADDRESS=0x4FCA6ea4FF5179e30fA01600EE2940698Dc61dEb
```

## 4.3 "What is a .env file and why bother?"

`.env` means "environment." It's a plain text file holding settings that change between computers, and secrets that must never be shared.

**Why not just type the key into the code?** Because code gets shared. The moment you upload your project to GitHub, anything written inside a code file is public. There are bots that scan every new GitHub upload within *seconds* looking for keys, and they drain wallets automatically. People have lost life-changing sums this way.

So: secrets live in `.env`, and `.env` is listed in a file called `.gitignore`, which is a list of things Git must never upload. The code says "read the key from the environment," and the key itself never enters the shared files.

Our `.gitignore` includes `.env`, `.env.local`, `node_modules`, and now this document.

## 4.4 Why the same private key appears in two files

The single MetaMask Account 1 is doing **three jobs** in this demo:

1. **Deployer** — it put the contract on the blockchain and paid the gas
2. **Issuer** — it holds the special permission to create and destroy SUSD
3. **Payer** — it acts as Northwind, the American company paying the invoice

In a real product these would be three different, heavily-secured entities. Combining them is a deliberate demo simplification, and it's the kind of thing worth saying out loud in an interview *before* someone points it out.

## 4.5 Why the private key never appears in this repository

The two `.env` files are listed in `.gitignore`, so Git refuses to upload them. That is the only reason this project can be public at all.

Before making the repository public, the check that actually mattered wasn't "did I stage the right files" — it was cloning the published repo back down as an anonymous outsider and searching *that* for the secrets. Checking what you believe you uploaded is not the same as checking what the world can see, and only the second one is evidence.

Worth knowing about how permanent this is: **Git remembers every commit.** If a key is ever committed and then deleted in a later commit, it is still sitting in the history, readable by anyone, forever. Making a repo public exposes the entire history, not just the current files. Deleting the file does not undo it. The only real fix is to rotate the key — assume it's burned and issue a new one.

There are bots that scan every public commit on GitHub within seconds of it appearing, looking for exactly this. People have lost serious money to a key that was committed and "removed" minutes later.

**The rule that follows:** a key that has ever been pasted anywhere it shouldn't be — a commit, a chat, a screenshot, a support ticket — is burned. Rotate it, don't reason about whether anyone noticed.

---

# PART 5 — HALF ONE: THE COIN (THE SMART CONTRACT)

## 5.1 The file

`contracts/SettleUSD.sol`

The `.sol` means **Solidity**, the programming language for Ethereum smart contracts. It looks a bit like JavaScript.

## 5.2 Why we didn't write it from scratch

The first line of real code imports something:

```solidity
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```

**OpenZeppelin** is a company that publishes free, extremely well-tested building blocks for smart contracts. Their ERC-20 code has been audited by professionals, is used by thousands of projects, and secures billions of dollars.

Writing your own token from scratch would be like forging your own bolts instead of buying standard ones. It would take longer, and yours would be worse. **The security bugs that have cost people the most money are almost always in hand-rolled code that a standard library already solved.**

Using OpenZeppelin is not laziness. It's the correct engineering decision, and an interviewer will read it that way.

## 5.3 What our contract actually does

We took OpenZeppelin's standard token and added four things.

### Thing 1: Six decimal places

```solidity
function decimals() public pure override returns (uint8) {
    return 6;
}
```

**The problem:** computers on Ethereum can't handle fractions. There's no "0.5". Only whole numbers.

**The solution:** store everything multiplied up. If we use 6 decimal places, then `$1.00` is stored as the whole number `1000000`, and `$0.01` is stored as `10000`. The code does whole-number maths; the display divides by a million at the last moment.

**Why 6 and not 18?** Most Ethereum tokens use 18. But **USDC — the actual stablecoin this is modelled on — uses 6.** We matched the thing we're imitating. In an interview, "I used 6 because that's what USDC uses" shows you looked at the real system instead of copying a tutorial.

*(You'll notice your original prompt said "18 decimals... actually use 6 decimals to mirror USDC." You corrected yourself mid-sentence, and you corrected yourself in the right direction.)*

### Thing 2: Permissions — who's allowed to do what

```solidity
bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
```

Some actions must be restricted. **Anyone** should be able to send SUSD they own. But only **the issuer** should be able to conjure new SUSD into existence — otherwise the whole thing is worthless.

This is called **access control**. We use OpenZeppelin's `AccessControl`, which works like staff badges: certain doors only open for certain badges.

Every restricted function is marked `onlyRole(ISSUER_ROLE)`. If someone without the badge tries, the blockchain rejects the transaction. **We wrote a test that proves this**, and it passes.

### Thing 3: The emergency stop

```solidity
function pause() external onlyRole(ISSUER_ROLE) { _pause(); }
```

`pause()` freezes **all** movement of the token. Nobody can send anything until `unpause()` is called.

**Why would you want this?** Real regulated stablecoins have exactly this. If a bug is found, or a court orders a freeze, or an exchange gets hacked and stolen coins are moving, the issuer needs a stop button. USDC has frozen addresses in real life, at law enforcement request.

Including it makes the demo *realistic* rather than naive. A crypto purist would say a freeze button betrays decentralisation. They'd be right, and irrelevant — this is modelling a **regulated payment instrument**, and regulated payment instruments have freeze buttons. Knowing which critique applies to which product is exactly the judgement a product role is testing for.

### Thing 4: The reserve ratio display

```solidity
uint256 public reserveRatioBps;
```

This holds a number representing "how much real money is backing each coin," in **basis points** — a finance unit where 10,000 = 100.00%. It lets you express 99.97% as the whole number 9997, dodging the no-fractions problem again.

**This number is decoration.** It does not control anything. The code cannot check whether real dollars exist in a real bank — blockchains simply cannot see the outside world. Only a human typing an honest number in makes it true.

**And that is genuinely how real stablecoins work.** USDC's backing is verified by accountants publishing monthly attestation reports, not by code. The GENIUS Act's requirement for monthly reserve disclosures exists precisely because *this problem cannot be solved on-chain.*

We capped it at 20000 (200%) so the demo can't display something absurd like 900% reserves — a small honesty guard on a display field.

> **This is one of the strongest talking points in your entire project.** "The reserve ratio is a display field, not enforced logic, because on-chain code fundamentally can't verify off-chain assets — which is exactly why regulation mandates attestations" is a genuinely sophisticated thing to say. It shows you understand the *limits* of the technology, which is much rarer than enthusiasm about it.

### And one more: events

```solidity
event Minted(address indexed to, uint256 amount, address indexed issuer);
```

An **event** is an announcement the contract shouts when something happens. It gets stored in the blockchain's log.

Why bother? Because reading the current state of a contract is easy ("how many coins does X have?") but asking "what happened last Tuesday?" is expensive. Events are the cheap, searchable history. Our dashboard could subscribe to these to update live. It's the blockchain equivalent of a notification feed.

## 5.4 The tests, and why they exist

`test/SettleUSD.test.js` — seven tests, all passing.

A **test** is code that checks other code. Ours run in about a second on a fake blockchain that exists only in memory.

What they check:
1. Decimals are 6, reserve starts at 100%, supply starts at zero
2. The issuer can mint and burn, and the right events fire
3. **A stranger cannot mint, burn, pause, or change reserves** — all four rejected
4. Pausing stops transfers; unpausing resumes them
5. Pausing also stops minting
6. Reserve ratio updates, and absurd values are rejected
7. A full invoice settlement moves the exact right amount

**Why tests matter more here than in normal software.** Normal software: find a bug, push a fix. **Smart contracts cannot be changed after deployment.** A bug is permanent. The blockchain is littered with contracts holding millions that nobody can retrieve because of a typo.

Test #3 is the important one. It's the difference between "I made a token" and "I made a token and proved a stranger can't steal from it."

## 5.5 Deployment — putting it on the chain

`scripts/deploy.js` does three things:

1. **Deploys** the contract (uploads the code, gets an address back)
2. **Mints 1,000,000 SUSD** to the deployer, so the dashboard has money to move immediately
3. **Prints the verification command**, so the next step is copy-paste instead of remembering syntax

That third one is a small thing that matters. A script that tells you what to do next is a script you don't have to relearn in three months.

**What happened when we ran it:**
```
Deployer: 0x29fBFA16Df2b37123a104B7c0276dfCbdcd06911
Balance: 0.05 ETH
SettleUSD deployed: 0x6b887a87BC07749957690ed197296dCb8Ab532F0
Seeded: 1000000.0 SUSD
```

**Your contract is permanently at:**
`0x6b887a87BC07749957690ed197296dCb8Ab532F0`

**Readable by anyone, forever:**
https://sepolia.etherscan.io/address/0x6b887a87BC07749957690ed197296dCb8Ab532F0#code

---

# PART 6 — HALF TWO: THE DASHBOARD (THE WEBSITE)

## 6.1 What it's built with

| Tool | What it does | Why this one |
|---|---|---|
| **Next.js** | The website framework — pages, and a small server | Industry standard for React sites; deploys to Vercel in one click |
| **React** | Builds the interface out of reusable pieces | What Next.js is built on |
| **Tailwind CSS** | Styling, written as short class names | Fast to iterate; the design lives next to the markup |
| **TypeScript** | JavaScript that catches mistakes before you run it | It caught a real error for us — see 6.6 |
| **viem** | The library that talks to Ethereum | Small, modern, well-typed |

## 6.2 The big decision: no wallet connection

Your original plan said to use **RainbowKit** and **wagmi** — popular libraries that show a "Connect Wallet" button.

**I changed this, and it's the most important product decision in the build.**

Think about who opens your portfolio link. A recruiter. A hiring manager. Someone on LinkedIn.

Do they have MetaMask installed? **No.**
Do they have Sepolia test ETH? **Absolutely not.**
Will they install a crypto wallet, find a faucet, and mine test tokens to look at your project? **Never.**

With "Connect Wallet," 95% of your audience sees a button they cannot use, and leaves.

**So instead:** the website itself holds the payer's key on the server side and signs the transaction for the visitor. They click one button and the whole thing just works.

**The tradeoff, stated honestly:** this is not how a real product works. A real product never holds users' keys. But the goal here is *demonstration*, and a demo nobody can run demonstrates nothing.

This is a product-thinking decision, not a technical one. It's about knowing who the user is. **This is the single best thing in the project to talk about in an interview** — it shows you optimised for the actual audience rather than for technical purity.

Bonus: three fewer dependencies, and a much simpler codebase.

## 6.3 Front of house and back of house

Next.js gives you two places code can run, and the difference is the whole security model:

**The browser** (`app/page.tsx`) — the visitor's computer. Everything here is visible to anyone who opens developer tools. **Never put a secret here.**

**The server** (`app/api/*/route.ts`) — your computer (or Vercel). The visitor sees only the answers, never the code or the secrets.

The private key lives on the server, only. The browser asks "please settle this invoice"; the server does the signing and replies with a receipt. The key never travels to the visitor.

## 6.4 The three (now four) API routes

An **API route** is a little program on the server that the browser can call.

### `GET /api/state` — "what's the current situation?"
Asks the blockchain five questions at once (total supply, reserve ratio, paused?, payer balance, payee balance) and returns them together.

They're fired **in parallel** rather than one after another — five round-trips at the same time instead of stacked up. Each call to Alchemy takes a few hundred milliseconds; done sequentially that's a visibly sluggish page.

### `POST /api/settle` — "pay this invoice"
The heart of the project. In order:

1. **Check the amount is a real positive number.** Reject text, negatives, zero.
2. **Check it's under $1,000,000.** A cap so nobody can jam the demo.
3. **Convert to blockchain units** (multiply by a million).
4. **Check the payer actually has enough SUSD.** If not, a clear message — not a raw blockchain error.
5. **Start a stopwatch.**
6. **Send the transaction.**
7. **Wait for the blockchain to confirm it.**
8. **Stop the stopwatch.** This measured number is the headline of the whole project.
9. **Check it actually succeeded** — a transaction can be recorded and still have failed.
10. **Work out the gas cost** in ETH.
11. **Return** hash, Etherscan link, time, block number, gas.

> **Why so much checking on a demo?** Because this is money-shaped code, and validating input at the boundary is never the place to be lazy. It also means that when something goes wrong, the screen says "Demo payer is out of SUSD" instead of a forty-line crash dump — which matters when a recruiter is the one clicking.

### `POST /api/redeem` — "cash out"
The exporter hands SUSD back; the issuer burns it; total supply visibly drops.

**Why this exists:** it completes the story. Without it, coins pile up at the exporter forever and the reserve ratio panel means nothing. With it, you can point at the screen and say "the exporter cashed out, the tokens were destroyed, supply fell — that's how an issuer retires tokens against reserves."

That's the mechanic an interviewer will probe with "so who's holding the actual dollars, and what happens to the token?" Now you have a screen that answers it.

### `GET /api/fx` — "what's a dollar worth in rupees?"
Calls **frankfurter.app**, a free service publishing European Central Bank reference rates.

**Why this one:** no signup, no API key, no rate limits, and it cites a real central bank source. Most FX APIs demand registration for something this simple.

Two details:
- **Cached for 5 minutes.** Exchange rates don't move meaningfully in five minutes, and it's polite not to hammer a free service.
- **A fallback.** If the API is down, we use a fixed rate **clearly labelled "live rate unavailable."** A demo with one broken panel looks broken; a demo that degrades gracefully and says so looks engineered.

## 6.5 The page itself

One screen, six panels:

1. **Invoice** — payer, payee, amount. Pre-filled with the Bengaluru/Delaware story so the point lands before anyone reads a word.
2. **Progress steps** — four checkmarks lighting up in sequence. Shows the *process*, not just the outcome.
3. **Settlement receipt** — the big green number (4.3s), tx hash linked to Etherscan, block, gas.
4. **Reserve & supply** — live from the contract, plus the redeem button.
5. **The comparison** — two panels side by side. SWIFT on the left, stablecoin on the right. **This is the money shot.** "2–5 business days / $1,035" against "4.3 seconds / $100.12."
6. **INR payout** — the rupee figure, and savings in both currencies.

Plus an "About this project" panel and a footer that states plainly this is a simulation.

**On the assumptions:** the SWIFT numbers ($35 fees, 2% markup, 0.2% off-ramp) are named constants at the top of the file, and **their percentages are printed on screen**. An interviewer will ask where those numbers come from. They should be able to see the answer, not have to trust it. Numbers hidden inside code invite the question "did you make these up?" — numbers labelled on screen answer it before it's asked.

## 6.6 The bug TypeScript caught, and the bug it didn't

**Caught by the machine:** the gas calculation used BigInt (a type for huge numbers — blockchain amounts overflow normal JavaScript numbers). TypeScript refused to compile until we raised the language target to ES2020. Never reached the browser.

**Caught by looking:** the fourth progress step, "Converted to INR," never turned green. The code set the step counter to 3 when it needed to be 4 — an off-by-one. TypeScript can't catch that; it's valid code that's simply wrong.

**How we found it:** by opening a real browser, clicking the button, and reading the screen. Then fixed it, clicked again, and confirmed all four steps green.

> The lesson: **types catch what's ill-formed, running it catches what's wrong.** You need both. "It compiles" is not "it works," and the only way to know a thing works is to watch it work.

---

# PART 7 — EVERY STEP WE TOOK, AND WHY

The order was deliberate. Here's the reasoning.

**Step 0 — Argued with the plan before building it.**
Before writing code, I flagged four things in your brief: the GENIUS Act "missed deadline" framing was legally wrong (the January 2027 date was always the statutory backstop, not a slipped deadline); several 2026 figures sat past my knowledge cutoff and need primary sources; RainbowKit would break the demo for its actual audience; and the deck had no number that was *yours*. **Cheapest possible time to catch a wrong assumption is before it's built on.**

**Step 1 — Chose boring tools.**
Hardhat 2 over Hardhat 3, OpenZeppelin over hand-rolled. Boring tools have more Stack Overflow answers and fewer surprises. Novelty is a cost you pay for no benefit on a portfolio project.

**Step 2 — Wrote the contract.**
Smallest thing that tells the story: mint, burn, pause, permissions, reserve display. No upgradeability, no blacklist, no permit — every unbuilt feature is a feature that can't break.

**Step 3 — Wrote tests and ran them.**
Seven tests, seven passing. Done *before* deploying, because deployment is permanent.

**Step 4 — Built the dashboard against a fake local blockchain.**
Hardhat can run a pretend Ethereum on your laptop: instant, free, unlimited. We built and debugged the entire dashboard there.

> **Why this order matters:** every bug found locally cost seconds. The same bug found on Sepolia would cost a real transaction, a real wait, and possibly real faucet ETH. **Debug where it's free; deploy when it's boring.**

**Step 5 — Tested every failure path, not just the happy one.**
Negative amounts, text instead of numbers, over the cap, more than the balance. All four rejected cleanly. Anyone can make the success case work; the demo only survives contact with a stranger if the failures are handled too.

**Step 6 — Opened a real browser and looked at it.**
Drove the actual UI, clicked the actual button, read the actual screen. Found the step-4 bug this way. **I could have claimed it worked without checking. That claim would have been worth nothing.**

**Step 7 — Added the redemption leg.**
The one piece of your original spec still missing. Built it, clicked it, watched supply fall from 1,000,000 to 850,000.

**Step 8 — Collected credentials.**
Alchemy, Etherscan, MetaMask, faucet. Verified the RPC answered with the right chain ID *before* relying on it.

**Step 9 — Verified the key matched the address.**
Before deploying, derived the address from the private key and confirmed it matched the funded account. One second of checking; would have saved a confusing failure.

**Step 10 — Deployed to Sepolia.** Worked first time, because everything had already been proven locally.

**Step 11 — Verified the source on Etherscan.** Green tick, readable code.

**Step 12 — Pointed the dashboard at Sepolia and ran a real settlement.**
4.44 seconds, $0.12 gas, on a real public network.

**Step 13 — Screenshotted the real thing.**

---

# PART 8 — THE NUMBERS, WORKED OUT

For a **$50,000** invoice.

**The SWIFT path:**
```
Correspondent + lifting fees        $35.00     (midpoint of the usual $25–50)
Bank FX markup, 2%              +$1,000.00     (midpoint of the usual 1–3%)
                                 ─────────
Total cost                       $1,035.00
Exporter receives               $48,965.00
Time                        2–5 business days
```

**The stablecoin path (measured, not estimated):**
```
Network gas                          $0.12     (actually measured: 0.000040 ETH)
Off-ramp spread, 0.2%             +$100.00
                                 ─────────
Total cost                         $100.12
Exporter receives               $49,899.88
Time                          4.3 seconds
```

**The difference:**
```
Saved:      $934.88  —  1.87% of the invoice
Time saved: roughly 3 days, down to 4 seconds
In rupees:  ₹88,786 saved on one invoice
```

**And annually**, on one $50K invoice a month: **over ₹10,65,000 a year.** That's a salary.

## Where each number comes from — be able to answer this

| Number | Source | Honest status |
|---|---|---|
| 4.3 seconds | **Measured live** on Sepolia | Real, but Sepolia is less busy than mainnet |
| $0.12 gas | **Measured live** | Real for Sepolia; mainnet L1 would be far more |
| ₹94.97/USD | **Live**, ECB via frankfurter.app | Real |
| $35 fees | Industry typical | **Assumption.** Replace with your research |
| 2% FX markup | Industry typical | **Assumption.** Replace with your research |
| 0.2% off-ramp | Industry typical | **Assumption.** Replace with your research |

**The three assumptions are the weakest part of the project and the biggest opportunity in it.** Replace them with figures from real bank statements or published schedules and the whole thing stops being a demo and becomes evidence. That single change is what would make this stand out from every other stablecoin portfolio piece.

---

# PART 9 — WHAT'S REAL AND WHAT'S PRETEND

Being precise about this is what makes the project credible rather than hype.

## Genuinely real
- The smart contract, permanently on a public blockchain
- Every transaction, permanently recorded and publicly checkable
- The 4.3-second measurement — a real stopwatch on a real network
- The gas cost — really paid
- The USD/INR rate — live from the ECB
- The access control — a stranger really cannot mint, and there's a test proving it

## Deliberately pretend
- **The dollars.** No bank account, no reserves. SUSD is backed by nothing.
- **The 100% reserve ratio.** A number someone typed in.
- **The rupee payout.** No Indian bank is involved. Nothing lands anywhere.
- **The companies.** Northwind and Meridian don't exist.
- **The SWIFT comparison.** Reasonable industry midpoints, not a quote for a specific transfer.
- **"The payer."** It's your own key signing on the server, not a real counterparty.

## The three things a sharp interviewer will push on

**1. "Sepolia isn't mainnet. What does this cost for real?"**
Correct, and important. A $50K B2B transfer on Ethereum mainnet L1 would cost far more than $0.12 — and that's precisely why real stablecoin B2B volume doesn't run on L1. It runs on Layer 2 networks (Arbitrum, Base) and on Solana and Tron, where fees are fractions of a cent. **The right answer isn't to defend L1, it's to say L1 was never the design.**

**2. "India's RBI is hostile to stablecoins. How does this even work?"**
It doesn't touch Indian banking rails, and under current RBI policy it can't. The realistic architecture is offshore issuance, the stablecoin leg, and a last-mile conversion through a licensed offshore exchange or payment partner — not a domestic bank integration. **Designing around a regulatory constraint rather than pretending it away is the strongest thing in the whole project.**

**3. "Wise already does this for about 0.5%. Why would anyone use yours?"**
The honest answer isn't "we're cheaper" — on this corridor Wise is genuinely good. The wedge is narrower and more specific: programmable settlement (invoice → conversion → reconciliation with no human in the loop), and payer-side optionality for US clients who already hold USDC and would rather not touch a bank at all. **Claiming to beat Wise on price would read as naive; naming the narrow wedge reads as product sense.**

---

# PART 10 — RUNNING IT AGAIN

## Just look at it
```bash
cd "/Users/utkarshgarg/Desktop/stable coin/dashboard"
npm run dev
```
Open **http://localhost:3000**. It's already pointed at Sepolia.

## Run the tests
```bash
cd "/Users/utkarshgarg/Desktop/stable coin"
npm test
```

## Develop against a free local chain
```bash
# Terminal 1
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Terminal 2 — set CHAIN=localhost and the printed address in dashboard/.env.local
cd dashboard && npm run dev
```
Local chain state vanishes when you stop it. Redeploy and update the address each time.

## Deploy a fresh contract to Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat verify --network sepolia <NEW_ADDRESS> 0x29fBFA16Df2b37123a104B7c0276dfCbdcd06911
```
Then put the new address in `dashboard/.env.local`.

## If the payer runs out of SUSD
Redeeming burns tokens permanently, so heavy demo use drains the supply. Either redeploy, or add a small mint route — the pattern already exists in `/api/redeem`.

---

# PART 11 — WHAT'S LEFT

**Worth doing:**
1. **Record a GIF** of the settle flow. Goes on the deck's final slide and in a LinkedIn post.
2. **Deploy to Vercel** so the link is live. Push to GitHub (check `.env` files aren't included), import to Vercel, paste the environment variables in. ~30 minutes.
3. **Replace the three assumed numbers** with researched ones. Highest-value hour you can spend on this.

**Deliberately not built, and why:**
- **Upgradeable contract** — real complexity, no demo value
- **Blacklist/freeze per address** — `pause()` already makes the compliance point
- **A database** — nothing needs remembering between visits
- **Wallet connect** — actively harmful for this audience (see 6.2)
- **Multiple invoices, users, login** — none of it changes what's being demonstrated

> Every one of those is a real feature of a real product. Not building them was the right call **for a demo**, and being able to say why you left something out is more impressive than having built it.

---

# PART 12 — THE ONE-PARAGRAPH VERSION

*If someone gives you thirty seconds:*

> I built a working stablecoin settlement demo for the India–US corridor. There's a real ERC-20 token deployed and verified on Ethereum's Sepolia testnet, with issuer-only minting, an emergency pause, and a redemption burn — and a dashboard that settles a $50,000 invoice on it and measures what actually happens. It settles in **4.3 seconds for about $100**, against **2 to 5 business days and roughly $1,035** on a correspondent-banking wire — about **₹88,000 saved per invoice**. The interesting constraint is regulatory: the RBI currently bars Indian regulated entities from stablecoin exposure, so the design routes the last mile through an offshore licensed partner rather than a domestic bank. And the reserve ratio in the contract is deliberately a display field, not enforced logic — because on-chain code fundamentally can't verify off-chain dollars, which is exactly why the GENIUS Act mandates monthly attestations instead.

---

## Quick reference

| | |
|---|---|
| **Contract** | `0x6b887a87BC07749957690ed197296dCb8Ab532F0` |
| **Etherscan** | https://sepolia.etherscan.io/address/0x6b887a87BC07749957690ed197296dCb8Ab532F0#code |
| **Issuer / payer** (public address) | `0x29fBFA16Df2b37123a104B7c0276dfCbdcd06911` |
| **Payee** (public address) | `0x4FCA6ea4FF5179e30fA01600EE2940698Dc61dEb` |
| **Network** | Sepolia (chain ID 11155111) |
| **Token** | SettleUSD / SUSD, 6 decimals, 1,000,000 minted |
| **Measured** | 4.3s settlement, $0.12 gas |
| **Dashboard** | http://localhost:3000 |
