// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Counter
/// @notice A simple encrypted counter demonstrating basic FHE operations
/// @dev This contract shows how to:
/// - Store encrypted state (euint32)
/// - Perform FHE arithmetic (add, sub)
/// - Manage FHE permissions (allowThis, allow)
/// - Handle encrypted inputs with proofs
contract FHECounter is SepoliaConfig {
    /// @notice The encrypted counter value
    euint32 private counter;

    /// @notice Event emitted when counter is incremented
    event Incremented(address indexed user);

    /// @notice Event emitted when counter is decremented
    event Decremented(address indexed user);

    /// @notice Get the encrypted counter value
    /// @return euint32 The encrypted counter (can only be decrypted with proper permissions)
    /// @dev The returned value is still encrypted. Users need FHE permissions to decrypt it.
    function getCounter() external view returns (euint32) {
        return counter;
    }

    /// @notice Increment the counter by an encrypted value
    /// @param input The encrypted input value
    /// @param inputProof Zero-knowledge proof that the input is properly encrypted
    /// @dev This demonstrates:
    /// - Converting external encrypted input to internal encrypted value
    /// - FHE addition operation
    /// - Granting permissions to both contract and user
    function increment(inEuint32 calldata input, bytes calldata inputProof) external {
        // Convert external encrypted input to internal encrypted value
        euint32 value = FHE.asEuint32(input, inputProof);

        // Perform FHE addition
        counter = FHE.add(counter, value);

        // Grant permissions
        // IMPORTANT: Both allowThis and allow are required
        FHE.allowThis(counter);  // Allow contract to use the value
        FHE.allow(counter, msg.sender);  // Allow user to decrypt the value

        emit Incremented(msg.sender);
    }

    /// @notice Decrement the counter by an encrypted value
    /// @param input The encrypted input value
    /// @param inputProof Zero-knowledge proof that the input is properly encrypted
    /// @dev This example omits underflow checks for simplicity
    /// In production, add proper range validation
    function decrement(inEuint32 calldata input, bytes calldata inputProof) external {
        euint32 value = FHE.asEuint32(input, inputProof);

        // Perform FHE subtraction
        counter = FHE.sub(counter, value);

        // Grant permissions
        FHE.allowThis(counter);
        FHE.allow(counter, msg.sender);

        emit Decremented(msg.sender);
    }

    /// @notice Reset counter to zero
    /// @dev Demonstrates creating encrypted zero value
    function reset() external {
        counter = FHE.asEuint32(0);

        FHE.allowThis(counter);
        FHE.allow(counter, msg.sender);
    }
}
