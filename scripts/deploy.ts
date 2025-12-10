import { ethers } from "hardhat";

/**
 * Deployment script for Privacy Age Verification contracts
 * Deploys all contracts to the specified network
 */
async function main() {
    console.log("🚀 Deploying Privacy Age Verification System...\n");

    const [deployer] = await ethers.getSigners();
    console.log(`📝 Deploying from account: ${deployer.address}\n`);

    // Deploy PrivateAgeVerification
    console.log("📦 Deploying PrivateAgeVerification...");
    const PrivateAgeVerification = await ethers.getContractFactory("PrivateAgeVerification");
    const privateAgeVerification = await PrivateAgeVerification.deploy();
    await privateAgeVerification.deployed();
    console.log(`✅ PrivateAgeVerification deployed to: ${privateAgeVerification.address}\n`);

    // Deploy VerifierRegistry
    console.log("📦 Deploying VerifierRegistry...");
    const VerifierRegistry = await ethers.getContractFactory("VerifierRegistry");
    const verifierRegistry = await VerifierRegistry.deploy();
    await verifierRegistry.deployed();
    console.log(`✅ VerifierRegistry deployed to: ${verifierRegistry.address}\n`);

    // Deploy AgeRangeVerification
    console.log("📦 Deploying AgeRangeVerification...");
    const AgeRangeVerification = await ethers.getContractFactory("AgeRangeVerification");
    const ageRangeVerification = await AgeRangeVerification.deploy();
    await ageRangeVerification.deployed();
    console.log(`✅ AgeRangeVerification deployed to: ${ageRangeVerification.address}\n`);

    // Deploy MultiPartyVerification
    console.log("📦 Deploying MultiPartyVerification...");
    const MultiPartyVerification = await ethers.getContractFactory("MultiPartyVerification");
    const multiPartyVerification = await MultiPartyVerification.deploy();
    await multiPartyVerification.deployed();
    console.log(`✅ MultiPartyVerification deployed to: ${multiPartyVerification.address}\n`);

    // Deploy AuditedVerification
    console.log("📦 Deploying AuditedVerification...");
    const AuditedVerification = await ethers.getContractFactory("AuditedVerification");
    const auditedVerification = await AuditedVerification.deploy();
    await auditedVerification.deployed();
    console.log(`✅ AuditedVerification deployed to: ${auditedVerification.address}\n`);

    // Save deployment addresses
    const deploymentAddresses = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        deployer: deployer.address,
        contracts: {
            PrivateAgeVerification: privateAgeVerification.address,
            VerifierRegistry: verifierRegistry.address,
            AgeRangeVerification: ageRangeVerification.address,
            MultiPartyVerification: multiPartyVerification.address,
            AuditedVerification: auditedVerification.address,
        },
        deploymentTime: new Date().toISOString(),
    };

    console.log("\n" + "=".repeat(60));
    console.log("✨ Deployment Summary");
    console.log("=".repeat(60));
    console.log(JSON.stringify(deploymentAddresses, null, 2));
    console.log("=".repeat(60) + "\n");

    // Save to file
    const fs = require("fs");
    const path = require("path");
    const deploymentsDir = path.join(__dirname, "../deployments");

    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const network = (await ethers.provider.getNetwork()).name;
    const filename = path.join(deploymentsDir, `${network}-deployment.json`);
    fs.writeFileSync(filename, JSON.stringify(deploymentAddresses, null, 2));

    console.log(`📄 Deployment addresses saved to: ${filename}`);

    // Verify on Etherscan (if API key is provided)
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
    if (etherscanApiKey && network !== "localhost" && network !== "hardhat") {
        console.log("\n🔍 Waiting before Etherscan verification...");
        await new Promise((resolve) => setTimeout(resolve, 30000));

        console.log("📋 Verifying contracts on Etherscan...");

        try {
            await hre.run("verify:verify", {
                address: privateAgeVerification.address,
                constructorArguments: [],
            });
            console.log("✅ PrivateAgeVerification verified");
        } catch (error) {
            console.log("⚠️  PrivateAgeVerification verification failed:", error);
        }

        try {
            await hre.run("verify:verify", {
                address: verifierRegistry.address,
                constructorArguments: [],
            });
            console.log("✅ VerifierRegistry verified");
        } catch (error) {
            console.log("⚠️  VerifierRegistry verification failed:", error);
        }
    }

    console.log("\n✨ Deployment complete!");
}

// Import hre for Etherscan verification
import hardhat as hre from "hardhat";

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
