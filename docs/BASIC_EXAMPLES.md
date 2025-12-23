# Basic FHE Examples

This document provides an overview of all basic FHE examples included in the Privacy-Preserving Age Verification System.

## Quick Reference

| Example | File | Purpose | Key Concepts |
|---------|------|---------|--------------|
| FHE Counter | `FHECounter.sol` | Basic counter with FHE | increment, decrement, FHE.add, FHE.sub |
| Encrypt Single Value | `EncryptSingleValue.sol` | Store single encrypted value | encryption, permissions, FHE.asEuint32 |
| Encrypt Multiple Values | `EncryptMultipleValues.sol` | Store multiple different types | multiple euint types, struct with encrypted fields |
| User Decrypt | `UserDecryptSingleValue.sol` | User-side decryption flow | decryption requests, relayer pattern |
| Access Control | `AccessControlExample.sol` | Permission management | FHE.allowThis(), FHE.allow(), common mistakes |
| FHE Arithmetic | `FHEArithmetic.sol` | Arithmetic operations | add, sub, mul, chaining operations |
| FHE Comparison | `FHEComparison.sol` | Comparison operations | eq, ne, lt, le, gt, ge, range checking |
| Input Proof | `InputProofExample.sol` | Input proofs explained | proof validation, binding, common mistakes |

---

## Core Concepts Covered

### Encryption
- Converting plaintext to encrypted values
- Storing encrypted state on-chain
- Different encrypted types (euint8, euint32, etc.)

### Permissions
- `FHE.allowThis()` - Grant contract permission
- `FHE.allow()` - Grant user permission
- Why both are required
- Common permission mistakes

### Arithmetic
- FHE addition (encrypted + encrypted)
- FHE subtraction (encrypted - encrypted)
- FHE multiplication
- Chaining operations

### Comparisons
- Equality (eq, ne)
- Ordering (lt, le, gt, ge)
- Range checking
- Logical operations (and, or)

### Advanced Patterns
- Input proofs and validation
- User-initiated decryption
- Multi-party operations
- Access control

---

## Examples by Category

### Basic Operations

#### 1. FHE Counter
**File**: `contracts/basic/FHECounter.sol`

A simple counter that demonstrates:
- Storing encrypted state
- Performing FHE arithmetic (add, sub)
- Managing permissions correctly

**Key Functions**:
- `increment()` - Add encrypted value to counter
- `decrement()` - Subtract encrypted value from counter
- `reset()` - Set counter to zero
- `getCounter()` - Get encrypted counter value

---

### Encryption Examples

#### 2. Encrypt Single Value
**File**: `contracts/basic/EncryptSingleValue.sol`

Demonstrates how to:
- Encrypt a single value using FHE
- Store encrypted value on-chain
- Grant appropriate permissions
- Retrieve encrypted value

**Key Functions**:
- `storeValue()` - Store encrypted value
- `getValue()` - Get encrypted value
- `addToValue()` - Add to stored value
- `hasValue()` - Check if value exists

**Key Concepts**:
- Input proofs
- Permission management
- Encrypted state storage

#### 3. Encrypt Multiple Values
**File**: `contracts/basic/EncryptMultipleValues.sol`

Demonstrates:
- Storing multiple encrypted values simultaneously
- Using different encrypted types together
- Struct with encrypted fields
- Updating individual fields

**Key Functions**:
- `createProfile()` - Store multiple encrypted values
- `updateAge()` - Update single field
- `updateSalary()` - Update single field
- `getProfile()` - Get all encrypted values

**Key Concepts**:
- Multiple encrypted types (euint8, euint32)
- Complex data structures
- Individual field updates
- Multiple permission management

---

### Access Control

#### 4. Access Control Example
**File**: `contracts/basic/AccessControlExample.sol`

Demonstrates:
- Proper use of `FHE.allowThis()`
- Proper use of `FHE.allow()`
- Common mistakes
- Permission delegation

**Key Functions**:
- `storeData()` - Store encrypted data with permissions
- `grantAccess()` - Grant another user access
- `revokeAccess()` - Revoke access (partially)
- `incrementData()` - Operation using contract permission

**Key Concepts**:
- Both permissions required
- Permission delegation
- Access control limitations
- Anti-patterns

**Common Mistakes Shown**:
- Missing `FHE.allowThis()`
- Missing `FHE.allow()`
- Incorrect permission model

---

### Arithmetic Operations

#### 5. FHE Arithmetic
**File**: `contracts/basic/FHEArithmetic.sol`

Demonstrates:
- FHE addition and subtraction
- FHE multiplication
- Chaining operations
- Multi-party transfers

