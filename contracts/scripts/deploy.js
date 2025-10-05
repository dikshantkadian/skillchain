// This is our deployment spell. It tells Hardhat how to build our vault.
async function main() {
  // 1. Get the rulebook (the contract factory) for Skillchain.
  const Skillchain = await ethers.getContractFactory("Skillchain");

  // 2. Tell the robot to start building the vault on the blockchain.
  console.log("Deploying Skillchain contract...");
  const skillchain = await Skillchain.deploy();

  // 3. Wait for the vault to be fully built and ready.
  await skillchain.deployed();

  // 4. Print the public address of our new vault. This is super important!
  console.log("Skillchain contract deployed to:", skillchain.address);
}

// This part runs our main function and catches any errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });