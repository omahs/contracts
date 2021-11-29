module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const multisig = await ethers.getContractAt("MultiSig", "0x8934da8c9feb0f801dba179cf57bc029651866a9");
  const shares = await deployments.get('AllowlistSharesModum');

  console.log("-----------------------")
  console.log("Deploy Brokerbot Modum")
  console.log("-----------------------")
  console.log("deployer: %s", deployer);
  console.log("owner: %s", multisig.address)

  const price = "500000000000000000";
  const increment = 10;
  const baseCurrencyContract = "0xB4272071eCAdd69d933AdcD19cA99fe80664fc08";

  const feeData = await ethers.provider.getFeeData();

  const { address } = await deploy("BrokerbotModum", {
    contract: "Brokerbot",
    from: deployer,
    args: [
      shares.address,
      price,
      increment,
      baseCurrencyContract,
      multisig.address],
    log: true,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    maxFeePerGas: feeData.maxFeePerGas
  });
};

module.exports.tags = ["BrokerbotModum"];
module.exports.dependencies = ["AllowlistSharesModum"];