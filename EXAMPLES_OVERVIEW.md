# Examples Overview

This document provides a comprehensive overview of all examples included in the Privacy-Preserving Age Verification System.

## Project Examples

### 1. Core Age Verification Examples

These examples focus on the main use case: privacy-preserving age verification.

#### PrivateAgeVerification
- **Type**: Core Application
- **File**: `contracts/PrivateAgeVerification.sol`
- **Purpose**: Complete age verification system
- **Key Features**:
  - Encrypted age submission
  - Verification result computation
  - Age comparisons
  - Verifier management
- **Functions**: 12
- **Lines**: 252

#### VerifierRegistry
- **Type**: Access Control
- **File**: `contracts/VerifierRegistry.sol`
- **Purpose**: Manage authorized verifiers
- **Key Features**:
  - Verifier authorization
  - Role-based permissions
  - Activation/deactivation
- **Functions**: 10
- **Lines**: 147

#### AgeRangeVerification
- **Type**: Range Checking
- **File**: `contracts/AgeRangeVerification.sol`
- **Purpose**: Verify ages within ranges
- **Key Features**:
  - Custom age range creation
  - Multi-range checking
  - Range management
- **Functions**: 10
- **Lines**: 187

#### MultiPartyVerification
- **Type**: Comparisons
- **File**: `contracts/MultiPartyVerification.sol`
- **Purpose**: Compare ages between users
- **Key Features**:
  - Age comparisons
  - Equality checking
  - Threshold comparisons
- **Functions**: 11
- **Lines**: 181

#### AuditedVerification
- **Type**: Audit Trails
- **File**: `contracts/AuditedVerification.sol`
- **Purpose**: Age verification with auditing
- **Key Features**:
  - Complete action logging
  - Auditor management
  - History tracking
- **Functions**: 11
- **Lines**: 229

### 2. Basic FHE Examples

These examples demonstrate fundamental FHE concepts.

#### FHE Counter
- **Type**: Basic Operations
- **File**: `contracts/basic/FHECounter.sol`
- **Demonstrates**:
  - Encrypted state
  - FHE.add() and FHE.sub()
  - Permission management
- **Functions**: 5

#### Encrypt Single Value
- **Type**: Encryption
- **File**: `contracts/basic/EncryptSingleValue.sol`
- **Demonstrates**:
  - Encrypting values
  - Storing encrypted state
  - Single encrypted field
  - FHE.asEuint32()
- **Functions**: 5

#### Encrypt Multiple Values
- **Type**: Encryption
- **File**: `contracts/basic/EncryptMultipleValues.sol`
- **Demonstrates**:
  - Multiple encrypted values
  - Different encrypted types
  - Struct with encrypted fields
  - Individual field updates
- **Functions**: 6

#### User Decrypt Single Value
- **Type**: Decryption
- **File**: `contracts/basic/UserDecryptSingleValue.sol`
- **Demonstrates**:
  - User-initiated decryption
  - Decryption requests
  - Relayer pattern
  - Decryption fulfillment
- **Functions**: 6

#### Access Control Example
- **Type**: Permissions
- **File**: `contracts/basic/AccessControlExample.sol`
- **Demonstrates**:
  - FHE.allowThis()
  - FHE.allow()
  - Permission delegation
  - Common mistakes
- **Functions**: 8

#### FHE Arithmetic
- **Type**: Operations
- **File**: `contracts/basic/FHEArithmetic.sol`
- **Demonstrates**:
  - FHE.add()
  - FHE.sub()
  - FHE.mul()
  - Chaining operations
  - Multi-party transfers
- **Functions**: 7

#### FHE Comparison
- **Type**: Operations
- **File**: `contracts/basic/FHEComparison.sol`
- **Demonstrates**:
  - FHE.eq(), FHE.ne()
  - FHE.lt(), FHE.le()
  - FHE.gt(), FHE.ge()
  - FHE.and(), FHE.or()
  - Range checking
  - Anti-patterns
- **Functions**: 12

#### Input Proof Example
- **Type**: Security
- **File**: `contracts/basic/InputProofExample.sol`
- **Demonstrates**:
  - Input proofs
  - Proof validation
  - [contract, user] binding
  - Common mistakes
  - Best practices
- **Functions**: 5

## Examples Summary

### By Category

**Core Application** (5 contracts)
- PrivateAgeVerification
- VerifierRegistry
- AgeRangeVerification
- MultiPartyVerification
- AuditedVerification

