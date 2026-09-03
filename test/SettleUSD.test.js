const { expect } = require("chai");
const { ethers } = require("hardhat");

const USD = (n) => ethers.parseUnits(String(n), 6);

describe("SettleUSD", function () {
  let token, admin, payer, payee;

  beforeEach(async function () {
    [admin, payer, payee] = await ethers.getSigners();
    token = await ethers.deployContract("SettleUSD", [admin.address]);
  });

  it("mirrors USDC decimals and starts at 100% displayed reserves", async function () {
    expect(await token.decimals()).to.equal(6);
    expect(await token.reserveRatioBps()).to.equal(10000);
    expect(await token.totalSupply()).to.equal(0);
  });

  it("lets the issuer mint and burn, and emits events the dashboard listens for", async function () {
    await expect(token.mint(payer.address, USD(50_000)))
      .to.emit(token, "Minted")
      .withArgs(payer.address, USD(50_000), admin.address);
    expect(await token.totalSupply()).to.equal(USD(50_000));

    await expect(token.burn(payer.address, USD(20_000)))
      .to.emit(token, "Burned")
      .withArgs(payer.address, USD(20_000), admin.address);
    expect(await token.totalSupply()).to.equal(USD(30_000));
  });

  it("blocks non-issuers from minting, burning, pausing and setting reserves", async function () {
    const role = await token.ISSUER_ROLE();
    for (const call of [
      token.connect(payer).mint(payer.address, USD(1)),
      token.connect(payer).burn(payer.address, USD(1)),
      token.connect(payer).pause(),
      token.connect(payer).setReserveRatio(9000),
    ]) {
      await expect(call)
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(payer.address, role);
    }
  });

  it("halts transfers while paused and resumes after unpause", async function () {
    await token.mint(payer.address, USD(50_000));
    await token.pause();
    await expect(
      token.connect(payer).transfer(payee.address, USD(1_000))
    ).to.be.revertedWithCustomError(token, "EnforcedPause");

    await token.unpause();
    await token.connect(payer).transfer(payee.address, USD(1_000));
    expect(await token.balanceOf(payee.address)).to.equal(USD(1_000));
  });

  it("also halts issuance while paused", async function () {
    await token.pause();
    await expect(token.mint(payer.address, USD(1))).to.be.revertedWithCustomError(token, "EnforcedPause");
  });

  it("updates the display-only reserve ratio and rejects absurd values", async function () {
    await expect(token.setReserveRatio(10250))
      .to.emit(token, "ReserveRatioUpdated")
      .withArgs(10000, 10250, admin.address);
    expect(await token.reserveRatioBps()).to.equal(10250);

    await expect(token.setReserveRatio(20001))
      .to.be.revertedWithCustomError(token, "ReserveRatioTooHigh")
      .withArgs(20001);
  });

  it("settles an invoice: payer -> payee moves the full invoice amount", async function () {
    await token.mint(payer.address, USD(50_000));
    await token.connect(payer).transfer(payee.address, USD(50_000));
    expect(await token.balanceOf(payer.address)).to.equal(0);
    expect(await token.balanceOf(payee.address)).to.equal(USD(50_000));
  });
});
