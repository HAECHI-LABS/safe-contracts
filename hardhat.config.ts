import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "hardhat-deploy";
import dotenv from "dotenv";
import type { HardhatUserConfig, HttpNetworkUserConfig } from "hardhat/types";
import yargs from "yargs";

const argv = yargs
    .option("network", {
      type: "string",
      default: "hardhat",
    })
    .help(false)
    .version(false).argv;

// Load environment variables.
dotenv.config();
const { NODE_URL, INFURA_KEY, MNEMONIC, ETHERSCAN_API_KEY, PK, SOLIDITY_VERSION, SOLIDITY_SETTINGS } = process.env;

const DEFAULT_MNEMONIC =
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const sharedNetworkConfig: HttpNetworkUserConfig = {};
if (PK) {
  sharedNetworkConfig.accounts = [PK];
} else {
  sharedNetworkConfig.accounts = {
    mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
  };
}

if (["mainnet", "rinkeby", "kovan", "goerli"].includes(argv.network) && INFURA_KEY === undefined) {
  throw new Error(
      `Could not find Infura key in env, unable to connect to network ${argv.network}`,
  );
}

import "./src/tasks/local_verify"
import "./src/tasks/deploy_contracts"
import "./src/tasks/show_codesize"
import "./src/tasks/misc"

const primarySolidityVersion = SOLIDITY_VERSION || "0.7.6"
const soliditySettings = !!SOLIDITY_SETTINGS ? JSON.parse(SOLIDITY_SETTINGS) : undefined

// for deterministic deployment.
// ./src/deploy 패키지 참고
const SALT = '0x0000000000000000000000000000000000000000';

const userConfig: HardhatUserConfig = {
  deterministicDeployment: {
    "77001": { // bora mainnet
      factory: "0x143b9050fb0cc03d2316cdca9442e2765d534243"
    } as any,
    "8217": { // klaytn mainnet
      factory: "0x143b9050fb0cc03d2316cdca9442e2765d534243"
    } as any,
    "1": { // ethereum mainnet
      factory: "0x143b9050fb0cc03d2316cdca9442e2765d534243"
    } as any,
    "137": { // polygon mainnet
      factory: "0x143b9050fb0cc03d2316cdca9442e2765d534243"
    } as any,
    "80001": { // polygon testnet
      factory: "0x143b9050fb0cc03d2316cdca9442e2765d534243"
    } as any
  },
  paths: {
    artifacts: "build/artifacts",
    cache: "build/cache",
    deploy: "src/deploy",
    sources: "contracts",
  },
  solidity: {
    compilers: [
      { version: primarySolidityVersion,
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }},
      { version: "0.6.12" },
      { version: "0.5.17" },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 100000000,
      gas: 100000000
    },
    mainnet: {
      ...sharedNetworkConfig,
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    matic: {
      ...sharedNetworkConfig,
      url: `https://polygon-mainnet.infura.io/v3/4feb1e5949df453fa6326d4328fe5b80`,
    },
    mumbai: {
      ...sharedNetworkConfig,
      url: `https://rpc-mumbai.matic.today`,
    },
    cypress: {
      ...sharedNetworkConfig,
      chainId: 8217,
      url: `https://public-en-cypress.klaytn.net`,
    },
    bora: {
      ...sharedNetworkConfig,
      chainId: 77001,
      url: `https://public-node.api.boraportal.io/bora/mainnet`,
    },
    xdai: {
      ...sharedNetworkConfig,
      url: "https://xdai.poanetwork.dev",
    },
    ewc: {
      ...sharedNetworkConfig,
      url: `https://rpc.energyweb.org`,
    },
    rinkeby: {
      ...sharedNetworkConfig,
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
    },
    goerli: {
      ...sharedNetworkConfig,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    },
    kovan: {
      ...sharedNetworkConfig,
      url: `https://kovan.infura.io/v3/${INFURA_KEY}`,
    },
    volta: {
      ...sharedNetworkConfig,
      url: `https://volta-rpc.energyweb.org`,
    },
    baobab: {
      ...sharedNetworkConfig,
      chainId: 1001,
      url: `https://public-en-baobab.klaytn.net/`,
    }
  },
  namedAccounts: {
    deployer: 0,
    salt: SALT,
  },
  mocha: {
    timeout: 2000000,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
if (NODE_URL) {
  userConfig.networks!!.custom = {
    ...sharedNetworkConfig,
    url: NODE_URL,
  }
}
export default userConfig
