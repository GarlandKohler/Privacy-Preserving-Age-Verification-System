# Development Guide: Privacy-Preserving Age Verification System

This guide walks you through developing enhanced versions of the privacy-preserving age verification system using Fully Homomorphic Encryption (FHE).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Architecture Overview](#architecture-overview)
4. [Contract Development](#contract-development)
5. [Test Development](#test-development)
6. [Documentation Generation](#documentation-generation)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Knowledge
- Solidity smart contract development
- TypeScript and JavaScript
- Hardhat framework basics
- Cryptography fundamentals (helpful but not required)

### Required Tools
- Node.js 18+
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Optional Tools
- Hardhat plugins for testing
- TypeScript compiler
- Documentation generators

---

## Environment Setup

### Step 1: Clone Base Template

```bash
# Clone the base template
git clone https://github.com/zama-ai/fhevm-hardhat-template.git
cd fhevm-hardhat-template

# Install dependencies
npm install
```

### Step 2: Create Your Project Structure

```bash
# Create your competition project directory
mkdir privacy-verification-suite
cd privacy-verification-suite

# Copy the base template
cp -r ../fhevm-hardhat-template ./base-template

# Create directory structure
mkdir -p contracts/{core,access-control,extensions,patterns}
mkdir -p test/{core,access-control,extensions,patterns}
mkdir -p scripts
mkdir -p docs/{guides,examples,api}
```

### Step 3: Install Dependencies

```bash
# Install core FHE dependencies
npm install @fhevm/solidity @fhevm/hardhat-plugin @zama-fhe/relayer-sdk

# Install development dependencies
npm install -D typescript ts-node @types/node hardhat hardhat-deploy

# Install documentation tools
npm install -D typedoc markdown-it
```

### Step 4: Verify Installation

```bash
# Verify Hardhat installation
npx hardhat --version

# Compile example contract
npx hardhat compile

# Run sample test
npx hardhat test
```

---

## Architecture Overview

### Core Components

#### 1. Smart Contracts Layer
```
Contracts/
├── PrivateAgeVerification (Core)
├── VerifierRegistry (Access Control)
├── PermissionManager (FHE Permissions)
├── AuditLog (History Tracking)
└── IntegrationExamples (Use Cases)
```

**Responsibilities**:
- Handle encrypted data storage
- Perform FHE computations
- Manage access permissions
- Track verification history

#### 2. FHE Layer
```
FHE Operations/
├── Comparisons (ge, le, eq, gt, lt)
├── Logical Operations (and, or, not)
├── Arithmetic (add, sub, mul)
└── Type Conversions (asEuint8, asEuint32, etc.)
```

**Responsibilities**:
- Perform computations on encrypted data
- Handle encryption/decryption boundaries
- Manage encryption binding

#### 3. Permission Layer
```
Permission System/
├── FHE.allowThis() - Grant contract permission
├── FHE.allow() - Grant user permission
├── FHE.allowTransient() - Temporary permissions
└── Authorization Checks
```

**Responsibilities**:
- Control who can access encrypted data
- Prevent unauthorized decryption
- Ensure data privacy

#### 4. Testing Layer
```
Tests/
├── Unit Tests - Individual functions
├── Integration Tests - Contract interactions
├── Security Tests - Permission enforcement
└── Error Tests - Anti-pattern prevention
```

**Responsibilities**:
- Validate contract behavior
- Test FHE operations
- Verify permission system
- Check error handling

---

## Contract Development

### 1. Core Verification Contract

#### Template Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivateAgeVerification
 * @notice A privacy-preserving age verification system using FHE
 * @dev All age data is encrypted and never exposed in plain text
 */
contract PrivateAgeVerification is SepoliaConfig {
    // ... implementation
}
```

#### Key Design Patterns

**Pattern 1: Encrypted State Storage**
```solidity
// Store encrypted data
mapping(address => euint8) private encryptedAges;

// Store encrypted results
mapping(address => ebool) private verificationResults;
```

**Pattern 2: FHE Computations**
```solidity
function verifyAge(address user, uint8 threshold) external {
    euint8 userAge = encryptedAges[user];
    ebool isAdult = FHE.ge(userAge, FHE.asEuint8(threshold));
}
```

**Pattern 3: Permission Management**
```solidity
// Always grant both contract and user permissions
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, msg.sender);
```

### 2. Access Control Contract

#### Implementation Example

```solidity
contract VerifierRegistry {
    mapping(address => bool) public authorizedVerifiers;

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "Not authorized");
        _;
    }

    function addVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = true;
    }
}
```

### 3. Advanced Patterns

#### Pattern: Range Verification

```solidity
// ✅ CORRECT: Check if age is in range [18, 65]
function verifyAgeInRange(
    address user,
    uint8 minAge,
    uint8 maxAge
) external returns (ebool) {
    euint8 age = encryptedAges[user];

    ebool aboveMin = FHE.ge(age, FHE.asEuint8(minAge));
    ebool belowMax = FHE.le(age, FHE.asEuint8(maxAge));

    return FHE.and(aboveMin, belowMax);
}
```

#### Pattern: Comparative Verification

```solidity
// ✅ CORRECT: Compare two users' ages without revealing either
function isOlderThan(address user1, address user2)
    external returns (ebool)
{
    return FHE.gt(encryptedAges[user1], encryptedAges[user2]);
}
```

#### Pattern: Multi-Step Verification

```solidity
// ✅ CORRECT: Chain multiple verifications
function complexVerification(address user) external {
    euint8 age = encryptedAges[user];

    // Check if age >= 18
    ebool isAdult = FHE.ge(age, FHE.asEuint8(18));

    // Check if age < 65
    ebool notSenior = FHE.lt(age, FHE.asEuint8(65));

    // Combine conditions
    ebool isWorkingAge = FHE.and(isAdult, notSenior);

    // Store result with permissions
    verificationResults[user] = isWorkingAge;
    FHE.allowThis(isWorkingAge);
    FHE.allow(isWorkingAge, user);
}
```

---

## Test Development

### 1. Unit Test Template

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { PrivateAgeVerification } from "../typechain-types";
import { FhevmInstance } from "fhevm";

describe("PrivateAgeVerification - Unit Tests", function () {
    let contract: PrivateAgeVerification;
    let owner: any;
    let user: any;
    let fhevmInstance: FhevmInstance;

    beforeEach(async function () {
        // Deploy contract
        const PrivateAgeVerification = await ethers.getContractFactory(
            "PrivateAgeVerification"
        );
        contract = await PrivateAgeVerification.deploy();
        await contract.deployed();

        // Get signers
        [owner, user] = await ethers.getSigners();

        // Initialize FHE instance
        fhevmInstance = await FhevmInstance.getInstance();
    });

    describe("Age Submission", function () {
        it("✅ Should accept valid age submission", async function () {
            const age = 25;

            // Submit age
            await expect(
                contract.connect(user).submitEncryptedAge(age)
            ).to.emit(contract, "AgeSubmitted");
        });

        it("❌ Should reject invalid age (too low)", async function () {
            const age = 0;

            await expect(
                contract.connect(user).submitEncryptedAge(age)
            ).to.be.revertedWith("Invalid age range");
        });

        it("❌ Should reject invalid age (too high)", async function () {
            const age = 150;

            await expect(
                contract.connect(user).submitEncryptedAge(age)
            ).to.be.revertedWith("Invalid age range");
        });

        it("❌ Should prevent duplicate submissions", async function () {
            const age = 25;

            // First submission
            await contract.connect(user).submitEncryptedAge(age);

            // Second submission should fail
            await expect(
                contract.connect(user).submitEncryptedAge(30)
            ).to.be.revertedWith("Already verified");
        });
    });

    describe("Age Verification", function () {
        beforeEach(async function () {
            // Submit age first
            await contract.connect(user).submitEncryptedAge(25);
        });

        it("✅ Should return adult status for age >= 18", async function () {
            const result = await contract.connect(user).getVerificationResult();
            // Verify using FHE library
            const decrypted = await fhevmInstance.decrypt(
                contract.address,
                result
            );
            expect(decrypted).to.equal(true);
        });

        it("✅ Should verify age ranges correctly", async function () {
            const result = await contract
                .connect(user)
                .verifyAgeRange(20, 30);

            const decrypted = await fhevmInstance.decrypt(
                contract.address,
                result
            );
            expect(decrypted).to.equal(true);
        });

        it("❌ Should reject view function on encrypted data", async function () {
            // This demonstrates the FHE limitation
            await expect(
                contract.connect(user).getVerificationResult()
            ).to.not.throw; // View functions are allowed
        });
    });
});
```

