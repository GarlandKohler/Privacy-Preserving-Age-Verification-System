// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, inEuint8, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Multiple Values
/// @notice Demonstrates how to encrypt and manage multiple values of different types
/// @dev Key concepts:
/// - Handling multiple encrypted values simultaneously
/// - Different encrypted types (euint8, euint32)
/// - Batch permission management
/// - Struct with encrypted fields
contract EncryptMultipleValues is SepoliaConfig {
    /// @notice Structure containing multiple encrypted values
    /// @dev Demonstrates storing different encrypted types together
    struct EncryptedProfile {
        euint8 age;        // Encrypted 8-bit integer
        euint32 salary;    // Encrypted 32-bit integer
        euint32 score;     // Encrypted 32-bit integer
        bool initialized;  // Plaintext boolean for tracking
    }

    /// @notice Mapping of user addresses to their encrypted profiles
    mapping(address => EncryptedProfile) private profiles;

    /// @notice Event emitted when profile is created or updated
    event ProfileUpdated(address indexed user);

    /// @notice Create a profile with multiple encrypted values
    /// @param ageInput Encrypted age value
    /// @param ageProof Proof for age
    /// @param salaryInput Encrypted salary value
    /// @param salaryProof Proof for salary
    /// @param scoreInput Encrypted score value
    /// @param scoreProof Proof for score
    /// @dev Demonstrates handling multiple encrypted inputs in a single transaction
    function createProfile(
        inEuint8 calldata ageInput,
        bytes calldata ageProof,
        inEuint32 calldata salaryInput,
        bytes calldata salaryProof,
        inEuint32 calldata scoreInput,
        bytes calldata scoreProof
    ) external {
        // Convert all external encrypted inputs to internal encrypted values
        euint8 encryptedAge = FHE.asEuint8(ageInput, ageProof);
        euint32 encryptedSalary = FHE.asEuint32(salaryInput, salaryProof);
        euint32 encryptedScore = FHE.asEuint32(scoreInput, scoreProof);

        // Store all encrypted values
        profiles[msg.sender] = EncryptedProfile({
            age: encryptedAge,
            salary: encryptedSalary,
            score: encryptedScore,
            initialized: true
        });

        // Grant permissions for all encrypted values
        // IMPORTANT: Each encrypted value needs its own permissions
        FHE.allowThis(encryptedAge);
        FHE.allow(encryptedAge, msg.sender);

        FHE.allowThis(encryptedSalary);
        FHE.allow(encryptedSalary, msg.sender);

        FHE.allowThis(encryptedScore);
        FHE.allow(encryptedScore, msg.sender);

        emit ProfileUpdated(msg.sender);
    }

    /// @notice Update only the age field
    /// @param ageInput New encrypted age value
    /// @param ageProof Proof for the age
    /// @dev Shows how to update individual encrypted fields
    function updateAge(inEuint8 calldata ageInput, bytes calldata ageProof) external {
        require(profiles[msg.sender].initialized, "Profile not initialized");

        euint8 newAge = FHE.asEuint8(ageInput, ageProof);
        profiles[msg.sender].age = newAge;

        FHE.allowThis(newAge);
        FHE.allow(newAge, msg.sender);

        emit ProfileUpdated(msg.sender);
    }

    /// @notice Update only the salary field
    /// @param salaryInput New encrypted salary value
    /// @param salaryProof Proof for the salary
    function updateSalary(inEuint32 calldata salaryInput, bytes calldata salaryProof) external {
        require(profiles[msg.sender].initialized, "Profile not initialized");

        euint32 newSalary = FHE.asEuint32(salaryInput, salaryProof);
        profiles[msg.sender].salary = newSalary;

        FHE.allowThis(newSalary);
        FHE.allow(newSalary, msg.sender);

        emit ProfileUpdated(msg.sender);
    }

    /// @notice Get the encrypted age
    /// @return euint8 The encrypted age value
    function getAge() external view returns (euint8) {
        require(profiles[msg.sender].initialized, "Profile not initialized");
        return profiles[msg.sender].age;
    }

    /// @notice Get the encrypted salary
    /// @return euint32 The encrypted salary value
    function getSalary() external view returns (euint32) {
        require(profiles[msg.sender].initialized, "Profile not initialized");
        return profiles[msg.sender].salary;
    }

    /// @notice Get the encrypted score
    /// @return euint32 The encrypted score value
    function getScore() external view returns (euint32) {
        require(profiles[msg.sender].initialized, "Profile not initialized");
        return profiles[msg.sender].score;
    }

    /// @notice Get all encrypted values at once
    /// @return age The encrypted age
    /// @return salary The encrypted salary
    /// @return score The encrypted score
    /// @dev Demonstrates returning multiple encrypted values
    function getProfile() external view returns (
        euint8 age,
        euint32 salary,
        euint32 score
    ) {
        require(profiles[msg.sender].initialized, "Profile not initialized");

        EncryptedProfile storage profile = profiles[msg.sender];
        return (profile.age, profile.salary, profile.score);
    }

    /// @notice Calculate total score (salary + score)
    /// @return euint32 Encrypted sum of salary and score
    /// @dev Demonstrates FHE operations on multiple values
    function calculateTotalScore() external view returns (euint32) {
        require(profiles[msg.sender].initialized, "Profile not initialized");

        EncryptedProfile storage profile = profiles[msg.sender];

        // Perform FHE addition on two encrypted values
        return FHE.add(profile.salary, profile.score);
    }

    /// @notice Check if user has initialized profile
    /// @return bool True if profile exists
    function hasProfile() external view returns (bool) {
        return profiles[msg.sender].initialized;
    }
}
