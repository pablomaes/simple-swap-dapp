import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

// Cargar las variables de entorno de forma segura
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";

const config: HardhatUserConfig = {
  // Configuración de Solidity (compilador)
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },

  // Configuración de las redes (local y de prueba)
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },

  // Configuración de Etherscan (para verificación)
  // ESTA ES LA SECCIÓN CORREGIDA
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;