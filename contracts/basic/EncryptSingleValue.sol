// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value
/// @notice Demonstrates how to encrypt and store a single value using FHE
/// @dev Key concepts:
/// - Converting plaintext to encrypted value
/// - Storing encrypted state
/// - Managing FHE permissions
/// - Input proofs and validation
contract EncryptSingleValue is SepoliaConfig {
    /// @notice Mapping of user addresses to their encrypted values
    mapping(address => euint32) private userValues;

    /// @notice Event emitted when a value is stored
    event ValueStored(address indexed user);

    /// @notice Store an encrypted value for the caller
    /// @param input The encrypted input value
    /// @param inputProof Zero-knowledge proof validating the encrypted input
    /// @dev This demonstrates the complete flow of encrypting and storing a value:
    /// 1. Client encrypts value using FHEVM client library
    /// 2. Client generates proof that encryption is valid
    /// 3. Contract validates proof and converts external to internal encrypted value
    /// 4. Contract stores the encrypted value
    /// 5. Contract grants appropriate permissions
    function storeValue(inEuint32 calldata input, bytes calldata inputProof) external {
        // Convert external encrypted input to internal encrypted value
        // This validates the input proof and binds the value to this contract
        euint32 encryptedValue = FHE.asEuint32(input, inputProof);

        // Store the encrypted value
        userValues[msg.sender] = encryptedValue;

        // Grant permissions
        // CRITICAL: Both permissions are required for proper FHE operation
        FHE.allowThis(encryptedValue);  // Contract needs permission to manipulate value
        FHE.allow(encryptedValue, msg.sender);  // User needs permission to decrypt value

        emit ValueStored(msg.sender);
    }

    /// @notice Get the encrypted value for the caller
    /// @return euint32 The encrypted value (still encrypted)
    /// @dev The returned value is encrypted. Only authorized parties can decrypt it.
    /// Users must have been granted permission via FHE.allow() to decrypt.
    function getValue() external view returns (euint32) {
        return userValues[msg.sender];
    }

    /// @notice Get the encrypted value for a specific user
    /// @param user The address to query
    /// @return euint32 The encrypted value for that user
    /// @dev Even though anyone can call this, only authorized parties can decrypt the result
    function getValueFor(address user) external view returns (euint32) {
        return userValues[user];
    }

    /// @notice Update an existing value by adding to it
    /// @param input Additional encrypted value to add
    /// @param inputProof Proof for the input value
    /// @dev Demonstrates FHE arithmetic on stored encrypted values
    function addToValue(inEuint32 calldata input, bytes calldata inputProof) external {
        euint32 additionalValue = FHE.asEuint32(input, inputProof);

        // Perform FHE addition
        euint32 newValue = FHE.add(userValues[msg.sender], additionalValue);

        // Update stored value
        userValues[msg.sender] = newValue;

        // Grant permissions for new value
        FHE.allowThis(newValue);
        FHE.allow(newValue, msg.sender);

        emit ValueStored(msg.sender);
    }

    /// @notice Check if caller has stored a value
    /// @return bool True if value exists (this is not encrypted)
    /// @dev Demonstrates that some operations can return plaintext boolean
    /// while keeping the actual value encrypted
    function hasValue() external view returns (bool) {
        // We can check if a value exists without revealing the value itself
        // This is safe because we're only revealing existence, not the value
        euint32 value = userValues[msg.sender];
        // Note: In a real implementation, you might want to track this separately
        // This is just for demonstration
        return true; // Simplified for example
    }
}
