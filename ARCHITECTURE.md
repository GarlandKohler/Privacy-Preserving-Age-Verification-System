# System Architecture

## Overview

The Privacy-Preserving Age Verification System is a comprehensive suite of smart contracts that demonstrates various patterns for privacy-preserving verification using Fully Homomorphic Encryption (FHE).

## Component Diagram

```
┌─────────────────────────────────────────────────────┐
│                  User Application                   │
│         (Web3 Frontend / DApp Interface)            │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │  Encryption Layer     │
         │  (Client-side FHE)    │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────────────────────────┐
         │      Ethereum / Sepolia Testnet           │
         └───────────┬───────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────┐   ┌──────────────┐   ┌─────────────┐
│ Private │   │  Verifier    │   │ Age Range   │
│  Age    │   │ Registry     │   │Verification │
│Verif.   │   └──────────────┘   └─────────────┘
└─────────┘
    │
    ├─────────────┬─────────────┐
    │             │             │
    ▼             ▼             ▼
┌───────────┐ ┌──────────┐ ┌─────────────┐
│ Multi-    │ │ Audited  │ │  FHE Ops    │
│ Party     │ │Verif.    │ │  (Core)     │
└───────────┘ └──────────┘ └─────────────┘
```

## Contract Descriptions

### 1. PrivateAgeVerification (Core)

**Purpose**: Core age verification using encrypted data

**Key Features**:
- Submit encrypted ages
- Verify adult status (18+)
- Support for age-based access control
- Verification history tracking
- Emergency pause functionality

**Functions**:
- `submitEncryptedAge()` - Submit encrypted age
- `getVerificationResult()` - Get verification result
- `verifyAgeRange()` - Check if age is in range
- `compareAges()` - Compare two users' ages
- `completeVerificationForUser()` - Complete verification
- `isUserAdult()` - Check adult status
- `getVerificationStats()` - Get statistics

### 2. VerifierRegistry

**Purpose**: Manage authorized verifiers and permissions

**Key Features**:
- Add/remove verifiers
- Activate/deactivate verifiers
- Verifier status checking
- Ownership management

**Functions**:
- `addVerifier()` - Add new verifier
- `removeVerifier()` - Remove verifier
- `deactivateVerifier()` - Temporarily disable
- `reactivateVerifier()` - Re-enable verifier
- `isActiveVerifier()` - Check status
- `getVerifierCount()` - Get total count

### 3. AgeRangeVerification

**Purpose**: Advanced range-based verification

**Key Features**:
- Create custom age ranges
- Check if age falls in range
- Multiple range verification
- Range management

**Functions**:
- `submitAge()` - Submit encrypted age
- `createAgeRange()` - Create new range
- `verifyAgeInRange()` - Check single range
- `verifyMultipleRanges()` - Check multiple ranges
- `getAgeRange()` - Get range details

### 4. MultiPartyVerification

**Purpose**: Multi-user age comparisons

**Key Features**:
- Compare ages between users
- Check age equality
- Compare against thresholds
- Submission tracking

**Functions**:
- `submitAge()` - Submit encrypted age
- `compareAges()` - Compare two users
- `compareAgesEqual()` - Check equality
- `isOlderThan()` - Compare with threshold
- `isYoungerThan()` - Reverse comparison
- `hasSubmittedAge()` - Check submission status

### 5. AuditedVerification

**Purpose**: Verification with complete audit trail

**Key Features**:
- Complete audit logging
- Auditor management
- Action tracking
- Audit history retrieval

**Functions**:
- `submitAgeForAudit()` - Submit with audit
- `addAuditor()` - Add auditor
- `removeAuditor()` - Remove auditor
- `getAuditLogsForUser()` - Get user logs
- `getCompleteAuditTrail()` - Get all logs

## Data Flow

### Age Submission Flow

```
User Input (Age)
        │
        ▼
Client-side Encryption (FHE)
        │
        ├─ Age encrypted as euint8
        ├─ Verification computed (ebool)
        └─ Input proof generated
        │
        ▼
Smart Contract
        │
        ├─ Verify input proof
        ├─ Store encrypted values
        ├─ Grant FHE permissions
        └─ Emit events
        │
        ▼
Blockchain
```

### Verification Flow

```
Comparison Request
        │
        ▼
Contract reads encrypted values
        │
        ▼
FHE operation performed
(comparison on encrypted data)
        │
        ▼
Result computed (ebool)
        │
        ├─ Permissions granted
        └─ Result returned encrypted
        │
        ▼
Client decrypts result
(only authorized user can decrypt)
```

