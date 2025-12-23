// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Single Value
/// @notice Demonstrates user-side decryption of encrypted values
/// @dev Key concepts:
/// - Storing encrypted values on-chain
/// - Users requesting their own decryption
/// - Relayer-based decryption flow
/// - Permission requirements for decryption
contract UserDecryptSingleValue is SepoliaConfig {
    /// @notice Stores an encrypted value for each user
    mapping(address => euint32) private encryptedSecrets;

    /// @notice Stores decryption requests from users
    struct DecryptionRequest {
        address user;
        uint256 timestamp;
        bool fulfilled;
    }

    /// @notice Array of pending decryption requests
    DecryptionRequest[] private decryptionRequests;

    /// @notice Event emitted when a value is stored
    event SecretStored(address indexed user);

    /// @notice Event emitted when decryption is requested
    event DecryptionRequested(address indexed user, uint256 requestId);

    /// @notice Event emitted when decryption is fulfilled
    event DecryptionFulfilled(address indexed user, uint256 plaintext);

    /// @notice Store an encrypted secret
    /// @param input Encrypted secret value
    /// @param inputProof Proof for the encrypted input
    /// @dev The secret is stored encrypted on-chain
    /// Only the owner can request its decryption
    function storeSecret(inEuint32 calldata input, bytes calldata inputProof) external {
        euint32 encryptedSecret = FHE.asEuint32(input, inputProof);

        encryptedSecrets[msg.sender] = encryptedSecret;

        // Grant permissions
        FHE.allowThis(encryptedSecret);
        FHE.allow(encryptedSecret, msg.sender);

        emit SecretStored(msg.sender);
    }

    /// @notice Get the encrypted secret
    /// @return euint32 The encrypted secret (still encrypted)
    /// @dev Only the owner can meaningfully read this
    /// The value can only be decrypted by the owner through the relayer
    function getEncryptedSecret() external view returns (euint32) {
        return encryptedSecrets[msg.sender];
    }

    /// @notice Request decryption of stored secret
    /// @return uint256 Request ID that can be used to track the decryption
    /// @dev This creates a request that the decryption relayer can fulfill
    /// The relayer will decrypt the value off-chain and provide it back to the user
    function requestDecryption() external returns (uint256) {
        require(encryptedSecrets[msg.sender] != euint32(0), "No secret stored");

        decryptionRequests.push(DecryptionRequest({
            user: msg.sender,
            timestamp: block.timestamp,
            fulfilled: false
        }));

        uint256 requestId = decryptionRequests.length - 1;
        emit DecryptionRequested(msg.sender, requestId);

        return requestId;
    }

    /// @notice Fulfill a decryption request with the plaintext value
    /// @param requestId The ID of the decryption request
    /// @param plaintext The decrypted plaintext value
    /// @dev In production, this would be called by a trusted relayer
    /// The relayer decrypts the value off-chain and provides the plaintext
    /// Only the relayer should be able to call this in production
    function fulfillDecryption(uint256 requestId, uint32 plaintext) external {
        require(requestId < decryptionRequests.length, "Invalid request ID");

        DecryptionRequest storage request = decryptionRequests[requestId];
        require(!request.fulfilled, "Request already fulfilled");
        require(msg.sender == request.user, "Only requester can receive decryption");

        request.fulfilled = true;

        emit DecryptionFulfilled(request.user, plaintext);
    }

    /// @notice Get the number of pending decryption requests
    /// @return uint256 Number of requests
    function getDecryptionRequestCount() external view returns (uint256) {
        return decryptionRequests.length;
    }

    /// @notice Get details of a specific decryption request
    /// @param requestId The ID of the request
    /// @return user The user who made the request
    /// @return timestamp When the request was made
    /// @return fulfilled Whether the request has been fulfilled
    function getDecryptionRequest(uint256 requestId) external view returns (
        address user,
        uint256 timestamp,
        bool fulfilled
    ) {
        require(requestId < decryptionRequests.length, "Invalid request ID");

        DecryptionRequest storage request = decryptionRequests[requestId];
        return (request.user, request.timestamp, request.fulfilled);
    }

    /// @notice Check if user has a stored secret
    /// @return bool True if user has stored a secret
    function hasSecret() external view returns (bool) {
        return encryptedSecrets[msg.sender] != euint32(0);
    }
}
