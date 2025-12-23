# VerifierRegistry

Manage authorized verifiers and permissions

## Overview

This contract provides privacy-preserving age verification using Fully Homomorphic Encryption (FHE).

**File**: `contracts/VerifierRegistry.sol`

## Functions

### `addVerifier()`

Manages authorized verifiers and their permissions
 *

### `removeVerifier()`

Remove a verifier's authorization
     *

### `deactivateVerifier()`

Deactivate a verifier temporarily
     *

### `reactivateVerifier()`

Reactivate a deactivated verifier
     *

### `isActiveVerifier()`

Check if an address is an active verifier
     *

### `getVerifierCount()`

Get total number of verifiers
     *

### `getVerifierAt()`

Get verifier address by index
     *

### `getAllVerifiers()`

Get all verifiers
     *

### `transferOwnership()`

Transfer ownership to a new owner
     *

## Security Considerations

- All age data is stored as encrypted values
- Comparisons are performed on encrypted data
- FHE permissions are properly managed
- Access control is enforced for sensitive operations

## Usage Example

```solidity
// Submit encrypted age
contract.submitEncryptedAge(25);

// Get verification result
ebool result = contract.getVerificationResult();
```

## References

- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [Test File](../test/VerifierRegistry.test.ts)
