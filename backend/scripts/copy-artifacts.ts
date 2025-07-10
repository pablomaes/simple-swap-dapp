import fs from "fs";
import path from "path";

function main() {
  console.log("Copying contract artifacts to frontend...");

  // Rutas de origen y destino
  const backendArtifactsDir = path.join(__dirname, "../artifacts/contracts/SimpleSwap.sol");
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");

  // Crear el directorio de destino si no existe
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Copiar el ABI
  fs.copyFileSync(
    path.join(backendArtifactsDir, "SimpleSwap.json"),
    path.join(frontendContractsDir, "SimpleSwap.json")
  );

  

  console.log("✅ Artifacts copied successfully to frontend/src/contracts");
}

// Ejecutar el script
try {
  main();
} catch (error) {
  console.error("Error copying artifacts:", error);
  process.exit(1);
}