#!/usr/bin/env ts-node

/**
 * Script: Generate Documentation
 * Purpose: Auto-generate markdown documentation from contracts and tests
 * Usage: ts-node scripts/generate-docs.ts [contract-name]
 */

import * as fs from "fs";
import * as path from "path";

interface ContractFunction {
    name: string;
    description: string;
    params: { name: string; type: string; description: string }[];
    returns: string;
    visibility: string;
}

interface ContractEvent {
    name: string;
    params: { name: string; type: string }[];
}

const CONTRACTS = [
    // Core Examples
    {
        name: "PrivateAgeVerification",
        description: "Core age verification contract using FHE",
        file: "contracts/PrivateAgeVerification.sol",
    },
    {
        name: "VerifierRegistry",
        description: "Manage authorized verifiers and permissions",
        file: "contracts/VerifierRegistry.sol",
    },
    {
        name: "AgeRangeVerification",
        description: "Verify ages fall within specific ranges",
        file: "contracts/AgeRangeVerification.sol",
    },
    {
        name: "MultiPartyVerification",
        description: "Compare and verify ages between multiple users",
        file: "contracts/MultiPartyVerification.sol",
    },
    {
        name: "AuditedVerification",
        description: "Age verification with complete audit trail",
        file: "contracts/AuditedVerification.sol",
    },
    // Basic FHE Examples
    {
        name: "FHECounter",
        description: "A simple FHE counter demonstrating basic operations",
        file: "contracts/basic/FHECounter.sol",
    },
    {
        name: "EncryptSingleValue",
        description: "Demonstrates how to encrypt and store a single value",
        file: "contracts/basic/EncryptSingleValue.sol",
    },
    {
        name: "EncryptMultipleValues",
        description: "Demonstrates encryption and management of multiple values",
        file: "contracts/basic/EncryptMultipleValues.sol",
    },
    {
        name: "UserDecryptSingleValue",
        description: "Demonstrates user-side decryption of encrypted values",
        file: "contracts/basic/UserDecryptSingleValue.sol",
    },
    {
        name: "AccessControlExample",
        description: "Demonstrates FHE access control using allowThis and allow",
        file: "contracts/basic/AccessControlExample.sol",
    },
    {
        name: "FHEArithmetic",
        description: "Demonstrates arithmetic operations on encrypted values",
        file: "contracts/basic/FHEArithmetic.sol",
    },
    {
        name: "FHEComparison",
        description: "Demonstrates comparison operations on encrypted values",
        file: "contracts/basic/FHEComparison.sol",
    },
    {
        name: "InputProofExample",
        description: "Demonstrates input proofs and their importance",
        file: "contracts/basic/InputProofExample.sol",
    },
    {
        name: "PublicDecryptSingleValue",
        description: "Demonstrates public decryption of a single encrypted value",
        file: "contracts/basic/PublicDecryptSingleValue.sol",
    },
    {
        name: "PublicDecryptMultipleValues",
        description: "Demonstrates public decryption of multiple encrypted values",
        file: "contracts/basic/PublicDecryptMultipleValues.sol",
    },
    {
        name: "UnderstandingHandles",
        description: "Educational contract explaining FHE handles and their lifecycle",
        file: "contracts/basic/UnderstandingHandles.sol",
    },
    {
        name: "AntiPatterns",
        description: "Common mistakes in FHE development with correct approaches",
        file: "contracts/basic/AntiPatterns.sol",
    },
];

