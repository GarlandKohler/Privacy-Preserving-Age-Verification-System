# AgeRangeVerification

Verify ages fall within specific ranges

## Overview

This contract provides privacy-preserving age verification using Fully Homomorphic Encryption (FHE).

**File**: `contracts/AgeRangeVerification.sol`

## Functions

### `submitAge()`

Verifies if a user's age falls within specific ranges
 *

### `createAgeRange()`

Create a new age range for verification
     *

### `verifyAgeInRange()`

Verify if user's age falls within a specific range
     *

**Returns:**

result Encrypted boolean indicating if age is in range
     *

### `verifyMultipleRanges()`

Verify against multiple ranges simultaneously
     *

### `getAgeRange()`

Get information about a specific age range
     *

### `getRangeCount()`

Get total number of age ranges
     *

### `getAllRanges()`

Get all age ranges
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
- [Test File](../test/AgeRangeVerification.test.ts)
