# FAQ & Best Practices

Frequently Asked Questions and Best Practices for the Privacy-Preserving Age Verification System.

---

## Table of Contents

1. [General Questions](#general-questions)
2. [Development Questions](#development-questions)
3. [FHE-Specific Questions](#fhe-specific-questions)
4. [Testing Questions](#testing-questions)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## General Questions

### Q: What is Fully Homomorphic Encryption (FHE)?

**A**: FHE is a form of encryption that allows computations to be performed on encrypted data without decrypting it first. This means:

- Data stays encrypted throughout processing
- Results are computed on encrypted data
- Only authorized parties can decrypt results
- Perfect for privacy-preserving applications like age verification

### Q: Why is FHE better than traditional age verification?

**A**: Traditional methods require:
- Collecting and storing actual age data
- Trusting servers with sensitive information
- Risk of data breaches
- Potential privacy violations

FHE-based verification:
- Never stores plain-text ages
- Performs verification on encrypted data
- Blockchain immutability
- Zero-knowledge proofs of correctness

### Q: Can I use this system in production?

**A**: The system is designed for educational and competition purposes. For production:

1. Conduct thorough security audits
2. Test on mainnet-like conditions
3. Implement additional safeguards
4. Get professional security review
5. Follow regulatory requirements for age verification

### Q: Is this open-source?

**A**: Yes! The competition expects all submissions to be open-source and publicly available on GitHub with clear licensing (MIT recommended).

### Q: What blockchain networks are supported?

**A**: Currently supported:
- **Sepolia Testnet** (recommended for testing)
- **Ethereum Mainnet** (use with caution)
- **Hardhat Local Network** (for development)

Support for additional networks depends on FHEVM availability.

### Q: How much does it cost to deploy?

**A**: Cost varies:
- **Sepolia Testnet**: Free (faucet-funded)
- **Ethereum Mainnet**: ~$200-500 (highly variable with gas prices)
- **Development**: Free (local network)

### Q: Can users verify their privacy?

**A**: Yes! Features include:
- **Encrypted Storage**: Ages remain encrypted on-chain
- **Blockchain Verification**: All operations are auditable
- **No Data Collection**: No personal info stored
- **Zero-Knowledge Proofs**: Correctness verified without revealing data

---

## Development Questions

### Q: What are the minimum system requirements?

**A**:
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Disk Space**: 500MB minimum
- **RAM**: 2GB minimum (4GB recommended)
- **OS**: Linux, macOS, or Windows (WSL2 recommended for Windows)

### Q: How do I set up a development environment?

**A**: Follow these steps:

```bash
# 1. Clone base template
git clone https://github.com/zama-ai/fhevm-hardhat-template.git

# 2. Install dependencies
cd fhevm-hardhat-template
npm install

# 3. Verify installation
npx hardhat --version

# 4. Run tests
npm test
```

### Q: What editor should I use?

**A**: Recommended editors:
- **VS Code** (most popular, excellent extension support)
  - Install Solidity extension
  - Install TypeScript support
- **IntelliJ IDEA** (excellent Solidity support)
- **Vim/Neovim** (if you're experienced with these)

### Q: Can I fork the example implementation?

**A**: Yes! The example implementation serves as a reference. You can:
- Use it as a starting point
- Learn from its structure
- Implement your own enhanced version
- Remember to provide proper attribution

### Q: How do I handle environment variables?

**A**: Create `.env` file:

```bash
# .env
SEPOLIA_RPC_URL=https://rpc.sepolia.dev/
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key

# Never commit this file!
# Add to .gitignore
```

### Q: What's the typical development workflow?

**A**: Follow this cycle:

```
1. Write Contract
   └─ contracts/MyContract.sol

2. Write Tests
   └─ test/MyContract.test.ts

3. Compile
   └─ npm run compile

4. Test Locally
   └─ npm test

5. Deploy to Testnet
   └─ npm run deploy:sepolia

6. Verify on Explorer
   └─ Check Etherscan

7. Document
   └─ Update README and docs
```

---

## FHE-Specific Questions

### Q: What's the difference between euint8 and euint32?

**A**:

| Aspect | euint8 | euint32 |
|--------|--------|---------|
| Bit Width | 8 bits | 32 bits |
| Max Value | 255 | 4,294,967,295 |
| Gas Cost | Lower | Higher |
| Use Case | Ages, small values | Timestamps, larger values |

**Recommendation**: Use smallest type that fits your data (euint8 for ages).

### Q: Why do I need both FHE.allowThis() and FHE.allow()?

**A**: Different permissions for different actors:

```solidity
// ✅ CORRECT:
FHE.allowThis(result);        // Let CONTRACT use result
FHE.allow(result, msg.sender); // Let USER use result

// ❌ INCORRECT (missing allowThis):
FHE.allow(result, msg.sender); // Only user can use, not contract!
```

### Q: What happens if I forget to grant permissions?

**A**: Your operations will fail:

```
Error: FHE operation failed: No permission
```

The transaction will revert. Always remember:
1. `FHE.allowThis()` for contract
2. `FHE.allow()` for user

### Q: Can I perform arithmetic on encrypted values?

**A**: Limited support:
- ✅ **Supported**: Add, Subtract (v0.9.1+)
- ❌ **Not Supported**: Multiply, Divide
- ✅ **Supported**: All comparisons and logical operations

### Q: What are handles?

**A**: Handles are references to encrypted values:

```
Plaintext Value: 25
       ↓
Encrypted: [complex ciphertext]
       ↓
Handle: "euint8_0x1234..."

// Contract works with handles, not values
```

Handles are:
- Generated during encryption
- Valid only for their contract+user pair
- Bound to specific users
- Cannot be reused across contracts

### Q: Can I decrypt values in view functions?

**A**: No! View functions are read-only:

```solidity
// ❌ INCORRECT: Cannot decrypt in view
function getAge() external view returns (uint8) {
    return FHE.decrypt(encryptedAge);  // Error!
}

// ✅ CORRECT: Return encrypted value
function getAgeEncrypted() external view returns (euint8) {
    return encryptedAge;  // OK
}

// ✅ CORRECT: External function can decrypt
function decryptAge() external returns (uint8) {
    return FHE.decrypt(encryptedAge);  // OK
}
```

### Q: How do I handle input proofs?

**A**: Input proofs validate encryption binding:

```typescript
// Client-side (TypeScript)
const encrypted = fhevmInstance.createEncryptedInput(
    contractAddress,
    userAddress
);

// Add value to input
encrypted.add8(25);

// Get encrypted data and proof
const encryptedData = encrypted.encrypt();
const handles = encryptedData.handles;
const inputProof = encryptedData.inputProof;

// Call contract with proof
await contract.submitAge(handles[0], inputProof);
```

```solidity
// Contract-side (Solidity)
function submitAge(externalEuint8 input, bytes calldata inputProof) external {
    // Verify proof and convert
    euint8 age = FHE.fromExternal(input, inputProof);
    // Now use age
}
```

---

## Testing Questions

### Q: How do I write tests for encrypted values?

**A**: Use FhevmInstance for decryption:

```typescript
import { FhevmInstance } from "fhevm";

describe("My Tests", () => {
    let fhevmInstance: FhevmInstance;

    beforeEach(async () => {
        fhevmInstance = await FhevmInstance.getInstance();
    });

    it("should work with encrypted values", async () => {
        // Call function that returns encrypted value
        const encryptedResult = await contract.getAge();

        // Decrypt for testing
        const decrypted = await fhevmInstance.decrypt(
            contract.address,
            encryptedResult
        );

        // Assert on decrypted value
        expect(decrypted).to.equal(25);
    });
});
```

### Q: What's the difference between unit and integration tests?

**A**:

| Type | Scope | Example |
|------|-------|---------|
| Unit | Single function | `submitAge()` in isolation |
| Integration | Multiple functions | `submitAge()` → `verifyAge()` → `getResult()` |

**Best Practice**: Write both! Unit tests for correctness, integration for workflows.

### Q: How do I test error cases?

**A**: Use `expect().to.be.revertedWith()`:

```typescript
it("❌ Should reject invalid age", async () => {
    await expect(
        contract.submitAge(0)  // Invalid age
    ).to.be.revertedWith("Invalid age range");
});
```

### Q: What coverage should I aim for?

**A**: Aim for:
- **Minimum**: >85% code coverage
- **Target**: >95% code coverage
- **Best**: 100% for critical paths

Check coverage:
```bash
npm run test:coverage
```

### Q: How do I mock dependencies?

**A**: Example with access control:

```typescript
describe("Verifier Functions", () => {
    it("should allow owner to add verifiers", async () => {
        // Mock: Call as owner
        await contract.connect(owner).addVerifier(newVerifier.address);

        // Verify
        expect(await contract.isVerifier(newVerifier.address)).to.be.true;
    });

    it("should reject non-owner adding verifiers", async () => {
        // Mock: Call as non-owner
        await expect(
            contract.connect(attacker).addVerifier(newVerifier.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });
});
```

---

## Best Practices

### 1. Contract Development

#### NatSpec Documentation
```solidity
/**
 * @title PrivateAgeVerification
 * @notice Provides privacy-preserving age verification
 * @dev Uses FHE for all age comparisons
 */
contract PrivateAgeVerification {
    /**
     * @notice Submit encrypted age
     * @param _age User's age (must be 1-120)
     * @dev Emits AgeSubmitted event
     *
     * Requirements:
     * - Age must be in valid range
     * - User must not have previous submission
     *
     * Events:
     * - AgeSubmitted
     */
    function submitEncryptedAge(uint8 _age) external {
        // Implementation
    }
}
```

#### Permission Management
```solidity
// ✅ Always grant both permissions
function verifyAge(address user) external {
    euint8 age = encryptedAges[user];
    ebool isAdult = FHE.ge(age, FHE.asEuint8(18));

    // Grant permissions
    FHE.allowThis(isAdult);
    FHE.allow(isAdult, user);

    // Store result
    verificationResults[user] = isAdult;
}
```

#### Input Validation
```solidity
// ✅ Always validate inputs
function verifyAgeRange(uint8 minAge, uint8 maxAge) external {
    require(minAge <= maxAge, "Invalid range: min > max");
    require(minAge >= 1, "Minimum age too low");
    require(maxAge <= 120, "Maximum age too high");
    // Implementation
}
```

### 2. Testing

#### Descriptive Test Names
```typescript
// ✅ GOOD: Clear, specific
describe("Age Submission", () => {
    it("✅ Should accept valid age between 1 and 120", async () => {});
    it("❌ Should reject age of 0", async () => {});
    it("❌ Should reject age above 120", async () => {});
});

// ❌ BAD: Vague
describe("Tests", () => {
    it("works", async () => {});
    it("error test", async () => {});
});
```

#### Comprehensive Coverage
```typescript
// Include happy path, error cases, and edge cases
describe("submitAge", () => {
    // Happy path
    it("✅ Should accept age 18", async () => {});
    it("✅ Should accept age 1", async () => {});
    it("✅ Should accept age 120", async () => {});

    // Error cases
    it("❌ Should reject age 0", async () => {});
    it("❌ Should reject age 121", async () => {});

    // Edge cases
    it("❌ Should reject duplicate submission", async () => {});
    it("✅ Should emit AgeSubmitted event", async () => {});
});
```

### 3. Documentation

#### Inline Comments for Complex Logic
```solidity
// ✅ GOOD: Explains WHY
function verifyAgeRange(uint8 minAge, uint8 maxAge) external {
    AgeVerification storage verification = userVerifications[msg.sender];

    // Use encrypted comparison to prevent information leakage
    // Even failed comparisons don't reveal the age
    euint8 minAgeEncrypted = FHE.asEuint8(minAge);
    euint8 maxAgeEncrypted = FHE.asEuint8(maxAge);

    ebool ageAboveMin = FHE.ge(verification.encryptedAge, minAgeEncrypted);
    ebool ageBelowMax = FHE.le(verification.encryptedAge, maxAgeEncrypted);

    // Combine conditions with AND
    return FHE.and(ageAboveMin, ageBelowMax);
}

// ❌ BAD: No explanation
function verifyAgeRange(uint8 minAge, uint8 maxAge) external {
    euint8 minAgeEncrypted = FHE.asEuint8(minAge);
    euint8 maxAgeEncrypted = FHE.asEuint8(maxAge);
    ebool ageAboveMin = FHE.ge(userVerifications[msg.sender].encryptedAge, minAgeEncrypted);
    ebool ageBelowMax = FHE.le(userVerifications[msg.sender].encryptedAge, maxAgeEncrypted);
    return FHE.and(ageAboveMin, ageBelowMax);
}
```

#### README Structure
```markdown
# Project Name

## Overview
[1-2 sentences about what this does]

## Features
- Feature 1
- Feature 2

## Quick Start
[Setup instructions]

## Architecture
[System design]

## Testing
[How to run tests]

## Documentation
[Link to detailed docs]

## Contributing
[How to contribute]

## License
MIT
```

### 4. Security

#### Access Control
```solidity
// ✅ GOOD: Explicit access control
modifier onlyOwner() {
    require(msg.sender == owner, "Unauthorized: not owner");
    _;
}

modifier onlyVerifier() {
    require(authorizedVerifiers[msg.sender], "Unauthorized: not verifier");
    _;
}

// Use consistently
function emergencyPause() external onlyOwner {
    emergencyPaused = true;
}

function completeVerification(address user) external onlyVerifier {
    // Implementation
}
```

#### Input Validation
```solidity
// ✅ GOOD: Validate at boundaries
function submitAge(uint8 _age) external {
    require(_age >= 1, "Age too low");
    require(_age <= 120, "Age too high");
    require(!userVerifications[msg.sender].isVerified, "Already verified");
    // Implementation
}
```

#### Permission Enforcement
```solidity
// ✅ GOOD: Check permissions before operation
function verifyAge(address user) external {
    require(userVerifications[user].isVerified, "Age not submitted");

    euint8 age = encryptedAges[user];
    ebool result = FHE.ge(age, FHE.asEuint8(18));

    FHE.allowThis(result);
    FHE.allow(result, user);
}
```

### 5. Code Organization

#### Directory Structure
```
contracts/
├── core/
│   ├── PrivateAgeVerification.sol      # Main contract
│   └── VerifierRegistry.sol             # Access control
├── access-control/
│   └── RoleBasedAccess.sol
├── extensions/
│   └── AuditLog.sol
└── patterns/
    └── CommonPatterns.sol

test/
├── core/
│   ├── PrivateAgeVerification.test.ts
│   └── VerifierRegistry.test.ts
├── access-control/
│   └── RoleBasedAccess.test.ts
└── fixtures/
    └── setup.ts
```

#### Import Organization
```solidity
// 1. External imports
import { FHE, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

// 2. Internal imports
import { IAccessControl } from "./interfaces/IAccessControl.sol";
import { VerifierRegistry } from "./VerifierRegistry.sol";

// 3. Contract definition
contract PrivateAgeVerification is SepoliaConfig {
    // ...
}
```

---

## Troubleshooting

### "Permission Denied" Error

**Symptom**: Transaction fails with "FHE operation failed: No permission"

**Solutions**:
1. Check both permissions are granted:
   ```solidity
   FHE.allowThis(result);  // Don't forget this!
   FHE.allow(result, msg.sender);
   ```

2. Verify user is accessing their own data
3. Check contract is allowed to operate on value

### "Handle Expired" Error

**Symptom**: "Handle is no longer valid"

**Solutions**:
1. Generate fresh encryption for each transaction
2. Don't reuse handles across transactions
3. Use proper TypeScript SDK methods

### Gas Out of Memory

**Symptom**: "Out of gas" during FHE operation

**Solutions**:
1. Use smaller encrypted types (euint8 vs euint32)
2. Reduce number of operations per transaction
3. Batch operations efficiently

### Type Mismatch Errors

**Symptom**: "Cannot perform operation on different types"

**Solutions**:
1. Ensure both values are same type:
   ```solidity
   euint8 age = FHE.asEuint8(25);      // euint8
   euint8 threshold = FHE.asEuint8(18); // euint8
   FHE.ge(age, threshold);              // ✅ Same type
   ```

2. Don't mix types:
   ```solidity
   euint32 age32 = FHE.asEuint32(25);
   euint8 threshold8 = FHE.asEuint8(18);
   FHE.ge(age32, threshold8);  // ❌ Type mismatch!
   ```

### Test Timeout

**Symptom**: Tests take >30 seconds or timeout

**Solutions**:
1. Reduce number of operations per test
2. Use test fixtures for setup
3. Parallel test execution: `npm test -- --parallel`

---

## Resources

### Official Documentation
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [Solidity FHE Library](https://docs.zama.ai/fhevm/fundamentals/solidity_lib)

### Community
- [Discord](https://discord.com/invite/zama)
- [Forum](https://www.zama.ai/community)
- [GitHub Discussions](https://github.com/zama-ai/fhevm/discussions)

### Tools
- [Hardhat](https://hardhat.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Solidity Docs](https://docs.soliditylang.org/)

---

**Last Updated**: December 2025

Have a question not answered here? Ask on the Zama Discord or Community Forum!