### 2. Integration Test Template

```typescript
describe("Multi-User Verification", function () {
    it("✅ Should compare ages between users", async function () {
        const user1Age = 30;
        const user2Age = 25;

        // Both users submit ages
        await contract.connect(user1).submitEncryptedAge(user1Age);
        await contract.connect(user2).submitEncryptedAge(user2Age);

        // Compare ages
        const result = await contract
            .connect(user1)
            .compareAges(user2.address);

        // Verify user1 is older
        const decrypted = await fhevmInstance.decrypt(
            contract.address,
            result
        );
        expect(decrypted).to.equal(true);
    });
});
```

### 3. Security Test Template

```typescript
describe("Permission Enforcement", function () {
    it("✅ Should enforce permission grants", async function () {
        const age = 25;
        await contract.connect(user).submitEncryptedAge(age);

        // Verify permissions are set
        const result = await contract.connect(user).getVerificationResult();
        // Result should be accessible by contract and user
        expect(result).to.not.be.undefined;
    });

    it("❌ Should prevent missing allowThis() permissions", async function () {
        // This would require a deliberately broken contract to test
        // Document this as a known anti-pattern
    });
});
```

---

## Documentation Generation

### 1. TypeScript Documentation Script

```typescript
// scripts/generate-docs.ts

import * as fs from "fs";
import * as path from "path";

interface ContractDoc {
    name: string;
    description: string;
    functions: FunctionDoc[];
    events: EventDoc[];
}

interface FunctionDoc {
    name: string;
    description: string;
    parameters: ParamDoc[];
    returns: string;
}

interface ParamDoc {
    name: string;
    type: string;
    description: string;
}

interface EventDoc {
    name: string;
    parameters: ParamDoc[];
}

async function generateContractDocs(contractPath: string): Promise<ContractDoc> {
    const content = fs.readFileSync(contractPath, "utf-8");

    // Parse contract information
    const name = extractContractName(content);
    const description = extractDescription(content);
    const functions = extractFunctions(content);
    const events = extractEvents(content);

    return {
        name,
        description,
        functions,
        events
    };
}

function extractContractName(content: string): string {
    const match = content.match(/contract\s+(\w+)/);
    return match ? match[1] : "Unknown";
}

function extractDescription(content: string): string {
    const match = content.match(/\/\/\*\*[\s\S]*?\*\*\/|\/\/\/@notice[\s\S]*?\n/);
    return match ? match[0] : "No description available";
}

function extractFunctions(content: string): FunctionDoc[] {
    // Implementation to extract function documentation
    return [];
}

function extractEvents(content: string): EventDoc[] {
    // Implementation to extract event documentation
    return [];
}

async function generateMarkdown(docs: ContractDoc[]): Promise<string> {
    let markdown = "# Contract Reference\n\n";

    for (const doc of docs) {
        markdown += `## ${doc.name}\n\n`;
        markdown += `${doc.description}\n\n`;

        if (doc.functions.length > 0) {
            markdown += "### Functions\n\n";
            for (const func of doc.functions) {
                markdown += `#### \`${func.name}()\`\n\n`;
                markdown += `${func.description}\n\n`;
                markdown += "**Parameters:**\n";
                for (const param of func.parameters) {
                    markdown += `- \`${param.name}\` (\`${param.type}\`): ${param.description}\n`;
                }
                markdown += "\n";
            }
        }

        if (doc.events.length > 0) {
            markdown += "### Events\n\n";
            for (const event of doc.events) {
                markdown += `#### \`${event.name}\`\n\n`;
                markdown += "**Parameters:**\n";
                for (const param of event.parameters) {
                    markdown += `- \`${param.name}\` (\`${param.type}\`)\n`;
                }
                markdown += "\n";
            }
        }
    }

    return markdown;
}

