// Adds new agents (IDs 6..14) to an already-deployed AgentRegistry.
// Run: npx hardhat run scripts/seed-more-agents.js --network monadTestnet
//
// Reads the registry address from env. Set it via:
//   $env:REGISTRY_ADDRESS = "0x..."   # PowerShell
//   export REGISTRY_ADDRESS=0x...     # bash
// Falls back to NEXT_PUBLIC_REGISTRY_ADDRESS for convenience.

const hre = require("hardhat");

const REGISTRY_ADDRESS =
  process.env.REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;

const NEW_AGENTS = [
  { name: "Summarizer",      specialty: "Condensation Engine",   price: "0.006" },
  { name: "Q&A Bot",         specialty: "Direct Answering",      price: "0.005" },
  { name: "Email Drafter",   specialty: "Professional Writing",  price: "0.008" },
  { name: "Critic",          specialty: "Quality Review",        price: "0.010" },
  { name: "Outline Builder", specialty: "Structured Thinking",   price: "0.007" },
  { name: "Idea Generator",  specialty: "Creative Brainstorm",   price: "0.009" },
  { name: "Math Solver",     specialty: "Numerical Reasoning",   price: "0.006" },
  { name: "Fact Checker",    specialty: "Verification",          price: "0.012" },
  { name: "Tutor",           specialty: "Educational Explainer", price: "0.008" },
];

async function main() {
  if (!REGISTRY_ADDRESS) {
    throw new Error(
      "Set REGISTRY_ADDRESS in env (your deployed AgentRegistry address)."
    );
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("Signing with:", signer.address);

  const Registry = await hre.ethers.getContractFactory("AgentRegistry");
  const registry = Registry.attach(REGISTRY_ADDRESS);

  // Sanity check: must be the owner to call registerAgent
  const owner = await registry.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(
      `Signer ${signer.address} is not the registry owner ${owner}.\n` +
      "Use the same private key that deployed the contracts."
    );
  }

  const startCount = Number(await registry.agentCount());
  console.log("Existing agent count:", startCount);

  if (startCount >= 6 + NEW_AGENTS.length) {
    console.log("All extra agents already registered. Nothing to do.");
    return;
  }

  // Skip any that are already on-chain (in case the script is re-run)
  const offset = Math.max(0, startCount - 6);
  if (offset > 0) {
    console.log(`Skipping first ${offset} new agents — already present.`);
  }

  for (let i = offset; i < NEW_AGENTS.length; i++) {
    const a = NEW_AGENTS[i];
    const id = startCount + (i - offset);
    process.stdout.write(`  [${id}] ${a.name.padEnd(18)} @ ${a.price} MON ... `);
    const tx = await registry.registerAgent(
      a.name,
      a.specialty,
      hre.ethers.parseEther(a.price),
      signer.address
    );
    await tx.wait();
    console.log("ok");
  }

  const endCount = await registry.agentCount();
  console.log("\nDone. Total agents on chain:", endCount.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
