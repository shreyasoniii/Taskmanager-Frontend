const { ethers, artifacts, network } = require("hardhat");
const { writeFileSync, mkdirSync, existsSync } = require("fs");
const { join } = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  const TaskAuditLog = await ethers.getContractFactory("TaskAuditLog");
  const contract = await TaskAuditLog.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nTaskAuditLog deployed to:", address);

  const artifact = await artifacts.readArtifact("TaskAuditLog");

  const deployInfo = {
    address,
    abi: artifact.abi,
    network: network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  // Save inside onchain/deployments/
  const deploymentsDir = join(__dirname, "../deployments");
  if (!existsSync(deploymentsDir)) mkdirSync(deploymentsDir, { recursive: true });

  writeFileSync(join(deploymentsDir, `${network.name}.json`), JSON.stringify(deployInfo, null, 2));
  console.log(`Deployment info written to deployments/${network.name}.json`);

  // Copy to frontend so it can import the ABI + address directly
  // Attempt to write to common frontend paths. Some dev setups use a folder name with a space
  const frontendCandidates = [
    join(__dirname, "../../taskmanager-frontend/src/contracts"),
    join(__dirname, "../../taskmanager-frontend 2/src/contracts"),
    join(__dirname, "../../taskmanager-frontend/src"),
  ];

  let wrote = false;
  for (const cand of frontendCandidates) {
    try {
      const dir = cand.endsWith("/contracts") ? cand : join(cand, "contracts");
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "TaskAuditLog.json"), JSON.stringify(deployInfo, null, 2));
      console.log(`Frontend contract file written to ${dir}/TaskAuditLog.json`);
      wrote = true;
      // continue writing to other candidates if present
    } catch (err) {
      // ignore and try next candidate
    }
  }
  if (!wrote) {
    console.warn("Could not write frontend contract file - no matching frontend path found or write failed.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
