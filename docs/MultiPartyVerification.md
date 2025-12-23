# MultiPartyVerification

Compare and verify ages between multiple users

## Overview

This contract provides privacy-preserving age verification using Fully Homomorphic Encryption (FHE).

**File**: `contracts/MultiPartyVerification.sol`

## Functions

### `submitAge()`

Compare and verify ages between multiple parties
 *

### `compareAges()`

Compare caller's age with another user's age
     *

**Returns:**

isOlder Encrypted boolean - true if caller is older
     *

### `compareAgesEqual()`

Check if user's age equals a specific value (without revealing actual age)
     *

### `isOlderThan()`

Check if caller is older than a specific age
     *

### `isYoungerThan()`

Check if caller is younger than a specific age
     *

### `getComparison()`

Get a previous comparison result
     *

### `hasSubmittedAge()`

Check if a user has submitted their age
     *

### `getSubmissionTime()`

Get submission time for a user's age
     *

### `getTimeSinceSubmission()`

Get number of seconds since a user submitted their age
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
- [Test File](../test/MultiPartyVerification.test.ts)