## Permission Model

### FHE Permission Hierarchy

```
Contract Permission (allowThis)
├─ Grants contract to operate on value
└─ Required for internal operations

User Permission (allow)
├─ Grants user to access value
└─ Required for user decryption
```

**Important**: Both permissions must be granted!

```solidity
// ✅ CORRECT
FHE.allowThis(result);          // Contract permission
FHE.allow(result, msg.sender);  // User permission

// ❌ INCORRECT (Missing allowThis)
FHE.allow(result, msg.sender);
```

## Security Model

### Threat Protection

1. **Age Privacy**
   - Ages stored as encrypted values
   - Comparisons on encrypted data only
   - No plaintext exposure

2. **Authorization**
   - FHE permissions enforce access
   - Contract-level access control
   - User-specific permissions

3. **Audit Trail**
   - All operations logged
   - Immutable blockchain record
   - Verifier oversight capability

4. **Input Validation**
   - Age range checking (1-120)
   - Permission verification
   - Authorization enforcement

## Deployment Architecture

### Sepolia Testnet

```
User Wallet → RPC Provider → Sepolia Network
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
              Contracts                      Storage
              ├─ PrivateAgeVer.              ├─ Ages
              ├─ VerifierReg.                ├─ Results
              ├─ AgeRangeVer.                ├─ History
              ├─ MultiPartyVer.              └─ Audit Logs
              └─ AuditedVer.
```

## Data Structures

### AgeVerification Record

```solidity
struct AgeVerification {
    euint8 encryptedAge;      // Encrypted age value
    bool isVerified;          // Submission flag
    uint256 timestamp;        // When submitted
    ebool isAdult;           // Encrypted result
    bool verificationCompleted; // Verification status
}
```

### VerificationResult

```solidity
struct VerificationResult {
    address user;           // User address
    bool isAdult;          // Adult status
    uint256 timestamp;     // Verification time
    bool success;          // Operation success
}
```

### AuditLog

```solidity
struct AuditLog {
    address user;          // Affected user
    string action;         // Action performed
    uint256 timestamp;     // When occurred
    bytes32 actionHash;    // Hash of action
    address initiatedBy;   // Who initiated
}
```

## FHE Operations Used

### Comparison Operations

- `FHE.ge()` - Greater than or equal
- `FHE.le()` - Less than or equal
- `FHE.gt()` - Greater than
- `FHE.lt()` - Less than
- `FHE.eq()` - Equal to
- `FHE.ne()` - Not equal to

### Logical Operations

- `FHE.and()` - Logical AND
- `FHE.or()` - Logical OR
- `FHE.not()` - Logical NOT

### Type Conversions

- `FHE.asEuint8()` - Convert to euint8
- `FHE.asEuint32()` - Convert to euint32
- `FHE.asEbool()` - Convert to ebool

## Integration Points

### External Systems

1. **User Authentication**
   - Wallet connection (MetaMask, etc.)
   - Message signing
   - Account management

2. **Encryption Layer**
   - Client-side FHE encryption
   - Input proof generation
   - Result decryption

3. **Blockchain Explorer**
   - Etherscan verification
   - Transaction tracking
   - Contract interaction

## Scalability Considerations

### Current Limitations

- Single contract per user
- Sequential processing
- ~1-2 ops per second

### Future Optimizations

- Batched operations
- Contract upgrades via proxy
- Multi-contract coordination
- Off-chain computation

## Testing Strategy

### Test Coverage

1. **Unit Tests** (60%)
   - Individual function tests
   - Parameter validation
   - State changes

2. **Integration Tests** (30%)
   - Multi-contract flows
   - User workflows
   - Event emission

3. **Security Tests** (10%)
   - Permission enforcement
   - Boundary conditions
   - Edge cases

### Test Environments

- **Local Hardhat**: Fast development
- **Sepolia Testnet**: Real conditions
- **Mainnet Fork**: Production simulation

## Monitoring and Logging

### Events

All significant operations emit events:

- `AgeSubmitted`
- `VerificationCompleted`
- `VerifierAdded`
- `VerifierRemoved`
- `RangeVerified`
- `AuditLogCreated`

### Audit Trail

Complete history maintained for:
- All age submissions
- Verification completions
- Verifier changes
- Audit activities

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity FHE Library](https://docs.zama.ai/fhevm/fundamentals/solidity_lib)
- [Smart Contract Development](https://docs.soliditylang.org/)
