import { expect } from "chai";
import { ethers } from "hardhat";
import { PublicDecryptMultipleValues } from "../typechain-types";

/**
 * Test Suite: PublicDecryptMultipleValues
 * Tests public decryption of multiple encrypted values
 */
describe("PublicDecryptMultipleValues", function () {
    let contract: PublicDecryptMultipleValues;
    let owner: any;
    let user: any;
    let user2: any;
    let authority: any;

    beforeEach(async function () {
        const PublicDecryptMultipleValues = await ethers.getContractFactory("PublicDecryptMultipleValues");
        contract = await PublicDecryptMultipleValues.deploy();
        await contract.deployed();

        [owner, user, user2, authority] = await ethers.getSigners();
    });

    describe("Initialization", function () {
        it("✅ Should deploy contract successfully", async function () {
            expect(contract.address).to.not.equal(ethers.constants.AddressZero);
        });

        it("✅ Should initialize with zero records", async function () {
            expect(await contract.getEncryptedRecordCount()).to.equal(0);
            expect(await contract.getRevealedRecordCount()).to.equal(0);
        });
    });

    describe("Store Multiple Encrypted Values", function () {
        it("✅ Should store encrypted data with multiple values", async function () {
            const category = 5;
            const amount = 1000;
            const timestamp = Math.floor(Date.now() / 1000);

            // Note: In real FHEVM, we would need proper encrypted inputs
            // This simplified test assumes plaintext conversion
            await contract.connect(user).storeEncryptedData(
                category, // categoryInput (simplified)
                "0x", // categoryProof
                amount, // amountInput (simplified)
                "0x", // amountProof
                timestamp
            );

            expect(await contract.getEncryptedRecordCount()).to.equal(1);
        });

        it("✅ Should store multiple records for same user", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            await contract.connect(user).storeEncryptedData(
                5, "0x", 1000, "0x", timestamp
            );
            await contract.connect(user).storeEncryptedData(
                10, "0x", 2000, "0x", timestamp
            );

            expect(await contract.getEncryptedRecordCount()).to.equal(2);
        });

        it("✅ Should store records from different users", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            await contract.connect(user).storeEncryptedData(
                5, "0x", 1000, "0x", timestamp
            );
            await contract.connect(user2).storeEncryptedData(
                8, "0x", 1500, "0x", timestamp
            );

            // Each user has their own record count
            const user1Count = await contract.getEncryptedRecordCount();
            expect(user1Count).to.equal(1);
        });
    });

    describe("Reveal Multiple Records", function () {
        beforeEach(async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            // Store 3 records
            await contract.connect(user).storeEncryptedData(
                5, "0x", 1000, "0x", timestamp
            );
            await contract.connect(user).storeEncryptedData(
                10, "0x", 2000, "0x", timestamp
            );
            await contract.connect(user).storeEncryptedData(
                15, "0x", 3000, "0x", timestamp
            );
        });

        it("✅ Should reveal single record", async function () {
            await expect(
                contract.connect(user).revealMultipleRecords(
                    [0], // indices
                    [5], // categories
                    [1000], // amounts
                    [Math.floor(Date.now() / 1000)] // timestamps
                )
            ).to.emit(contract, "RecordsRevealed").withArgs(user.address, 1);

            expect(await contract.getRevealedRecordCount()).to.equal(1);
        });

        it("✅ Should reveal multiple records at once", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            await expect(
                contract.connect(user).revealMultipleRecords(
                    [0, 1, 2], // indices
                    [5, 10, 15], // categories
                    [1000, 2000, 3000], // amounts
                    [timestamp, timestamp, timestamp] // timestamps
                )
            ).to.emit(contract, "RecordsRevealed").withArgs(user.address, 3);

            expect(await contract.getRevealedRecordCount()).to.equal(3);
        });

        it("✅ Should reveal partial records", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            // Reveal only indices 0 and 2
            await contract.connect(user).revealMultipleRecords(
                [0, 2],
                [5, 15],
                [1000, 3000],
                [timestamp, timestamp]
            );

            expect(await contract.getRevealedRecordCount()).to.equal(2);
        });
    });

    describe("Tax Declaration Use Case", function () {
        it("✅ Should file encrypted tax declaration", async function () {
            await contract.connect(user).fileTaxDeclaration(
                50000, "0x", // income
                10000, "0x", // expenses
                3, "0x" // category
            );

            // Declaration stored (index would be 0)
            expect(await contract.getEncryptedRecordCount()).to.equal(1);
        });

        it("✅ Should reveal tax declaration with multiple values", async function () {
            // File declaration
            await contract.connect(user).fileTaxDeclaration(
                100000, "0x",
                25000, "0x",
                5, "0x"
            );

            // Later, after audit period, reveal
            await expect(
                contract.connect(authority).revealTaxDeclaration(
                    0, // declaration ID
                    100000, // income
                    25000, // expenses
                    5 // category
                )
            ).not.to.be.reverted;
        });

        it("✅ Should track multiple tax declarations", async function () {
            // User files multiple declarations
            await contract.connect(user).fileTaxDeclaration(
                50000, "0x", 10000, "0x", 1, "0x"
            );
            await contract.connect(user).fileTaxDeclaration(
                75000, "0x", 15000, "0x", 2, "0x"
            );
            await contract.connect(user).fileTaxDeclaration(
                100000, "0x", 25000, "0x", 3, "0x"
            );

            expect(await contract.getEncryptedRecordCount()).to.equal(3);
        });
    });

    describe("Reveal Patterns", function () {
        beforeEach(async function () {
            const timestamp = Math.floor(Date.now() / 1000);
            for (let i = 0; i < 5; i++) {
                await contract.connect(user).storeEncryptedData(
                    i + 1, "0x", (i + 1) * 1000, "0x", timestamp
                );
            }
        });

        it("✅ Atomic Reveal: Reveal all values together", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            // Reveal all 5 records atomically
            await contract.connect(user).revealMultipleRecords(
                [0, 1, 2, 3, 4],
                [1, 2, 3, 4, 5],
                [1000, 2000, 3000, 4000, 5000],
                [timestamp, timestamp, timestamp, timestamp, timestamp]
            );

            expect(await contract.getRevealedRecordCount()).to.equal(5);
        });

        it("✅ Partial Reveal: Selective disclosure", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            // Reveal only first 2 records
            await contract.connect(user).revealMultipleRecords(
                [0, 1],
                [1, 2],
                [1000, 2000],
                [timestamp, timestamp]
            );

            expect(await contract.getRevealedRecordCount()).to.equal(2);

            // Can reveal more later
            await contract.connect(user).revealMultipleRecords(
                [2, 3],
                [3, 4],
                [3000, 4000],
                [timestamp, timestamp]
            );

            expect(await contract.getRevealedRecordCount()).to.equal(4);
        });

        it("✅ Batch Reveal: Reveal groups of values", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            // Batch 1: First 2 records
            await contract.connect(user).revealMultipleRecords(
                [0, 1],
                [1, 2],
                [1000, 2000],
                [timestamp, timestamp]
            );

            // Batch 2: Next 3 records
            await contract.connect(user).revealMultipleRecords(
                [2, 3, 4],
                [3, 4, 5],
                [3000, 4000, 5000],
                [timestamp, timestamp, timestamp]
            );

            expect(await contract.getRevealedRecordCount()).to.equal(5);
        });
    });

    describe("Real-World Applications", function () {
        it("✅ Medical Records: Multiple test results revealed together", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            // Store 3 test results (encrypted)
            await contract.connect(user).storeEncryptedData(
                1, "0x", 120, "0x", timestamp // BP systolic
            );
            await contract.connect(user).storeEncryptedData(
                2, "0x", 80, "0x", timestamp // BP diastolic
            );
            await contract.connect(user).storeEncryptedData(
                3, "0x", 98, "0x", timestamp // Temperature
            );

            // Reveal all results together for diagnosis
            await contract.connect(user).revealMultipleRecords(
                [0, 1, 2],
                [1, 2, 3],
                [120, 80, 98],
                [timestamp, timestamp, timestamp]
            );

            expect(await contract.getRevealedRecordCount()).to.equal(3);
        });

        it("✅ Loan Application: Income, assets, and liabilities", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            // Applicant submits financial data (encrypted)
            await contract.connect(user).storeEncryptedData(
                1, "0x", 75000, "0x", timestamp // Income
            );
            await contract.connect(user).storeEncryptedData(
                2, "0x", 250000, "0x", timestamp // Assets
            );
            await contract.connect(user).storeEncryptedData(
                3, "0x", 50000, "0x", timestamp // Liabilities
            );

            // Bank reveals all for credit decision
            await contract.connect(authority).revealMultipleRecords(
                [0, 1, 2],
                [1, 2, 3],
                [75000, 250000, 50000],
                [timestamp, timestamp, timestamp]
            );

            expect(await contract.getRevealedRecordCount()).to.equal(3);
        });
    });

    describe("Security & Validation", function () {
        it("✅ Should validate array lengths match", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            // Mismatched arrays should fail
            await expect(
                contract.connect(user).revealMultipleRecords(
                    [0, 1], // 2 indices
                    [5], // 1 category (mismatch!)
                    [1000, 2000],
                    [timestamp, timestamp]
                )
            ).to.be.revertedWith("Array length mismatch");
        });

        it("✅ Should handle large batches", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            // Store 10 records
            for (let i = 0; i < 10; i++) {
                await contract.connect(user).storeEncryptedData(
                    i + 1, "0x", (i + 1) * 1000, "0x", timestamp
                );
            }

            // Create arrays for batch reveal
            const indices = Array.from({ length: 10 }, (_, i) => i);
            const categories = Array.from({ length: 10 }, (_, i) => i + 1);
            const amounts = Array.from({ length: 10 }, (_, i) => (i + 1) * 1000);
            const timestamps = Array.from({ length: 10 }, () => timestamp);

            await contract.connect(user).revealMultipleRecords(
                indices,
                categories,
                amounts,
                timestamps
            );

            expect(await contract.getRevealedRecordCount()).to.equal(10);
        });
    });

    describe("Edge Cases", function () {
        it("✅ Should handle zero values in records", async function () {
            const timestamp = Math.floor(Date.now() / 1000);

            await contract.connect(user).storeEncryptedData(
                0, "0x", 0, "0x", timestamp
            );

            await contract.connect(user).revealMultipleRecords(
                [0],
                [0],
                [0],
                [timestamp]
            );

            expect(await contract.getRevealedRecordCount()).to.equal(1);
        });

        it("✅ Should handle max values", async function () {
            const timestamp = Math.floor(Date.now() / 1000);
            const maxVal = ethers.constants.MaxUint256;

            await contract.connect(user).storeEncryptedData(
                maxVal, "0x", maxVal, "0x", timestamp
            );

            await contract.connect(user).revealMultipleRecords(
                [0],
                [maxVal],
                [maxVal],
                [timestamp]
            );

            expect(await contract.getRevealedRecordCount()).to.equal(1);
        });
    });
});
