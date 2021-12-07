const { task } = require("hardhat/config");

const { ethers: { constants: { MaxUint256 }}} = require("ethers");

task("gas-price", "Prints gas price").setAction(async function({ address }, { ethers }) {
  console.log("Gas price", (await ethers.provider.getGasPrice()).toString())
})

task("bytecode", "Prints bytecode").setAction(async function({ address }, { ethers }) {
  console.log("Bytecode", await ethers.provider.getCode(address))
})

task("create-multisig-clone", "Creates a multisig clone from the factory")
  .addOptionalParam("factory", "The contract addresse of the clone factory")
  .addOptionalParam("owner", "The owner address of the multisig")
  .addParam("salt", "The salt for the multsig")
  .setAction(async ({ factory, owner, salt }, { getNamedAccounts, ethers }) => {
    const { deployer, multiSigDefaultOwner } = await getNamedAccounts();
    if (factory == undefined) {
      factory = "0xb34E47DA0A612ffC5325790DD8e219D870f84898"; // mainnet factory
    }
    if(owner == undefined) {
      owner = multiSigDefaultOwner;
    }

    multiSigCloneFactory = await ethers.getContractAt("MultiSigCloneFactory", factory);
    const tx2 = await multiSigCloneFactory.create(owner, ethers.utils.formatBytes32String(salt), { gasLimit: 300000 });
    const { events } = await tx2.wait();
    const { address } = events.find(Boolean);
    console.log(`MultiSig cloned at: ${address}`);
    console.log("-----------------------")
    console.log("Deploy Ayaltis Multisig")
    console.log("-----------------------")
    console.log("deployer: %s", deployer);
    console.log("owner: %s", owner)
    console.log("multsig cloned at: %s", address)
  })
