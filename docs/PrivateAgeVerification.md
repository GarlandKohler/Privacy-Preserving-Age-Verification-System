# PrivateAgeVerification

Core age verification contract using FHE

## Overview

This contract provides privacy-preserving age verification using Fully Homomorphic Encryption (FHE).

**File**: `contracts/PrivateAgeVerification.sol`

## Functions

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
- [Test File](../test/PrivateAgeVerification.test.ts)
