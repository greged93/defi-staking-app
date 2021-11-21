const Migrations = artifacts.require("Migrations");

module.exports = async function deployer(deployer) {
    await deployer.deploy(Migrations)
};