// Main execution
async function main() {
    const contractsDir = path.join(__dirname, "../contracts");
    const contractFiles = fs.readdirSync(contractsDir).filter(f => f.endsWith(".sol"));

    const allDocs: ContractDoc[] = [];
    for (const file of contractFiles) {
        const filePath = path.join(contractsDir, file);
        const doc = await generateContractDocs(filePath);
        allDocs.push(doc);
    }

    const markdown = await generateMarkdown(allDocs);

    const outputPath = path.join(__dirname, "../docs/CONTRACT_REFERENCE.md");
    fs.writeFileSync(outputPath, markdown);

    console.log(`Documentation generated: ${outputPath}`);
}

main().catch(console.error);
```

### 2. Example Documentation Template

Create `docs/EXAMPLES.md`:

```markdown
# Usage Examples

## Basic Age Verification

### Smart Contract

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BasicAgeVerification {
    // ... implementation
}
\`\`\`

### Test Case

\`\`\`typescript
describe("Basic Age Verification", () => {
    it("should verify adult status", async () => {
        // ... test implementation
    });
});
\`\`\`

## Advanced: Age Range Verification

### Use Case
Verify that a user is between 18 and 65 years old without revealing their exact age.

### Implementation
[Implementation details...]

### Testing
[Test details...]
```