**Basic Encryption** (2 contracts)
- EncryptSingleValue
- EncryptMultipleValues

**Decryption** (1 contract)
- UserDecryptSingleValue

**Operations** (3 contracts)
- FHECounter
- FHEArithmetic
- FHEComparison

**Security & Access Control** (2 contracts)
- AccessControlExample
- InputProofExample

### Total Statistics

| Metric | Count |
|--------|-------|
| Total Contracts | 13 |
| Total Functions | 94+ |
| Total Lines of Code | ~2000+ |
| Core Examples | 5 |
| Basic Examples | 8 |

## FHE Concepts Coverage

### Encryption
- ✅ Single value encryption
- ✅ Multiple value encryption
- ✅ Different data types
- ✅ Complex data structures

### Permissions
- ✅ FHE.allowThis()
- ✅ FHE.allow()
- ✅ Permission delegation
- ✅ Common mistakes

### Arithmetic
- ✅ Addition (FHE.add)
- ✅ Subtraction (FHE.sub)
- ✅ Multiplication (FHE.mul)
- ✅ Chaining operations

### Comparisons
- ✅ Equality (eq, ne)
- ✅ Ordering (lt, le, gt, ge)
- ✅ Logical (and, or, not)
- ✅ Range checking

### Advanced
- ✅ Input proofs
- ✅ User decryption
- ✅ Multi-party operations
- ✅ Access control
- ✅ Audit trails

## Documentation per Example

### Core Examples
- Full documentation in main `docs/` folder
- Auto-generated API reference
- Architecture documentation
- Technical specifications

### Basic Examples
- Detailed comments in code
- See `docs/BASIC_EXAMPLES.md` for overview
- Anti-patterns documented in code
- Best practices highlighted

## How to Use These Examples

### 1. Learning
Start with basic examples in order:
1. FHE Counter
2. Encrypt Single Value
3. Access Control Example
4. FHE Arithmetic
5. FHE Comparison

### 2. Integration
For integrating into your project:
1. Copy `EncryptSingleValue` pattern
2. Add your specific logic
3. Follow `AccessControlExample` for permissions
4. Use `FHEArithmetic` for operations

### 3. Extending
To create new examples:
1. See `DEVELOPMENT_GUIDE.md`
2. Follow patterns in existing examples
3. Use `MAINTENANCE_GUIDE.md` for structure
4. Update scripts to include new example

## Testing

All examples include:
- Unit tests showing correct usage
- Error case tests
- Edge case tests
- Common pitfall examples

### Run All Tests
```bash
npm test
```

### Run Specific Example Tests
```bash
npm test test/FHECounter.test.ts
```

## Deployment

Each example can be deployed standalone:

### Deploy Specific Contract
```bash
npx hardhat run scripts/deploy.ts -- --contract FHECounter
```

### Deploy All
```bash
npm run deploy:localhost
npm run deploy:sepolia
```

## Creating Standalone Examples

Generate standalone repositories from examples:

```bash
# Generate FHE Counter standalone
npm run create-example fhe-counter ./output/fhe-counter

# Generate Access Control standalone
npm run create-example access-control-example ./output/access-control
```

## Documentation Structure

```
docs/
├── BASIC_EXAMPLES.md              # This file overview
├── SUMMARY.md                     # GitBook index
├── INDEX.md                       # API reference
├── PrivateAgeVerification.md      # Core example
├── VerifierRegistry.md            # Core example
├── AgeRangeVerification.md        # Core example
├── MultiPartyVerification.md      # Core example
└── AuditedVerification.md         # Core example

Root documentation:
├── EXAMPLES_OVERVIEW.md           # This file
├── README.md                      # Main documentation
├── TECHNICAL_SPECIFICATIONS.md    # Detailed specs
├── ARCHITECTURE.md                # System design
└── DEVELOPMENT_GUIDE.md           # How to extend
```

## References

- **Individual Example Docs**: See `docs/BASIC_EXAMPLES.md`
- **API Reference**: See `docs/INDEX.md`
- **System Architecture**: See `ARCHITECTURE.md`
- **Development Guide**: See `DEVELOPMENT_GUIDE.md`
- **Maintenance Guide**: See `MAINTENANCE_GUIDE.md`

---

**Status**: Complete
**Last Updated**: 2025-12-24
**Total Examples**: 13 contracts demonstrating all major FHE concepts
