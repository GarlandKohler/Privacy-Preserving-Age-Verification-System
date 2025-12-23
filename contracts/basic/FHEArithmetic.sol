// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Arithmetic Operations
/// @notice Demonstrates arithmetic operations on encrypted values
/// @dev Key concepts:
/// - FHE.add() - Addition of encrypted values
/// - FHE.sub() - Subtraction of encrypted values
/// - FHE.mul() - Multiplication of encrypted values
/// - Combining multiple operations
/// - Overflow/underflow handling
contract FHEArithmetic is SepoliaConfig {
    /// @notice Stores encrypted balance for each user
    mapping(address => euint32) private balances;

    /// @notice Event emitted when balance changes
    event BalanceUpdated(address indexed user);

    /// @notice Initialize balance with encrypted value
    /// @param input Encrypted initial balance
    /// @param inputProof Proof for the input
    function initializeBalance(inEuint32 calldata input, bytes calldata inputProof) external {
        euint32 encryptedBalance = FHE.asEuint32(input, inputProof);

        balances[msg.sender] = encryptedBalance;

        FHE.allowThis(encryptedBalance);
        FHE.allow(encryptedBalance, msg.sender);

        emit BalanceUpdated(msg.sender);
    }

    /// @notice Get encrypted balance
    /// @return euint32 The encrypted balance
    function getBalance() external view returns (euint32) {
        return balances[msg.sender];
    }

    /// @notice Add to balance using encrypted addition
    /// @param amount Amount to add (encrypted)
    /// @param proof Proof for the amount
    /// @dev Demonstrates FHE.add() operation
    /// Result remains encrypted
    function addToBalance(inEuint32 calldata amount, bytes calldata proof) external {
        euint32 encryptedAmount = FHE.asEuint32(amount, proof);

        // FHE addition: encrypted + encrypted = encrypted
        euint32 newBalance = FHE.add(balances[msg.sender], encryptedAmount);

        balances[msg.sender] = newBalance;

        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);

        emit BalanceUpdated(msg.sender);
    }

    /// @notice Subtract from balance using encrypted subtraction
    /// @param amount Amount to subtract (encrypted)
    /// @param proof Proof for the amount
    /// @dev Demonstrates FHE.sub() operation
    /// WARNING: No overflow/underflow checks - simplification for example
    /// Production code should validate ranges
    function subtractFromBalance(inEuint32 calldata amount, bytes calldata proof) external {
        euint32 encryptedAmount = FHE.asEuint32(amount, proof);

        // FHE subtraction: encrypted - encrypted = encrypted
        euint32 newBalance = FHE.sub(balances[msg.sender], encryptedAmount);

        balances[msg.sender] = newBalance;

        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);

        emit BalanceUpdated(msg.sender);
    }

    /// @notice Multiply balance by a plaintext factor
    /// @param factor Plaintext multiplier
    /// @dev Demonstrates multiplying encrypted value by plaintext
    /// Result is encrypted
    function multiplyBalance(uint32 factor) external {
        // Encrypt the factor and multiply
        euint32 encryptedFactor = FHE.asEuint32(factor);

        // FHE multiplication: encrypted * plaintext = encrypted
        euint32 newBalance = FHE.mul(balances[msg.sender], encryptedFactor);

        balances[msg.sender] = newBalance;

        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);

        emit BalanceUpdated(msg.sender);
    }

    /// @notice Perform complex calculation: (balance + add) - subtract
    /// @param addAmount Amount to add
    /// @param addProof Proof for add amount
    /// @param subtractAmount Amount to subtract
    /// @param subtractProof Proof for subtract amount
    /// @dev Demonstrates chaining multiple FHE operations
    function complexCalculation(
        inEuint32 calldata addAmount,
        bytes calldata addProof,
        inEuint32 calldata subtractAmount,
        bytes calldata subtractProof
    ) external {
        euint32 encryptedAddAmount = FHE.asEuint32(addAmount, addProof);
        euint32 encryptedSubtractAmount = FHE.asEuint32(subtractAmount, subtractProof);

        // Chain operations: first add, then subtract
        euint32 afterAdd = FHE.add(balances[msg.sender], encryptedAddAmount);
        euint32 finalBalance = FHE.sub(afterAdd, encryptedSubtractAmount);

        balances[msg.sender] = finalBalance;

        FHE.allowThis(finalBalance);
        FHE.allow(finalBalance, msg.sender);

        emit BalanceUpdated(msg.sender);
    }

    /// @notice Transfer encrypted amount to another user
    /// @param recipient Recipient address
    /// @param amount Amount to transfer (encrypted)
    /// @param proof Proof for the amount
    /// @dev Demonstrates FHE operations between multiple parties
    function transferEncrypted(
        address recipient,
        inEuint32 calldata amount,
        bytes calldata proof
    ) external {
        require(recipient != address(0), "Invalid recipient");

        euint32 encryptedAmount = FHE.asEuint32(amount, proof);

        // Subtract from sender's balance
        euint32 senderBalance = FHE.sub(balances[msg.sender], encryptedAmount);
        balances[msg.sender] = senderBalance;

        // Add to recipient's balance
        euint32 recipientBalance = FHE.add(balances[recipient], encryptedAmount);
        balances[recipient] = recipientBalance;

        // Grant permissions
        FHE.allowThis(senderBalance);
        FHE.allow(senderBalance, msg.sender);

        FHE.allowThis(recipientBalance);
        FHE.allow(recipientBalance, recipient);

        emit BalanceUpdated(msg.sender);
        emit BalanceUpdated(recipient);
    }

    /// @notice Example showing underflow risk
    /// @dev ❌ ANTI-PATTERN: No underflow protection
    /// This can result in very large positive numbers when underflow occurs
    /// Always validate ranges before arithmetic operations
    function BAD_subtractWithoutChecks(inEuint32 calldata amount, bytes calldata proof) external {
        euint32 encryptedAmount = FHE.asEuint32(amount, proof);

        // ❌ Dangerous: No check if amount > balance
        // Underflow results in very large unsigned integer
        euint32 newBalance = FHE.sub(balances[msg.sender], encryptedAmount);

        balances[msg.sender] = newBalance;

        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);
    }
}
