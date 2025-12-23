// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Access Control Example
/// @notice Demonstrates FHE access control using FHE.allowThis() and FHE.allow()
/// @dev Key concepts:
/// - FHE.allowThis() - Grant contract permission to use encrypted values
/// - FHE.allow() - Grant specific user permission to decrypt values
/// - Why both permissions are critical
/// - Common mistakes with access control
contract AccessControlExample is SepoliaConfig {
    /// @notice Stores encrypted sensitive data
    mapping(address => euint32) private sensitiveData;

    /// @notice Tracks who can access each user's data
    mapping(address => mapping(address => bool)) private accessGrants;

    /// @notice Event emitted when data is stored
    event DataStored(address indexed owner);

    /// @notice Event emitted when access is granted
    event AccessGranted(address indexed owner, address indexed grantee);

    /// @notice Store encrypted sensitive data
    /// @param input Encrypted data
    /// @param inputProof Proof for the input
    /// @dev Demonstrates proper FHE permission management
    function storeData(inEuint32 calldata input, bytes calldata inputProof) external {
        euint32 encryptedData = FHE.asEuint32(input, inputProof);

        sensitiveData[msg.sender] = encryptedData;

        // CRITICAL: Both permissions are required
        // Without FHE.allowThis(), the contract cannot use the value in operations
        FHE.allowThis(encryptedData);

        // Without FHE.allow(), the user cannot decrypt the value
        FHE.allow(encryptedData, msg.sender);

        emit DataStored(msg.sender);
    }

    /// @notice Get encrypted data (owner only)
    /// @return euint32 The encrypted data
    /// @dev Only the owner should be able to read this
    function getData() external view returns (euint32) {
        return sensitiveData[msg.sender];
    }

    /// @notice Grant another user access to your encrypted data
    /// @param grantee The address to grant access to
    /// @dev Demonstrates granting access to other users
    /// WARNING: This is simplified. In production, you'd need more sophisticated access control
    function grantAccess(address grantee) external {
        require(grantee != address(0), "Invalid grantee");
        require(grantee != msg.sender, "Cannot grant access to yourself");

        accessGrants[msg.sender][grantee] = true;

        // Grant permission to the grantee
        FHE.allow(sensitiveData[msg.sender], grantee);

        emit AccessGranted(msg.sender, grantee);
    }

    /// @notice Revoke access for a user
    /// @param grantee The address to revoke access from
    /// @dev NOTE: In production, you cannot fully revoke FHE.allow() permissions
    /// This is a limitation of current FHE implementations
    /// For now, we only track revocation in our mapping
    function revokeAccess(address grantee) external {
        require(grantee != address(0), "Invalid grantee");

        accessGrants[msg.sender][grantee] = false;

        // NOTE: We cannot revoke FHE.allow() at the moment
        // This is a known limitation of current FHE implementations
        // See: Understanding Handles and Permissions documentation
    }

    /// @notice Check if an address has access to user's data
    /// @param owner The data owner
    /// @param grantee The address to check
    /// @return bool True if access is granted
    function hasAccess(address owner, address grantee) external view returns (bool) {
        return accessGrants[owner][grantee] || owner == grantee;
    }

    /// @notice Perform operation on stored data
    /// @param increment Plaintext value to add
    /// @return euint32 Result of operation (encrypted)
    /// @dev Demonstrates that the contract can perform operations
    /// thanks to FHE.allowThis() permission
    function incrementData(uint32 increment) external view returns (euint32) {
        // This operation is possible because we granted FHE.allowThis()
        // Without it, this would fail with "FHE permission denied"
        return FHE.add(sensitiveData[msg.sender], FHE.asEuint32(increment));
    }

    /// @notice Example showing common mistake: missing FHE.allowThis()
    /// @param input Encrypted input
    /// @param inputProof Proof for input
    /// @dev ❌ ANTI-PATTERN: This would fail if FHE.allowThis() is not called
    /// Uncomment to see the failure case
    function BAD_storeDataWithoutAllowThis(
        inEuint32 calldata input,
        bytes calldata inputProof
    ) external {
        euint32 encryptedData = FHE.asEuint32(input, inputProof);

        sensitiveData[msg.sender] = encryptedData;

        // MISSING: FHE.allowThis(encryptedData);
        // This causes "FHE permission denied" errors when contract tries to use the value

        // We can only grant user permission, not contract permission
        FHE.allow(encryptedData, msg.sender);

        // ❌ Any operation on sensitiveData[msg.sender] will now fail
        // because the contract doesn't have permission to use it
    }

    /// @notice Example showing missing user permission
    /// @param input Encrypted input
    /// @param inputProof Proof for input
    /// @dev ❌ ANTI-PATTERN: User cannot decrypt without FHE.allow()
    function BAD_storeDataWithoutAllow(
        inEuint32 calldata input,
        bytes calldata inputProof
    ) external {
        euint32 encryptedData = FHE.asEuint32(input, inputProof);

        sensitiveData[msg.sender] = encryptedData;

        // Grant contract permission
        FHE.allowThis(encryptedData);

        // MISSING: FHE.allow(encryptedData, msg.sender);
        // This means the user cannot decrypt the value
        // Only the contract can manipulate it

        // ❌ User cannot decrypt sensitiveData[msg.sender]
        // because they don't have permission to read it
    }
}
