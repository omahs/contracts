const Confirm = require('prompt-confirm');

module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const shares = await deployments.get('AllowlistSharesAydea');
  const recoveryHub = await ethers.getContractAt("RecoveryHub", "0x6884ade31AC154DC52395F9dB819A03c667063A9");//mainnet
  //const recoveryHub = await ethers.getContractAt("RecoveryHub", "0x9b886c04CE3CFB74E644DE92d65CfB873636e1fb"); //kovan
  //const recoveryHub = await deployments.get("RecoveryHub");
  const offerFactory = await deployments.get("OfferFactory");

  // owner of allowlistshares and allowlist draggableshares is the same.
  // no need to create another multisig wallet
  const sharesContract = await ethers.getContractAt("AllowlistShares", shares.address);
  const owner = await sharesContract.owner();
  
  const terms = "https://aydea.ch";
  const quorumBps = 75000;
  const votePeriodSeconds = 5184000;

  if (network.name != "hardhat") {
    console.log("-----------------------")
    console.log("Deploy Allowlist DraggableShares Aydea")
    console.log("-----------------------")
    console.log("deployer: %s", deployer);
    console.log("owner: %s", owner)  // don't forget to set it in hardhat.config.js as the multsig account
    console.log("recoveryhub at: %s", recoveryHub.address);
    console.log("offer factory at: %s", offerFactory.address);
    console.log("shares at: %s", shares.address);
    
    const prompt = await new Confirm("Addresses correct?").run();
    if(!prompt) {
      console.log("exiting");
      process.exit();
    }
  }
  
  const feeData = await ethers.provider.getFeeData();

  const { address } = await deploy("AllowlistDraggableSharesAydea", {
    contract: "AllowlistDraggableShares",
    from: deployer,
    args: [
      terms,
      shares.address,
      quorumBps,
      votePeriodSeconds,
      recoveryHub.address,
      offerFactory.address,
      owner,
      owner],
    log: true,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    maxFeePerGas: feeData.maxFeePerGas,
    gasLimit: 3000000
  });
};

module.exports.tags = ["AllowlistDraggableSharesAydea"];
module.exports.dependencies = ["OfferFactory", "AllowlistSharesAydea"];