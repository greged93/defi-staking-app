const { SocketAddress } = require("net");

const Tether = artifacts.require("Tether");
const RWD = artifacts.require("RWD");
const DecentralBank = artifacts.require("DecentralBank");

module.exports = async function(deployer, network, accounts) {
    //Deploy the tether.
    await deployer.deploy(Tether);
    const tether = await Tether.deployed();

    //Deploy the reward token.
    await deployer.deploy(RWD);
    const rwd = await RWD.deployed();

    //Deploy the decentralized bank
    await deployer.deploy(DecentralBank, rwd.address, tether.address);
    const bank = await DecentralBank.deployed();

    await rwd.transfer(bank.address, '1000000000000000000000000');

    await tether.transfer(accounts[1], '100000000000000000000');
}