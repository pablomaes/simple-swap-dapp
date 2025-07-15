// La dirección del contrato SimpleSwap que desplegamos en Sepolia
export const SIMPLE_SWAP_ADDRESS = "0x64e530356f28878D34c8983E4F2e590840E7d6a3";

// El ABI del contrato, que le dice a ethers.js cómo interactuar con él.
// Lo importamos directamente del archivo que Hardhat generó.
import abiData from "../contracts/SimpleSwap.json";
export const SIMPLE_SWAP_ABI = abiData.abi;