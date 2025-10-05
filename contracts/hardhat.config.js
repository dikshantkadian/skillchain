require("@nomiclabs/hardhat-waffle");

// This is a new line we are adding.
// It teaches our instruction book how to read our secret .env file.
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",

  // This is a new section we are adding.
  // It tells Hardhat all about the Sepolia test blockchain.
  networks: {
    sepolia: {
      // This uses the secret "telephone line" from our .env file
      url: process.env.SEPOLIA_RPC_URL,
      // This uses your secret key to prove who you are
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};