// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, inEuint8, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decrypt Multiple Values
/// @notice Demonstrates public decryption of multiple encrypted values
/// @dev Key concepts:
/// - Storing multiple encrypted values
/// - Publicly revealing multiple values together
/// - Ensuring consistency during reveal
/// - Complex reveal patterns
contract PublicDecryptMultipleValues is SepoliaConfig {
    /// @notice Structure for encrypted data that will be publicly revealed
    struct EncryptedData {
        euint8 category;    // Encrypted category (1-10)
        euint32 amount;     // Encrypted amount
        euint32 timestamp;  // Encrypted timestamp (could be plaintext, shown encrypted for concept)
        bool revealed;      // Whether data has been revealed
    }

    /// @notice Structure for revealed data
    struct RevealedData {
        uint8 category;
        uint32 amount;
        uint32 timestamp;
    }

    /// @notice Mapping of user to their encrypted data
    mapping(address => EncryptedData[]) private encryptedRecords;

    /// @notice Mapping of user to their revealed data
    mapping(address => RevealedData[]) private revealedRecords;

    /// @notice Event emitted when records are revealed
    event RecordsRevealed(address indexed user, uint256 recordCount);

    /// @notice Store multiple encrypted values
    /// @param categoryInput Encrypted category
    /// @param categoryProof Proof for category
    /// @param amountInput Encrypted amount
    /// @param amountProof Proof for amount
    /// @param timestamp Plaintext timestamp (could also be encrypted)
    /// @dev Stores multiple values together
    function storeEncryptedData(
        inEuint8 calldata categoryInput,
        bytes calldata categoryProof,
        inEuint32 calldata amountInput,
        bytes calldata amountProof,
        uint32 timestamp
    ) external {
        euint8 encryptedCategory = FHE.asEuint8(categoryInput, categoryProof);
        euint32 encryptedAmount = FHE.asEuint32(amountInput, amountProof);
        euint32 encryptedTimestamp = FHE.asEuint32(timestamp);

        EncryptedData memory data = EncryptedData({
            category: encryptedCategory,
            amount: encryptedAmount,
            timestamp: encryptedTimestamp,
            revealed: false
        });

        encryptedRecords[msg.sender].push(data);

        // Grant permissions
        FHE.allowThis(encryptedCategory);
        FHE.allow(encryptedCategory, msg.sender);

        FHE.allowThis(encryptedAmount);
        FHE.allow(encryptedAmount, msg.sender);

        FHE.allowThis(encryptedTimestamp);
        FHE.allow(encryptedTimestamp, msg.sender);
    }

    /// @notice Get encrypted record
    /// @param index Record index
    /// @return category Encrypted category
    /// @return amount Encrypted amount
    /// @return timestamp Encrypted timestamp
    function getEncryptedRecord(uint256 index) external view returns (
        euint8 category,
        euint32 amount,
        euint32 timestamp
    ) {
        require(index < encryptedRecords[msg.sender].length, "Invalid index");

        EncryptedData storage data = encryptedRecords[msg.sender][index];
        return (data.category, data.amount, data.timestamp);
    }

    /// @notice Publicly reveal multiple records
    /// @param indices Indices of records to reveal
    /// @param categories Plaintext categories
    /// @param amounts Plaintext amounts
    /// @param timestamps Plaintext timestamps
    /// @dev Reveals all values from multiple encrypted records
    function revealMultipleRecords(
        uint256[] calldata indices,
        uint8[] calldata categories,
        uint32[] calldata amounts,
        uint32[] calldata timestamps
    ) external {
        require(
            indices.length == categories.length &&
            categories.length == amounts.length &&
            amounts.length == timestamps.length,
            "Array length mismatch"
        );

        for (uint i = 0; i < indices.length; i++) {
            require(indices[i] < encryptedRecords[msg.sender].length, "Invalid index");

            encryptedRecords[msg.sender][indices[i]].revealed = true;

            revealedRecords[msg.sender].push(RevealedData({
                category: categories[i],
                amount: amounts[i],
                timestamp: timestamps[i]
            }));
        }

        emit RecordsRevealed(msg.sender, indices.length);
    }

    /// @notice Get publicly revealed record
    /// @param index Record index
    /// @return category The plaintext category
    /// @return amount The plaintext amount
    /// @return timestamp The plaintext timestamp
    function getRevealedRecord(uint256 index) external view returns (
        uint8 category,
        uint32 amount,
        uint32 timestamp
    ) {
        require(index < revealedRecords[msg.sender].length, "Invalid index");

        RevealedData storage data = revealedRecords[msg.sender][index];
        return (data.category, data.amount, data.timestamp);
    }

    /// @notice Get total encrypted records
    /// @return uint256 Number of encrypted records
    function getEncryptedRecordCount() external view returns (uint256) {
        return encryptedRecords[msg.sender].length;
    }

    /// @notice Get total revealed records
    /// @return uint256 Number of revealed records
    function getRevealedRecordCount() external view returns (uint256) {
        return revealedRecords[msg.sender].length;
    }

    /// @notice Example: Tax declaration workflow
    /// @dev Demonstrates real-world use case for public decryption
    struct TaxDeclaration {
        euint32 income;         // Encrypted income
        euint32 expenses;       // Encrypted expenses
        euint8 category;        // Encrypted category
        uint32 revealYear;      // Year to reveal (can be set in future)
        bool fullyRevealed;
    }

    TaxDeclaration[] public taxDeclarations;

    /// @notice File encrypted tax declaration
    /// @param incomeInput Encrypted income
    /// @param incomeProof Proof for income
    /// @param expensesInput Encrypted expenses
    /// @param expensesProof Proof for expenses
    /// @param categoryInput Encrypted category
    /// @param categoryProof Proof for category
    /// @dev Filed encrypted, can be revealed later (e.g., after audit period)
    function fileTaxDeclaration(
        inEuint32 calldata incomeInput,
        bytes calldata incomeProof,
        inEuint32 calldata expensesInput,
        bytes calldata expensesProof,
        inEuint8 calldata categoryInput,
        bytes calldata categoryProof
    ) external {
        euint32 income = FHE.asEuint32(incomeInput, incomeProof);
        euint32 expenses = FHE.asEuint32(expensesInput, expensesProof);
        euint8 category = FHE.asEuint8(categoryInput, categoryProof);

        TaxDeclaration memory decl = TaxDeclaration({
            income: income,
            expenses: expenses,
            category: category,
            revealYear: block.timestamp,
            fullyRevealed: false
        });

        taxDeclarations.push(decl);

        FHE.allowThis(income);
        FHE.allow(income, msg.sender);

        FHE.allowThis(expenses);
        FHE.allow(expenses, msg.sender);

        FHE.allowThis(category);
        FHE.allow(category, msg.sender);
    }

    /// @notice Reveal tax declaration after audit period
    /// @param declId Declaration ID
    /// @param income Plaintext income
    /// @param expenses Plaintext expenses
    /// @param category Plaintext category
    /// @dev Called by authorities after audit period ends
    /// Makes declaration public
    function revealTaxDeclaration(
        uint256 declId,
        uint32 income,
        uint32 expenses,
        uint8 category
    ) external {
        require(declId < taxDeclarations.length, "Invalid declaration");
        require(!taxDeclarations[declId].fullyRevealed, "Already revealed");

        taxDeclarations[declId].fullyRevealed = true;
        taxDeclarations[declId].income = FHE.asEuint32(income);
        taxDeclarations[declId].expenses = FHE.asEuint32(expenses);
        taxDeclarations[declId].category = FHE.asEuint8(category);
    }

    /// @notice Multi-value reveal patterns
    /// @dev Key patterns for revealing multiple values:
    ///
    /// ATOMIC REVEAL:
    /// ✅ Reveal all values together at once
    /// ✅ Ensures consistency
    /// ✅ Cannot partially reveal
    /// ✅ Good for records that must be consistent
    ///
    /// PARTIAL REVEAL:
    /// ✅ Reveal values one at a time
    /// ✅ Allows phased disclosure
    /// ✅ More flexible control
    /// ✅ Risk of inconsistency
    ///
    /// BATCH REVEAL:
    /// ✅ Reveal groups of values
    /// ✅ Balance between atomic and partial
    /// ✅ Good for organizing data
    ///
    /// CONDITIONAL REVEAL:
    /// ✅ Reveal only if certain conditions met
    /// ✅ Good for time-locked or permission-based reveals
    /// ✅ More complex validation
    function revealPatterns() external pure {
        // Documentation only
    }

    /// @notice Real-world applications
    /// @dev Common scenarios for multi-value public decryption:
    /// 1. Medical records - Multiple test results revealed together
    /// 2. Tax declarations - Income, expenses, category revealed
    /// 3. Insurance claims - Medical history and claim details
    /// 4. Loan applications - Income, assets, liabilities
    /// 5. Government contracts - Bids and evaluations
    /// 6. Scientific data - Measurements and metadata
    function applications() external pure {
        // Documentation only
    }
}
