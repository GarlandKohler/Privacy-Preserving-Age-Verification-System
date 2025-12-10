# Technical Specifications

Complete technical specifications for the privacy-preserving age verification system using Fully Homomorphic Encryption.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Contract Specifications](#contract-specifications)
3. [FHE Operations](#fhe-operations)
4. [Data Structures](#data-structures)
5. [Permission Model](#permission-model)
6. [Security Considerations](#security-considerations)
7. [Performance Metrics](#performance-metrics)
8. [Deployment Specifications](#deployment-specifications)

---

## System Architecture

### Overview

The system consists of the following layers:

```
┌─────────────────────────────────────┐
│   User Interface / Frontend         │
│   (Web3.js, Ethers.js, etc.)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Encryption Layer                  │
│   (Client-side FHE Encryption)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Blockchain Network                │
│   (Ethereum / Sepolia Testnet)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Smart Contracts                   │
│   (FHEVM-enabled Solidity)         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ PrivateAgeVerification (Core)   │ │
│ ├─────────────────────────────────┤ │
│ │ VerifierRegistry (Access Ctrl)  │ │
│ ├─────────────────────────────────┤ │
│ │ PermissionManager (FHE Perms)   │ │
│ ├─────────────────────────────────┤ │
│ │ AuditLog (History Tracking)     │ │
│ └─────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   FHE Computation Engine            │
│   (Zama FHEVM)                      │
└─────────────────────────────────────┘
```

### Component Interactions

```
User A                          User B
   │                              │
   ├─ Encrypt(age=25)             ├─ Encrypt(age=30)
   │         │                    │
   ▼         ▼────────────────────▼
   SubmitEncryptedAge()
   │
   ├─ FHE.asEuint8(25)
   ├─ FHE.ge(25, 18) → true
   ├─ FHE.allowThis(result)
   ├─ FHE.allow(result, user)
   │
   ├─ Store in: mapping(address => euint8) encryptedAge
   │
   └─ Contract maintains encrypted state
```

---

## Contract Specifications

### 1. PrivateAgeVerification Contract

#### Purpose
Main contract for age verification using encrypted data.

#### State Variables

| Variable | Type | Visibility | Purpose |
|----------|------|------------|---------|
| `owner` | `address` | `public` | Contract owner address |
| `totalVerifications` | `uint256` | `public` | Total verification count |
| `encryptedAges` | `mapping(address => euint8)` | `private` | User encrypted ages |
| `verificationResults` | `mapping(address => ebool)` | `private` | Encrypted verification results |
| `authorizedVerifiers` | `mapping(address => bool)` | `public` | Authorized verifier addresses |
| `verificationHistory` | `VerificationResult[]` | `private` | History of completed verifications |

#### Data Structures

```solidity
struct AgeVerification {
    euint8 encryptedAge;          // User's encrypted age
    bool isVerified;              // Whether age was submitted
    uint256 timestamp;            // Submission timestamp
    ebool isAdult;                // Encrypted adult status
    bool verificationCompleted;   // Whether verification is complete
}

struct VerificationResult {
    address user;                 // User address
    bool isAdult;                 // Adult status result
    uint256 timestamp;            // Verification timestamp
    bool success;                 // Whether verification succeeded
}
```

#### Key Functions

##### submitEncryptedAge

```solidity
/**
 * @notice Submit encrypted age for verification
 * @param _age User's age (unencrypted locally, encrypted on-chain)
 * @dev Age must be between 1 and 120
 * Emits AgeSubmitted event
 */
function submitEncryptedAge(uint8 _age) external
```

**Gas Estimate**: ~150,000 - 200,000 gas
**Conditions**:
- Age must be in valid range (1-120)
- User must not have previous verification
- Modifies state with encrypted value

##### getVerificationResult

```solidity
/**
 * @notice Get verification result for caller
 * @return Encrypted boolean indicating if user is adult (18+)
 * @dev Returns ebool - must be decrypted client-side
 */
function getVerificationResult() external view returns (ebool)
```

**Gas Estimate**: ~5,000 - 10,000 gas
**Note**: Returns encrypted value, not plaintext

##### verifyAgeRange

```solidity
/**
 * @notice Verify if user age falls within specified range
 * @param minAge Minimum age threshold
 * @param maxAge Maximum age threshold
 * @return Encrypted boolean indicating if age is in range
 */
function verifyAgeRange(uint8 minAge, uint8 maxAge) external returns (ebool)
```

**Gas Estimate**: ~300,000 - 400,000 gas
**Conditions**: User must have previously submitted age

##### compareAges

```solidity
/**
 * @notice Compare user's age with another user's age
 * @param otherUser Address of user to compare against
 * @return Encrypted boolean indicating if caller is older
 */
function compareAges(address otherUser) external returns (ebool)
```

**Gas Estimate**: ~200,000 - 300,000 gas
**Conditions**: Both users must have submitted ages

##### completeVerificationForUser

```solidity
/**
 * @notice Verifier-only function to complete verification
 * @param user User whose verification to complete
 * @param isAdult Whether user is adult
 * @dev Only authorized verifiers can call this
 */
function completeVerificationForUser(address user, bool isAdult) external onlyAuthorizedVerifier
```

**Gas Estimate**: ~100,000 - 150,000 gas

#### Events

| Event | Parameters | Purpose |
|-------|-----------|---------|
| `AgeSubmitted` | `address user, uint256 timestamp` | When age is submitted |
| `VerificationCompleted` | `address user, bool isAdult, uint256 timestamp` | When verification completes |
| `VerifierAdded` | `address verifier` | When verifier is added |
| `VerifierRemoved` | `address verifier` | When verifier is removed |
| `AgeVerificationRequested` | `address user, uint256 timestamp` | When verification is requested |

### 2. VerifierRegistry Contract

#### Purpose
Manage authorized verifiers and their permissions.

#### Key Functions

```solidity
function addAuthorizedVerifier(address verifier) external onlyOwner
function removeAuthorizedVerifier(address verifier) external onlyOwner
function isAuthorizedVerifier(address verifier) external view returns (bool)
function getAuthorizedVerifiers() external view returns (address[])
```

### 3. PermissionManager Contract

#### Purpose
Centralized management of FHE permission grants.

#### Key Functions

```solidity
function grantPermission(address user, euint8 encryptedValue) internal
function revokePermission(address user, euint8 encryptedValue) internal
function hasPermission(address user, euint8 encryptedValue) external view returns (bool)
```

---

## FHE Operations

### Supported Types

```solidity
// Integer types
euint8      // 8-bit encrypted unsigned integer
euint16     // 16-bit encrypted unsigned integer
euint32     // 32-bit encrypted unsigned integer
euint64     // 64-bit encrypted unsigned integer

// Boolean type
ebool       // Encrypted boolean

// Conversion functions
FHE.asEuint8(uint8)    // Convert uint8 to euint8
FHE.asEuint32(uint32)  // Convert uint32 to euint32
FHE.asEbool(bool)      // Convert bool to ebool
```

### Comparison Operations

| Operation | Function | Returns | Example |
|-----------|----------|---------|---------|
| Greater than | `FHE.gt(a, b)` | `ebool` | `FHE.gt(age, 18)` |
| Greater or equal | `FHE.ge(a, b)` | `ebool` | `FHE.ge(age, 18)` |
| Less than | `FHE.lt(a, b)` | `ebool` | `FHE.lt(age, 65)` |
| Less or equal | `FHE.le(a, b)` | `ebool` | `FHE.le(age, 65)` |
| Equal | `FHE.eq(a, b)` | `ebool` | `FHE.eq(age, 21)` |
| Not equal | `FHE.ne(a, b)` | `ebool` | `FHE.ne(age, 18)` |

**Gas Costs**: 150,000 - 200,000 per operation

### Logical Operations

| Operation | Function | Input Types | Output |
|-----------|----------|------------|--------|
| AND | `FHE.and(a, b)` | `ebool, ebool` | `ebool` |
| OR | `FHE.or(a, b)` | `ebool, ebool` | `ebool` |
| NOT | `FHE.not(a)` | `ebool` | `ebool` |
| XNOR | `FHE.xnor(a, b)` | `ebool, ebool` | `ebool` |

**Gas Costs**: 100,000 - 150,000 per operation

### Arithmetic Operations (Limited)

```solidity
// Addition
euint8 result = FHE.add(age1, age2);    // ~200,000 gas

// Subtraction
euint8 result = FHE.sub(age1, age2);    // ~200,000 gas

// Note: Multiplication is not available in current FHEVM
// Note: Division is not available in current FHEVM
```

### Permission Grants

```solidity
// Grant contract permission
FHE.allowThis(encryptedValue);

// Grant user permission
FHE.allow(encryptedValue, msg.sender);

// Grant temporary permission (transient storage)
FHE.allowTransient(encryptedValue);
```

**Important**: Must call both `allowThis()` and `allow()` for operations to succeed!

---

## Data Structures

### AgeVerification Structure

```solidity
struct AgeVerification {
    euint8 encryptedAge;              // Encrypted age value
    bool isVerified;                  // Has user submitted age?
    uint256 timestamp;                // Block timestamp of submission
    ebool isAdult;                    // Encrypted adult status
    bool verificationCompleted;       // Has verification been completed?
}
```

**Size**: ~164 bytes (encrypted values are handles + state)
**Storage**: One per user in mapping

### VerificationResult Structure

```solidity
struct VerificationResult {
    address user;                     // User address (20 bytes)
    bool isAdult;                     // Adult status (1 byte)
    uint256 timestamp;                // Timestamp (32 bytes)
    bool success;                     // Success flag (1 byte)
}
```

**Size**: ~64 bytes per result
**Storage**: Array - grows with each verification

---

## Permission Model

### Permission Hierarchy

```
Owner (Can do everything)
    ├─ Manage Verifiers
    ├─ Pause/Unpause Contract
    └─ Reset User Verifications

Authorized Verifier
    ├─ View Verification History
    ├─ Complete Verifications
    └─ Cannot modify contracts

Regular User
    ├─ Submit Encrypted Age
    ├─ Request Verification
    ├─ View Own Results
    └─ Cannot access others' data
```

### FHE Permission Model

```
// ✅ CORRECT: Both permissions needed
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, userAddr);  // User permission

// ❌ INCORRECT: Missing allowThis
FHE.allow(encryptedValue, userAddr);  // Will fail!

// ❌ INCORRECT: Transient only
FHE.allowTransient(encryptedValue);   // Only temporary
```

---

## Security Considerations

### Threat Model

#### Threat 1: Unauthorized Age Access
**Attack**: User tries to access another user's encrypted age
**Mitigation**: FHE encryption + permission checks
**Implementation**:
```solidity
euint8 age = encryptedAges[user];
// Only contract can access - FHE prevents decryption
```

#### Threat 2: Permission Bypass
**Attack**: Attacker calls operation without permissions
**Mitigation**: Check FHE permission status before operation
**Implementation**:
```solidity
require(FHE.hasPermission(encryptedValue), "No permission");
ebool result = FHE.ge(encryptedValue, threshold);
```

#### Threat 3: Re-entrance Attack
**Attack**: Verify same user multiple times in same transaction
**Mitigation**: State changes before external calls
**Implementation**: Already handled by Solidity compiler

#### Threat 4: Input Validation Bypass
**Attack**: Submit invalid age (< 1 or > 120)
**Mitigation**: Explicit range checking
**Implementation**:
```solidity
require(_age >= 1 && _age <= 120, "Invalid age range");
```

### Security Best Practices

1. **Always Grant Both Permissions**
   ```solidity
   FHE.allowThis(result);
   FHE.allow(result, user);
   ```

2. **Validate All Inputs**
   ```solidity
   require(age >= 1 && age <= 120, "Invalid range");
   require(minAge <= maxAge, "Invalid range");
   ```

3. **Restrict Sensitive Functions**
   ```solidity
   function resetVerification(address user) external onlyOwner {
       // Sensitive operation
   }
   ```

4. **Immutable Data**
   - Encrypted values cannot be decrypted by anyone
   - Results are immutable once encrypted
   - Audit trail provides accountability

---

## Performance Metrics

### Gas Costs Estimation

| Operation | Min Gas | Max Gas | Avg Gas |
|-----------|---------|---------|---------|
| submitEncryptedAge | 150,000 | 200,000 | 175,000 |
| getVerificationResult | 5,000 | 10,000 | 7,500 |
| verifyAgeRange | 300,000 | 400,000 | 350,000 |
| compareAges | 200,000 | 300,000 | 250,000 |
| completeVerificationForUser | 100,000 | 150,000 | 125,000 |
| addAuthorizedVerifier | 50,000 | 100,000 | 75,000 |

### Throughput

- **Transactions Per Block**: ~10-15 verifications (Ethereum L1)
- **Average Block Time**: 12 seconds
- **Throughput**: ~1.25 verifications/second (theoretical)

### Optimization Tips

1. **Batch Operations**: Process multiple users in one transaction
2. **Use Minimal Types**: `euint8` faster than `euint32`
3. **Cache Results**: Store frequently used results
4. **Efficient Permissions**: Reuse permission grants where possible

---

## Deployment Specifications

### Network Requirements

#### Sepolia Testnet (Recommended)
```
Network: Sepolia
Chain ID: 11155111
RPC: https://rpc.sepolia.dev/
Faucet: https://sepolia.etherscan.io/
Gas Token: ETH
```

#### Other Networks
- **Ethereum Mainnet**: Not recommended (testing only)
- **Hardhat Local**: Supported with FHEVM plugin
- **Other L2s**: Check FHEVM compatibility

### Deployment Parameters

```solidity
// Constructor
constructor() {
    owner = msg.sender;
    authorizedVerifiers[msg.sender] = true;
    totalVerifications = 0;
}
```

### Contract Initialization

After deployment:

1. **Add Verifiers**
   ```solidity
   addAuthorizedVerifier(verifierAddress1);
   addAuthorizedVerifier(verifierAddress2);
   ```

2. **Configure Emergency Pause** (optional)
   ```solidity
   // Emergency pause is available if needed
   emergencyPause();
   ```

3. **Verify Deployment**
   ```bash
   npx hardhat verify --network sepolia <contract_address>
   ```

### Upgrade Path

If using proxy pattern:

```solidity
// Using OpenZeppelin Upgradeable
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PrivateAgeVerification is UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}
```

---

## API Response Formats

### Encrypted Value Response

```typescript
interface EncryptedResult {
    type: "euint8" | "euint32" | "ebool";
    handle: string;  // Encrypted value handle
    proof: string;   // Associated zero-knowledge proof
}
```

### Verification Response

```typescript
interface VerificationResponse {
    user: string;
    isVerified: boolean;
    timestamp: number;
    encryptedResult: EncryptedResult;
}
```

### Verification History

```typescript
interface VerificationHistoryEntry {
    user: string;
    isAdult: boolean;
    timestamp: number;
    success: boolean;
    txHash: string;
}
```

---

## Type System Reference

### Solidity Type Mapping

| Solidity Type | FHE Type | Bit Width | Use Case |
|---------------|----------|-----------|----------|
| `uint8` | `euint8` | 8 bits | Age values (0-255) |
| `uint16` | `euint16` | 16 bits | Larger values |
| `uint32` | `euint32` | 32 bits | Timestamp operations |
| `bool` | `ebool` | 1 bit | Verification results |

### Type Compatibility

```solidity
// ✅ CORRECT: Compatible types
euint8 age = FHE.asEuint8(25);
ebool result = FHE.ge(age, FHE.asEuint8(18));

// ❌ INCORRECT: Incompatible types
euint32 age = FHE.asEuint32(25);
ebool result = FHE.ge(age, FHE.asEuint8(18));  // Type mismatch!

// ✅ CORRECT: Type conversion
euint8 age8 = FHE.asEuint8(25);
euint32 age32 = FHE.asEuint32(25);
// Then use separately, not mixed
```

---

## Compliance & Standards

### ERC-Compatible (Where Applicable)
- Follows Solidity best practices
- Implements proper access control
- Emits events for state changes
- Includes error messages

### FHE Standards
- Uses Zama FHEVM library (v0.9.1+)
- Implements standard permission model
- Follows FHE operation guidelines
- Supports future FHEVM upgrades

---

## References

- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [Solidity FHE Library](https://docs.zama.ai/fhevm/fundamentals/solidity_lib)
- [Input Proofs & Encryption](https://docs.zama.ai/fhevm/fundamentals/input_proofs)
- [Permission Model](https://docs.zama.ai/fhevm/fundamentals/access_control)

---

**Last Updated**: December 2025
**Version**: 1.0