function extractFunctions(content: string): ContractFunction[] {
    const functions: ContractFunction[] = [];

    // Extract function blocks
    const functionRegex =
        /\/\*\*\s*([\s\S]*?)\*\/\s*function\s+(\w+)\s*\(([\s\S]*?)\)\s*external\s*([^{]*)/g;

    let match;
    while ((match = functionRegex.exec(content)) !== null) {
        const docBlock = match[1];
        const functionName = match[2];
        const params = match[3];

        // Extract description
        const descMatch = docBlock.match(/@notice\s+([\s\S]*?)(?=@|\*\/)/);
        const description = descMatch ? descMatch[1].trim() : "";

        // Extract parameters
        const paramMatches = [...docBlock.matchAll(/@param\s+(\w+)\s+(.+?)(?=\n|@)/g)];
        const paramList = paramMatches.map((m) => ({
            name: m[1],
            type: "",
            description: m[2].trim(),
        }));

        // Extract returns
        const returnMatch = docBlock.match(/@return\s+([\s\S]*?)(?=@|\*\/)/);
        const returns = returnMatch ? returnMatch[1].trim() : "";

        functions.push({
            name: functionName,
            description,
            params: paramList,
            returns,
            visibility: "external",
        });
    }

    return functions;
}

function generateContractDoc(contractName: string): string {
    const contract = CONTRACTS.find((c) => c.name === contractName);
    if (!contract) {
        throw new Error(`Contract not found: ${contractName}`);
    }

    const filePath = path.join(process.cwd(), contract.file);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const functions = extractFunctions(content);

    // Generate markdown
    let markdown = `# ${contract.name}\n\n`;
    markdown += `${contract.description}\n\n`;

    markdown += `## Overview\n\n`;
    markdown += `This contract provides privacy-preserving age verification using Fully Homomorphic Encryption (FHE).\n\n`;

    markdown += `**File**: \`${contract.file}\`\n\n`;

    markdown += `## Functions\n\n`;

    functions.forEach((func) => {
        markdown += `### \`${func.name}()\`\n\n`;
        markdown += `${func.description}\n\n`;

        if (func.params.length > 0) {
            markdown += `**Parameters:**\n\n`;
            func.params.forEach((param) => {
                markdown += `- \`${param.name}\` - ${param.description}\n`;
            });
            markdown += "\n";
        }

        if (func.returns) {
            markdown += `**Returns:**\n\n`;
            markdown += `${func.returns}\n\n`;
        }
    });

    markdown += `## Security Considerations\n\n`;
    markdown += `- All age data is stored as encrypted values\n`;
    markdown += `- Comparisons are performed on encrypted data\n`;
    markdown += `- FHE permissions are properly managed\n`;
    markdown += `- Access control is enforced for sensitive operations\n\n`;

    markdown += `## Usage Example\n\n`;
    markdown += `\`\`\`solidity\n`;
    markdown += `// Submit encrypted age\n`;
    markdown += `contract.submitEncryptedAge(25);\n\n`;
    markdown += `// Get verification result\n`;
    markdown += `ebool result = contract.getVerificationResult();\n`;
    markdown += `\`\`\`\n\n`;

    markdown += `## References\n\n`;
    markdown += `- [FHEVM Docs](https://docs.zama.ai/fhevm)\n`;
    markdown += `- [Test File](../test/${contractName}.test.ts)\n`;

    return markdown;
}

function generateIndexDoc(): string {
    let markdown = `# Privacy-Preserving Age Verification - API Reference\n\n`;
    markdown += `Complete API documentation for all smart contracts.\n\n`;

    markdown += `## Table of Contents\n\n`;
    CONTRACTS.forEach((contract) => {
        markdown += `- [${contract.name}](#${contract.name.toLowerCase()})\n`;
    });
    markdown += "\n";

    CONTRACTS.forEach((contract) => {
        markdown += `## ${contract.name}\n\n`;
        markdown += `${contract.description}\n\n`;
        markdown += `**File**: \`${contract.file}\`\n\n`;
        markdown += `[View Full Documentation](./contracts/${contract.name}.md)\n\n`;
    });

    markdown += `## Getting Started\n\n`;
    markdown += `1. [Installation](../README.md#installation)\n`;
    markdown += `2. [Deployment](../DEVELOPMENT_GUIDE.md#deployment)\n`;
    markdown += `3. [Integration](../DEVELOPMENT_GUIDE.md#integration)\n\n`;

    return markdown;
}

function generateAllDocs(): void {
    console.log("📚 Generating documentation...\n");

    const docsDir = path.join(process.cwd(), "docs");
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    // Generate individual contract docs
    CONTRACTS.forEach((contract) => {
        try {
            const doc = generateContractDoc(contract.name);
            const filename = path.join(docsDir, `${contract.name}.md`);
            fs.writeFileSync(filename, doc);
            console.log(`✅ Generated: ${contract.name}.md`);
        } catch (error) {
            console.warn(`⚠️  Could not generate docs for ${contract.name}: ${error}`);
        }
    });

    // Generate index
    const indexDoc = generateIndexDoc();
    fs.writeFileSync(path.join(docsDir, "INDEX.md"), indexDoc);
    console.log(`✅ Generated: INDEX.md`);

    // Generate SUMMARY for GitBook
    let summary = `# Summary\n\n`;
    summary += `* [Introduction](../README.md)\n`;
    summary += `* [Examples Overview](../EXAMPLES_OVERVIEW.md)\n`;
    summary += `* [Basic Examples Guide](BASIC_EXAMPLES.md)\n`;
    summary += `* [API Reference](INDEX.md)\n\n`;
    summary += `## Core Examples\n\n`;

    // Core examples
    const coreExamples = CONTRACTS.slice(0, 5);
    coreExamples.forEach((contract) => {
        summary += `* [${contract.name}](${contract.name}.md)\n`;
    });

    summary += `\n## Basic FHE Examples\n\n`;

    // Basic examples
    const basicExamples = CONTRACTS.slice(5);
    basicExamples.forEach((contract) => {
        summary += `* [${contract.name}](${contract.name}.md)\n`;
    });

    summary += `\n## Documentation\n\n`;
    summary += `* [Quick Start](../QUICKSTART.md)\n`;
    summary += `* [Development Guide](../DEVELOPMENT_GUIDE.md)\n`;
    summary += `* [Maintenance Guide](../MAINTENANCE_GUIDE.md)\n`;
    summary += `* [Architecture](../ARCHITECTURE.md)\n`;
    summary += `* [Technical Specifications](../TECHNICAL_SPECIFICATIONS.md)\n`;
    summary += `* [FAQ & Best Practices](../FAQ_AND_BEST_PRACTICES.md)\n`;

    fs.writeFileSync(path.join(docsDir, "SUMMARY.md"), summary);
    console.log(`✅ Generated: SUMMARY.md`);

    console.log(`\n✨ Documentation generated successfully!`);
    console.log(`📁 Output directory: ${docsDir}`);
}

function generateSingleDoc(contractName: string): void {
    console.log(`📚 Generating documentation for ${contractName}...\n`);

    const docsDir = path.join(process.cwd(), "docs");
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    try {
        const doc = generateContractDoc(contractName);
        const filename = path.join(docsDir, `${contractName}.md`);
        fs.writeFileSync(filename, doc);
        console.log(`✅ Generated: ${filename}`);
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--all") {
    generateAllDocs();
} else {
    generateSingleDoc(args[0]);
}
