// La dirección del contrato SimpleSwap que desplegaste en Sepolia
export const SIMPLE_SWAP_ADDRESS = "0xC9dD7BFcA22Ba08AC04826D18990b48DBe2d3E26";

// El ABI del contrato, que le dice a ethers.js cómo interactuar con él.
// Lo importamos directamente del archivo que Hardhat generó.
import abiData from "../contracts/SimpleSwap.json";
export const SIMPLE_SWAP_ABI = abiData.abi;