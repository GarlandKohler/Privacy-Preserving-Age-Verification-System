#!/usr/bin/env ts-node

/**
 * Script: Create FHEVM Example
 * Purpose: Generate standalone example repositories
 * Usage: ts-node scripts/create-example.ts <example-name> <output-dir>
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface ExampleConfig {
    name: string;
    description: string;
    contract: string;
    test: string;
    keywords: string[];
}

const EXAMPLES_MAP: { [key: string]: ExampleConfig } = {
    "private-age-verification": {
        name: "Private Age Verification",
        description: "Core age verification contract using FHE",
        contract: "PrivateAgeVerification.sol",
        test: "PrivateAgeVerification.test.ts",
        keywords: ["age-verification", "fhe", "privacy"],
    },
    "verifier-registry": {
        name: "Verifier Registry",
        description: "Manage authorized verifiers and permissions",
        contract: "VerifierRegistry.sol",
        test: "VerifierRegistry.test.ts",
        keywords: ["access-control", "verifier-management"],
    },
    "age-range-verification": {
        name: "Age Range Verification",
        description: "Verify ages fall within specific ranges",
        contract: "AgeRangeVerification.sol",
        test: "AgeRangeVerification.test.ts",
        keywords: ["age-ranges", "range-checking"],
    },
    "multi-party-verification": {
        name: "Multi-Party Verification",
        description: "Compare and verify ages between multiple users",
        contract: "MultiPartyVerification.sol",
        test: "MultiPartyVerification.test.ts",
        keywords: ["multi-party", "comparisons"],
    },
    "audited-verification": {
        name: "Audited Verification",
        description: "Age verification with complete audit trail",
        contract: "AuditedVerification.sol",
        test: "AuditedVerification.test.ts",
        keywords: ["audit-trail", "logging"],
    },
};

function createExample(exampleName: string, outputDir: string): void {
    const example = EXAMPLES_MAP[exampleName];

    if (!example) {
        console.error(`❌ Example not found: ${exampleName}`);
        console.log(`Available examples:`);
        Object.keys(EXAMPLES_MAP).forEach((name) => {
            console.log(`  - ${name}`);
        });
        process.exit(1);
    }

    console.log(`📦 Creating example: ${example.name}`);
    console.log(`📁 Output directory: ${outputDir}`);

    // Create output directory structure
    const dirs = [
        outputDir,
        path.join(outputDir, "contracts"),
        path.join(outputDir, "test"),
        path.join(outputDir, "scripts"),
        path.join(outputDir, "deploy"),
    ];

    dirs.forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Copy contract
    const contractSrc = path.join("contracts", example.contract);
    const contractDest = path.join(outputDir, "contracts", example.contract);

    if (fs.existsSync(contractSrc)) {
        fs.copyFileSync(contractSrc, contractDest);
        console.log(`✅ Copied contract: ${example.contract}`);
    }

    // Copy test
    const testSrc = path.join("test", example.test);
    const testDest = path.join(outputDir, "test", example.test);

    if (fs.existsSync(testSrc)) {
        fs.copyFileSync(testSrc, testDest);
        console.log(`✅ Copied test: ${example.test}`);
    }

    // Copy configuration files
    const configFiles = ["hardhat.config.ts", "package.json", "tsconfig.json", ".env.example"];

    configFiles.forEach((file) => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, path.join(outputDir, file));
            console.log(`✅ Copied: ${file}`);
        }
    });

    // Create README
    const readmeContent = `# ${example.name}

## Overview

${example.description}

### Keywords
${example.keywords.map((kw) => `- ${kw}`).join("\n")}

## Installation

\`\`\`bash
npm install
\`\`\`

## Compilation

\`\`\`bash
npm run compile
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Deployment

### Sepolia Testnet

\`\`\`bash
npm run deploy:sepolia
\`\`\`

### Local Network

\`\`\`bash
npm run deploy:localhost
\`\`\`

## Contract

Contract file: \`contracts/${example.contract}\`

## Tests

Test file: \`test/${example.test}\`

## Features

- Fully Homomorphic Encryption support
- Privacy-preserving operations
- Comprehensive test coverage
- Gas-optimized implementations

## Learning Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity FHE Library](https://docs.zama.ai/fhevm/fundamentals/solidity_lib)
- [Developer Guide](../DEVELOPMENT_GUIDE.md)

## Support

For questions or issues:
- Discord: [Zama Discord](https://discord.com/invite/zama)
- Forum: [Community Forum](https://www.zama.ai/community)

## License

MIT
`;

    fs.writeFileSync(path.join(outputDir, "README.md"), readmeContent);
    console.log("✅ Generated README.md");

    // Create .env.example
    const envContent = `# Sepolia Testnet RPC URL
SEPOLIA_RPC_URL=https://rpc.sepolia.dev/

# Your private key (NEVER commit to version control!)
PRIVATE_KEY=your_private_key_here

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas reporting (optional)
REPORT_GAS=false
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
`;

    fs.writeFileSync(path.join(outputDir, ".env.example"), envContent);
    console.log("✅ Generated .env.example");

    // Create .gitignore
    const gitignoreContent = `# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment
.env
.env.local

# Build artifacts
artifacts/
cache/
typechain-types/
dist/

# Coverage
coverage/
coverage.json

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
`;

    fs.writeFileSync(path.join(outputDir, ".gitignore"), gitignoreContent);
    console.log("✅ Generated .gitignore");

    console.log(`\n✨ Example created successfully!`);
    console.log(`\nNext steps:`);
    console.log(`  1. cd ${outputDir}`);
    console.log(`  2. npm install`);
    console.log(`  3. npm run compile`);
    console.log(`  4. npm test`);
}

// CLI
const args = process.argv.slice(2);

if (args.length < 2) {
    console.log(`Usage: ts-node scripts/create-example.ts <example-name> <output-dir>`);
    console.log(`\nAvailable examples:`);
    Object.entries(EXAMPLES_MAP).forEach(([name, config]) => {
        console.log(`  ${name}: ${config.description}`);
    });
    process.exit(1);
}

const [exampleName, outputDir] = args;
createExample(exampleName, outputDir);
