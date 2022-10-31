require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");


module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: process.env.ALCHAMEY_API_URL,
      accounts: [process.env.METAMASK_PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};