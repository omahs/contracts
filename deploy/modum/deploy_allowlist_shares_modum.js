module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments;

  const { deployer, multiSigDefaultOwner } = await getNamedAccounts();

  
  const multisigAddress = "0x8934da8c9feb0f801dba179cf57bc029651866a9";

  const recoveryHub = await deployments.get("RecoveryHub");

  console.log("-----------------------")
  console.log("Deploy Allowlist Shares for Modum")
  console.log("-----------------------")
  console.log("deployer: %s", deployer);
  console.log("owner: %s", multisigAddress)

  const symbol = "MOP";
  const name = "modum.io participation certificate";
  const terms = "www.modum.io/investor-relations";
  const totalShares = 2743000;

  const feeData = await ethers.provider.getFeeData();

  const { address } = await deploy("AllowlistSharesModum", {
    contract: "AllowlistShares",
    from: deployer,
    args: [
      symbol,
      name,
      terms,
      totalShares,
      recoveryHub.address,
      multisigAddress],
    log: true,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    maxFeePerGas: feeData.maxFeePerGas
  });
};

module.exports.tags = ["AllowlistSharesModum"];
module.exports.dependencies = ["RecoveryHub"];