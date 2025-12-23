// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decrypt Single Value
/// @notice Demonstrates public decryption of encrypted values
/// @dev Key concepts:
/// - Storing encrypted values on-chain
/// - Revealing decrypted values publicly
/// - Use cases for public decryption
/// - When to use vs. user decryption
contract PublicDecryptSingleValue is SepoliaConfig {
    /// @notice Stores encrypted secret that will be publicly revealed
    mapping(address => euint32) private secrets;

    /// @notice Stores revealed plaintext values
    mapping(address => uint32) private revealedValues;

    /// @notice Maps encrypted to plaintext
    mapping(bytes32 => uint32) private encryptionMap;

    /// @notice Event emitted when value is revealed
    event ValueRevealed(address indexed user, uint32 value);

    /// @notice Store an encrypted secret
    /// @param input Encrypted secret
    /// @param inputProof Proof for the input
    /// @dev The secret is stored encrypted
    /// It can later be publicly revealed
    function storeSecret(inEuint32 calldata input, bytes calldata inputProof) external {
        euint32 encryptedSecret = FHE.asEuint32(input, inputProof);

        secrets[msg.sender] = encryptedSecret;

        FHE.allowThis(encryptedSecret);
        FHE.allow(encryptedSecret, msg.sender);
    }

    /// @notice Get encrypted secret
    /// @return euint32 The encrypted secret (still encrypted)
    function getEncryptedSecret() external view returns (euint32) {
        return secrets[msg.sender];
    }

    /// @notice Reveal secret publicly
    /// @param plaintext The plaintext value
    /// @dev Anyone can call this to reveal a value publicly
    /// Use case: Commit-reveal pattern where value is committed encrypted
    /// then revealed publicly later
    function revealSecret(uint32 plaintext) external {
        // Store the revealed value
        revealedValues[msg.sender] = plaintext;

        emit ValueRevealed(msg.sender, plaintext);
    }

    /// @notice Get publicly revealed value
    /// @return uint32 The plaintext value (anyone can read)
    function getRevealedValue() external view returns (uint32) {
        return revealedValues[msg.sender];
    }

    /// @notice Get revealed value for a specific user
    /// @param user The user to query
    /// @return uint32 The plaintext value for that user
    /// @dev Public decryption means anyone can see the value
    function getRevealedValueFor(address user) external view returns (uint32) {
        return revealedValues[user];
    }

    /// @notice Check if value has been revealed
    /// @return bool True if value has been revealed
    function isValueRevealed() external view returns (bool) {
        return revealedValues[msg.sender] != 0;
    }

    /// @notice Demonstrate public decryption use case: Auction
    /// @dev Example of when public decryption is appropriate
    /// After auction ends, all bids are revealed
    struct Bid {
        address bidder;
        euint32 amount;     // Encrypted during bidding
        uint32 revealedAmount; // Plaintext after reveal
    }

    Bid[] public bids;

    /// @notice Place encrypted bid
    /// @param amount Encrypted bid amount
    /// @param proof Proof for the amount
    /// @dev During bidding phase, amounts are encrypted
    function placeBid(inEuint32 calldata amount, bytes calldata proof) external {
        euint32 encryptedAmount = FHE.asEuint32(amount, proof);

        bids.push(Bid({
            bidder: msg.sender,
            amount: encryptedAmount,
            revealedAmount: 0
        }));

        FHE.allowThis(encryptedAmount);
        FHE.allow(encryptedAmount, msg.sender);
    }

    /// @notice Reveal all bids publicly
    /// @param bidIds Indices of bids to reveal
    /// @param plaintextValues Plaintext values for those bids
    /// @dev Called by auction manager after bidding phase ends
    /// Makes all bids public
    function revealBids(uint256[] calldata bidIds, uint32[] calldata plaintextValues) external {
        require(bidIds.length == plaintextValues.length, "Array length mismatch");

        for (uint i = 0; i < bidIds.length; i++) {
            require(bidIds[i] < bids.length, "Invalid bid ID");

            // Reveal the bid publicly
            bids[bidIds[i]].revealedAmount = plaintextValues[i];

            emit ValueRevealed(bids[bidIds[i]].bidder, plaintextValues[i]);
        }
    }

    /// @notice Get publicly revealed bid
    /// @param bidId The bid index
    /// @return bidder The bidder's address
    /// @return amount The publicly revealed amount
    function getRevealedBid(uint256 bidId) external view returns (address bidder, uint32 amount) {
        require(bidId < bids.length, "Invalid bid ID");

        Bid storage bid = bids[bidId];
        return (bid.bidder, bid.revealedAmount);
    }

    /// @notice Example: Public decryption vs. User decryption
    /// @dev When to use each approach:
    ///
    /// PUBLIC DECRYPTION:
    /// ✅ Use when value should be revealed to everyone
    /// ✅ Use in auctions (after bidding ends)
    /// ✅ Use in commit-reveal patterns
    /// ✅ Use in lotteries (revealing winning numbers)
    /// ✅ Use when transparency is desired
    /// ❌ Don't use for private/personal data
    ///
    /// USER DECRYPTION:
    /// ✅ Use when value is personal/private
    /// ✅ Use for sensitive financial data
    /// ✅ Use when only owner should decrypt
    /// ✅ Use for medical/personal records
    /// ❌ Don't use for data meant to be public
    function conceptComparison() external pure {
        // Documentation only
    }

    /// @notice Example use case tracking
    /// @dev Common use cases for public decryption:
    /// 1. Auctions - Sealed bids, then revealed
    /// 2. Lotteries - Numbers kept secret, then revealed
    /// 3. Commit-reveal - Commit hash, reveal value
    /// 4. Voting - Encrypted votes, revealed results
    /// 5. Games - Hidden moves, revealed after commitment
    function useCases() external pure {
        // Documentation only
    }
}
