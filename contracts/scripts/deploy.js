const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MON");

  // 1. Deploy AgentRegistry
  console.log("\n[1/3] Deploying AgentRegistry...");
  const Registry = await hre.ethers.getContractFactory("AgentRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("  -> AgentRegistry:", registryAddr);

  // 2. Deploy WorkflowEscrow
  console.log("\n[2/3] Deploying WorkflowEscrow...");
  const Escrow = await hre.ethers.getContractFactory("WorkflowEscrow");
  const escrow = await Escrow.deploy(registryAddr);
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log("  -> WorkflowEscrow:", escrowAddr);

  // 3. Seed 6 agents (wallets = deployer for demo simplicity)
  console.log("\n[3/3] Seeding 6 agents...");
  const AGENTS = [
    { name: "Research Analyst",  specialty: "Intelligence Gathering",  price: "0.01" },
    { name: "Code Engineer",     specialty: "On-Chain Development",    price: "0.03" },
    { name: "Content Writer",    specialty: "Narrative Intelligence",  price: "0.008" },
    { name: "Data Processor",    specialty: "Pattern Recognition",     price: "0.015" },
    { name: "Translator",        specialty: "Multilingual Ops",        price: "0.005" },
    { name: "Strategy Advisor",  specialty: "Market Intelligence",     price: "0.04" },
  ];

  for (let i = 0; i < AGENTS.length; i++) {
    const a = AGENTS[i];
    const tx = await registry.registerAgent(
      a.name,
      a.specialty,
      hre.ethers.parseEther(a.price),
      deployer.address
    );
    await tx.wait();
    console.log(`  [${i}] ${a.name} @ ${a.price} MON`);
  }

  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log(`NEXT_PUBLIC_REGISTRY_ADDRESS=${registryAddr}`);
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddr}`);
  console.log("\nCopy these into monad/.env.local");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
