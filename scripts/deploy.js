const hre = require("hardhat");

// Seed supply so the settlement dashboard has something to move on day one.
const SEED_SUSD = 1_000_000n * 10n ** 6n;

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  const token = await hre.ethers.deployContract("SettleUSD", [deployer.address]);
  await token.waitForDeployment();
  const address = await token.getAddress();
  console.log("SettleUSD deployed:", address);

  await (await token.mint(deployer.address, SEED_SUSD)).wait();
  console.log("Seeded:", hre.ethers.formatUnits(await token.totalSupply(), 6), "SUSD");

  console.log(`\nVerify:\n  npx hardhat verify --network ${hre.network.name} ${address} ${deployer.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
