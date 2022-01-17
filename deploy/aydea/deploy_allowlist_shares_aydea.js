const Confirm = require('prompt-confirm');

module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments;

  const { deployer, owner } = await getNamedAccounts();

  //const recoveryHub = await ethers.getContractAt("RecoveryHub", "0x9b886c04CE3CFB74E644DE92d65CfB873636e1fb"); //kovan
  const recoveryHub = await ethers.getContractAt("RecoveryHub", "0x6884ade31AC154DC52395F9dB819A03c667063A9"); //mainnet
  //const recoveryHub = await deployments.get("RecoveryHub");
  
  const symbol = "AYS";
  const name = "Aydea Shares";
  const terms = "https://aydea.ch";
  const totalShares = 350;

  if (network.name != "hardhat") {
    console.log("-----------------------")
    console.log("Deploy Allowlist Shares Aydea")
    console.log("-----------------------")
    console.log("deployer: %s", deployer);
    console.log("owner: %s", owner)  // don't forget to set it in hardhat.config.js as the multsig account
    console.log("recoveryhub at: %s", recoveryHub.address);
    
    const prompt = await new Confirm("Addresses correct?").run();
    if(!prompt) {
      console.log("exiting");
      process.exit();
    }
  }
  
  const feeData = await ethers.provider.getFeeData();

  const { address } = await deploy("AllowlistSharesAydea", {
    contract: "AllowlistShares",
    from: deployer,
    args: [
      symbol,
      name,
      terms,
      totalShares,
      recoveryHub.address,
      owner],
    log: true,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    maxFeePerGas: feeData.maxFeePerGas
  });
};

module.exports.tags = ["AllowlistSharesAydea"];
//module.exports.dependencies = ["RecoveryHub"];