// La dirección del contrato SimpleSwap que desplegamos en Sepolia
export const SIMPLE_SWAP_ADDRESS = "0xE8037844250C3556089Ca40A8223d02cDf37D77A";

// El ABI del contrato, que le dice a ethers.js cómo interactuar con él.
// Lo importamos directamente del archivo que Hardhat generó.
import abiData from "../contracts/SimpleSwap.json";
export const SIMPLE_SWAP_ABI = abiData.abi;