**Key Functions**:
- `addToBalance()` - Add encrypted amount
- `subtractFromBalance()` - Subtract encrypted amount
- `multiplyBalance()` - Multiply by plaintext factor
- `complexCalculation()` - Chain operations
- `transferEncrypted()` - Transfer between users

**Key Concepts**:
- Encrypted arithmetic
- Operation chaining
- Multi-party operations
- Underflow/overflow risks

---

### Comparison Operations

#### 6. FHE Comparison
**File**: `contracts/basic/FHEComparison.sol`

Demonstrates:
- Encrypted equality comparisons (eq, ne)
- Encrypted ordering comparisons (lt, le, gt, ge)
- Logical operations on comparisons
- Range checking

**Key Functions**:
- `isAgeEqual()` - Check equality
- `isAgeLessThan()` / `isAgeGreaterThan()` - Order comparisons
- `isAgeInRange()` - Range checking with FHE.and()
- `isAdult()` / `isSenior()` - Common comparisons

**Key Concepts**:
- Encrypted boolean results
- Cannot use in conditionals
- Logical combinations (and, or)
- Range checking patterns

**Anti-Patterns Shown**:
- Using encrypted booleans in if statements
- Attempting to cast ebool to bool
- Information leakage

---

### Input Proofs

#### 7. Input Proof Example
**File**: `contracts/basic/InputProofExample.sol`

Demonstrates:
- What input proofs are
- Why they're necessary
- How to use them correctly
- Common mistakes

**Key Functions**:
- `storeValueCorrectly()` - Proper proof validation
- `storeValueWithoutProof()` - Anti-pattern example

**Key Concepts**:
- Zero-knowledge proofs
- Binding to [contract, user]
- Proof validation
- Security implications

**Common Mistakes Shown**:
- Wrong order of parameters
- Using proof from different user
- Using proof from different contract
- Reusing proofs
- Invalid proof data

---

### Decryption

#### 8. User Decrypt Single Value
**File**: `contracts/basic/UserDecryptSingleValue.sol`

Demonstrates:
- Storing encrypted values on-chain
- User-initiated decryption requests
- Relayer-based decryption flow

**Key Functions**:
- `storeSecret()` - Store encrypted secret
- `requestDecryption()` - Request decryption
- `fulfillDecryption()` - Provide decrypted value

**Key Concepts**:
- Decryption requests
- Relayer pattern
- Off-chain decryption
- User permissions

---

## Learning Path

### Level 1: Basics
1. **FHE Counter** - Start here for basic FHE concepts
2. **Encrypt Single Value** - Learn how to store encrypted data
3. **Access Control** - Understand permission model

### Level 2: Intermediate
4. **Encrypt Multiple Values** - Handle complex data
5. **FHE Arithmetic** - Perform operations on encrypted data
6. **FHE Comparison** - Compare encrypted values

### Level 3: Advanced
7. **Input Proof** - Understand security model
8. **User Decrypt** - Implement decryption flow

---

## Common Patterns

### Pattern 1: Store and Retrieve
```solidity
// Store
euint32 value = FHE.asEuint32(input, proof);
FHE.allowThis(value);
FHE.allow(value, msg.sender);
storage[msg.sender] = value;

// Retrieve
return storage[msg.sender];
```

### Pattern 2: Encrypt and Compare
```solidity
// Compare
ebool result = FHE.eq(encryptedValue, FHE.asEuint32(target));

// Cannot use result in if statement
// Must return or store for off-chain processing
return result;
```

### Pattern 3: Multi-Party Operation
```solidity
// Get both users' values
euint32 userAValue = valueA[userA];
euint32 userBValue = valueB[userB];

// Perform operation
euint32 result = FHE.add(userAValue, userBValue);

// Grant permissions to both
FHE.allowThis(result);
FHE.allow(result, userA);
FHE.allow(result, userB);
```

### Pattern 4: Decryption Request
```solidity
// Store encrypted value
storage[user] = encryptedValue;

// User requests decryption
requestDecryption();

// Relayer decrypts off-chain and provides plaintext
fulfillDecryption(plaintextValue);
```

---

## Testing Each Example

### Compile All Examples
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Test Specific Example
```bash
npx hardhat test test/FHECounter.test.ts
```

---

## References

- **FHE Concepts**: See TECHNICAL_SPECIFICATIONS.md
- **Architecture**: See ARCHITECTURE.md
- **Troubleshooting**: See FAQ_AND_BEST_PRACTICES.md
- **API Reference**: See docs/ folder

---

## Next Steps

- Review TECHNICAL_SPECIFICATIONS.md for deeper understanding
- Read ARCHITECTURE.md to see how examples fit together
- Check FAQ_AND_BEST_PRACTICES.md for common issues
- Review test files to see example usage patterns

---

**Status**: Complete
**Last Updated**: 2025-12-24