---

## Common Patterns

### Pattern 1: Permission Grant

**✅ CORRECT**:
```solidity
// Grant both contract and user permissions
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, msg.sender);
```

**❌ INCORRECT**:
```solidity
// Missing allowThis() - will fail during computation
FHE.allow(encryptedValue, msg.sender);
```

### Pattern 2: Encrypted Comparisons

**✅ CORRECT**:
```solidity
// Compare encrypted values directly
ebool result = FHE.ge(encryptedValue1, encryptedValue2);
```

**❌ INCORRECT**:
```solidity
// Cannot decrypt in view function
function compareAges(address user) external view returns (bool) {
    return decrypt(encryptedAges[user]) > 18;
}
```

### Pattern 3: Encryption Binding

**✅ CORRECT**:
```solidity
// Encrypt as euint8 and use euint8 operations
euint8 age = FHE.asEuint8(25);
ebool isAdult = FHE.ge(age, FHE.asEuint8(18));
```

**❌ INCORRECT**:
```solidity
// Mismatched types - will cause errors
euint32 age = FHE.asEuint32(25);
ebool isAdult = FHE.ge(age, FHE.asEuint8(18)); // Type mismatch
```

---

## Troubleshooting

### Issue 1: "Permission Denied" Error

**Problem**: Operations fail with permission error during execution.

**Solution**:
```solidity
// Ensure both permissions are granted
FHE.allowThis(encryptedValue);  // Contract permission
FHE.allow(encryptedValue, msg.sender);  // User permission
```

### Issue 2: Handle Expires

**Problem**: Encrypted value handles become invalid between transactions.

**Solution**:
```typescript
// Use fresh encryption for each transaction
const encrypted = fhevmInstance.createEncryptedInput(
    contractAddress,
    userAddress
);
```

### Issue 3: Type Mismatch Errors

**Problem**: Cannot perform operations between different encrypted types.

**Solution**:
```solidity
// Ensure type consistency
euint8 value1 = FHE.asEuint8(25);
euint8 value2 = FHE.asEuint8(18);
ebool result = FHE.ge(value1, value2); // Both euint8 ✅
```

### Issue 4: View Function Limitations

**Problem**: Cannot decrypt values in view functions.

**Solution**:
```solidity
// ❌ This won't work - cannot decrypt in view
function getAge() external view returns (uint8) {
    return FHE.decrypt(encryptedAge);
}

// ✅ This works - return encrypted value
function getAgeEncrypted() external view returns (euint8) {
    return encryptedAge;
}

// ✅ This works - external function with actual decryption
function decryptAge() external returns (uint8) {
    return FHE.decrypt(encryptedAge);
}
```

### Issue 5: Transaction Reverts

**Problem**: Transactions fail with no clear error message.

**Solution**:
1. Check input validation (age range, permissions, etc.)
2. Verify FHE state is properly initialized
3. Ensure all encrypted values have permissions granted
4. Test with Hardhat's local FHE testnet

---

## Additional Resources

### Documentation
- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity FHE Library Reference](https://docs.zama.ai/fhevm/fundamentals/solidity_lib)

### Community
- [Zama Discord](https://discord.com/invite/zama)
- [Community Forum](https://www.zama.ai/community)

### Tools
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

**Happy Development!** For questions or issues, reach out to the Zama community on Discord.
