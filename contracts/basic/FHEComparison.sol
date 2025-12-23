// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Comparison Operations
/// @notice Demonstrates comparison operations on encrypted values
/// @dev Key concepts:
/// - FHE.eq() - Encrypted equality comparison
/// - FHE.ne() - Encrypted inequality comparison
/// - FHE.lt() - Encrypted less than comparison
/// - FHE.le() - Encrypted less than or equal comparison
/// - FHE.gt() - Encrypted greater than comparison
/// - FHE.ge() - Encrypted greater than or equal comparison
/// - FHE.and(), FHE.or() - Logical operations on comparison results
contract FHEComparison is SepoliaConfig {
    /// @notice Stores encrypted age for each user
    mapping(address => euint32) private ages;

    /// @notice Event emitted when comparison is performed
    event ComparisonPerformed(address indexed user);

    /// @notice Store encrypted age
    /// @param input Encrypted age
    /// @param inputProof Proof for the age
    function storeAge(inEuint32 calldata input, bytes calldata inputProof) external {
        euint32 encryptedAge = FHE.asEuint32(input, inputProof);

        ages[msg.sender] = encryptedAge;

        FHE.allowThis(encryptedAge);
        FHE.allow(encryptedAge, msg.sender);
    }

    /// @notice Check if age equals target (encrypted)
    /// @param target Target age to compare against
    /// @return ebool Encrypted boolean: true if age == target
    /// @dev Result is encrypted, cannot be read in smart contract
    /// Can only be decrypted off-chain by user with permission
    function isAgeEqual(uint32 target) external view returns (ebool) {
        return FHE.eq(ages[msg.sender], FHE.asEuint32(target));
    }

    /// @notice Check if age is not equal to target
    /// @param target Target age
    /// @return ebool Encrypted boolean: true if age != target
    function isAgeNotEqual(uint32 target) external view returns (ebool) {
        return FHE.ne(ages[msg.sender], FHE.asEuint32(target));
    }

    /// @notice Check if age is less than target
    /// @param target Target age
    /// @return ebool Encrypted boolean: true if age < target
    function isAgeLessThan(uint32 target) external view returns (ebool) {
        return FHE.lt(ages[msg.sender], FHE.asEuint32(target));
    }

    /// @notice Check if age is less than or equal to target
    /// @param target Target age
    /// @return ebool Encrypted boolean: true if age <= target
    function isAgeLessThanOrEqual(uint32 target) external view returns (ebool) {
        return FHE.le(ages[msg.sender], FHE.asEuint32(target));
    }

    /// @notice Check if age is greater than target
    /// @param target Target age
    /// @return ebool Encrypted boolean: true if age > target
    function isAgeGreaterThan(uint32 target) external view returns (ebool) {
        return FHE.gt(ages[msg.sender], FHE.asEuint32(target));
    }

    /// @notice Check if age is greater than or equal to target
    /// @param target Target age
    /// @return ebool Encrypted boolean: true if age >= target
    function isAgeGreaterThanOrEqual(uint32 target) external view returns (ebool) {
        return FHE.ge(ages[msg.sender], FHE.asEuint32(target));
    }

    /// @notice Check if age is in a range [min, max]
    /// @param min Minimum age
    /// @param max Maximum age
    /// @return ebool Encrypted boolean: true if min <= age <= max
    /// @dev Demonstrates logical AND on comparison results
    function isAgeInRange(uint32 min, uint32 max) external view returns (ebool) {
        // Create encrypted comparison results
        ebool isAboveMin = FHE.ge(ages[msg.sender], FHE.asEuint32(min));
        ebool isBelowMax = FHE.le(ages[msg.sender], FHE.asEuint32(max));

        // Combine results with FHE.and() - both must be true
        return FHE.and(isAboveMin, isBelowMax);
    }

    /// @notice Check if age is outside a range
    /// @param min Minimum age
    /// @param max Maximum age
    /// @return ebool Encrypted boolean: true if age < min OR age > max
    /// @dev Demonstrates logical OR on comparison results
    function isAgeOutsideRange(uint32 min, uint32 max) external view returns (ebool) {
        ebool isBelowMin = FHE.lt(ages[msg.sender], FHE.asEuint32(min));
        ebool isAboveMax = FHE.gt(ages[msg.sender], FHE.asEuint32(max));

        return FHE.or(isBelowMin, isAboveMax);
    }

    /// @notice Check if user is adult (>= 18)
    /// @return ebool Encrypted boolean: true if age >= 18
    function isAdult() external view returns (ebool) {
        return FHE.ge(ages[msg.sender], FHE.asEuint32(18));
    }

    /// @notice Check if user is senior (>= 65)
    /// @return ebool Encrypted boolean: true if age >= 65
    function isSenior() external view returns (ebool) {
        return FHE.ge(ages[msg.sender], FHE.asEuint32(65));
    }

    /// @notice Check if user is young adult (18-35)
    /// @return ebool Encrypted boolean: true if 18 <= age <= 35
    function isYoungAdult() external view returns (ebool) {
        ebool isAtLeast18 = FHE.ge(ages[msg.sender], FHE.asEuint32(18));
        ebool isAtMost35 = FHE.le(ages[msg.sender], FHE.asEuint32(35));

        return FHE.and(isAtLeast18, isAtMost35);
    }

    /// @notice Compare two users' ages
    /// @param otherUser Other user's address
    /// @return ebool Encrypted boolean: true if caller's age > other's age
    /// @dev Demonstrates comparison between two users' encrypted values
    function isOlderThan(address otherUser) external view returns (ebool) {
        return FHE.gt(ages[msg.sender], ages[otherUser]);
    }

    /// @notice ❌ ANTI-PATTERN: Attempting to use encrypted boolean as plaintext
    /// This would fail because ebool cannot be directly converted to bool
    /// Encrypted results must stay encrypted until decrypted off-chain
    function BAD_useEncryptedBooleanAsPlaintext() external view returns (bool) {
        ebool result = FHE.eq(ages[msg.sender], FHE.asEuint32(21));

        // ❌ This does not compile or works incorrectly
        // Cannot cast ebool to bool directly
        // Encrypted comparisons cannot be used in conditional logic
        // return result; // Type error

        // Incorrect workaround that would leak information:
        return true; // Placeholder
    }

    /// @notice ❌ ANTI-PATTERN: Cannot use encrypted results in if statements
    /// @dev This code demonstrates what CANNOT be done with encrypted values
    function BAD_ifStatementWithEncryptedValue(inEuint32 calldata input, bytes calldata proof) external {
        euint32 encryptedAge = FHE.asEuint32(input, proof);
        ebool isAdult = FHE.ge(encryptedAge, FHE.asEuint32(18));

        // ❌ This does not work - cannot use encrypted boolean in if statement
        // if (isAdult) {
        //     // Cannot execute conditional logic based on encrypted value
        //     // This would leak information about the value
        // }

        // Encrypted comparisons must be returned or stored,
        // then decrypted off-chain for decision making
    }
}
