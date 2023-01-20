require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { API_URL, PRIVATE_KEY, API_KEY_ETH } = process.env;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "goerli",
   networks: {
      hardhat: {},
      goerli: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
   etherscan: {
    apiKey: API_KEY_ETH,
  },

};

