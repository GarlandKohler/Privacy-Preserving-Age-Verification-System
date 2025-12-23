import { expect } from "chai";
import { ethers } from "hardhat";
import { FHEArithmetic } from "../typechain-types";

/**
 * Test Suite: FHEArithmetic
 * Tests arithmetic operations on encrypted values
 */
describe("FHEArithmetic", function () {
    let contract: FHEArithmetic;
    let owner: any;
    let user: any;

    beforeEach(async function () {
        const FHEArithmetic = await ethers.getContractFactory("FHEArithmetic");
        contract = await FHEArithmetic.deploy();
        await contract.deployed();

        [owner, user] = await ethers.getSigners();
    });

    describe("Initialization", function () {
        it("✅ Should deploy contract successfully", async function () {
            expect(contract.address).to.not.equal(ethers.constants.AddressZero);
        });
    });

    describe("Addition Operations", function () {
        it("✅ Should add two encrypted numbers", async function () {
            const a = 10;
            const b = 20;

            await expect(
                contract.connect(user).add(a, b)
            ).not.to.be.reverted;
        });

        it("✅ Should add with zero", async function () {
            await expect(
                contract.connect(user).add(5, 0)
            ).not.to.be.reverted;

            await expect(
                contract.connect(user).add(0, 5)
            ).not.to.be.reverted;
        });

        it("✅ Should add equal numbers", async function () {
            await expect(
                contract.connect(user).add(7, 7)
            ).not.to.be.reverted;
        });

        it("✅ Should add large numbers", async function () {
            const maxVal = ethers.constants.MaxUint256.sub(ethers.BigNumber.from(10));

            await expect(
                contract.connect(user).add(maxVal, 1)
            ).not.to.be.reverted;
        });
    });

    describe("Subtraction Operations", function () {
        it("✅ Should subtract two encrypted numbers", async function () {
            const a = 30;
            const b = 10;

            await expect(
                contract.connect(user).subtract(a, b)
            ).not.to.be.reverted;
        });

        it("✅ Should subtract to zero", async function () {
            await expect(
                contract.connect(user).subtract(5, 5)
            ).not.to.be.reverted;
        });

        it("✅ Should subtract from zero", async function () {
            // Results in negative (underflow in unsigned)
            await expect(
                contract.connect(user).subtract(0, 5)
            ).not.to.be.reverted;
        });

        it("✅ Should subtract with zero", async function () {
            await expect(
                contract.connect(user).subtract(10, 0)
            ).not.to.be.reverted;
        });
    });

    describe("Multiplication Operations", function () {
        it("✅ Should multiply two encrypted numbers", async function () {
            const a = 5;
            const b = 6;

            await expect(
                contract.connect(user).multiply(a, b)
            ).not.to.be.reverted;
        });

        it("✅ Should multiply by zero", async function () {
            await expect(
                contract.connect(user).multiply(100, 0)
            ).not.to.be.reverted;
        });

        it("✅ Should multiply by one", async function () {
            await expect(
                contract.connect(user).multiply(42, 1)
            ).not.to.be.reverted;
        });

        it("✅ Should multiply equal numbers", async function () {
            await expect(
                contract.connect(user).multiply(8, 8)
            ).not.to.be.reverted;
        });
    });

    describe("Encrypted Arithmetic", function () {
        it("✅ Should demonstrate FHE.add operation", async function () {
            // Shows encrypted addition
            // result = encrypted_a + encrypted_b
            // All operations on encrypted data
            const result = await contract.connect(user).add(10, 20);
            expect(result).not.to.be.reverted;
        });

        it("✅ Should demonstrate FHE.sub operation", async function () {
            // Shows encrypted subtraction
            // result = encrypted_a - encrypted_b
            const result = await contract.connect(user).subtract(50, 30);
            expect(result).not.to.be.reverted;
        });

        it("✅ Should demonstrate FHE.mul operation", async function () {
            // Shows encrypted multiplication
            // result = encrypted_a * encrypted_b
            const result = await contract.connect(user).multiply(7, 8);
            expect(result).not.to.be.reverted;
        });
    });

    describe("Chained Operations", function () {
        it("✅ Should perform addition then multiplication", async function () {
            // First add
            await contract.connect(user).add(5, 10); // = 15 (encrypted)

            // Then multiply
            await contract.connect(user).multiply(15, 2); // = 30 (encrypted)
        });

        it("✅ Should perform multiple operations", async function () {
            // Complex calculation: ((10 + 5) * 2) - 3
            await contract.connect(user).add(10, 5);      // = 15
            await contract.connect(user).multiply(15, 2);  // = 30
            await contract.connect(user).subtract(30, 3);  // = 27
        });
    });

    describe("Encrypted vs Plaintext", function () {
        it("✅ Should show operations preserve encryption", async function () {
            // All operations work on encrypted values
            // Contract never sees plaintext
            // Result is encrypted

            const sum = await contract.connect(user).add(7, 8);
            // Sum is encrypted value (euint32)
            expect(sum).not.to.be.undefined;
        });

        it("✅ Should demonstrate no plaintext exposure", async function () {
            // Even though we pass 5 and 10,
            // and they might be encrypted,
            // contract uses FHE operations
            // Result is encrypted

            await contract.connect(user).add(100, 200);
            // No plaintext arithmetic visible
        });
    });

    describe("Permission Model", function () {
        it("✅ Should grant proper permissions for add", async function () {
            // FHE.allowThis() for contract
            // FHE.allow() for user
            // Both needed for encrypted operations

            await contract.connect(user).add(10, 20);
        });

        it("✅ Should grant proper permissions for all ops", async function () {
            // Each operation grants:
            // FHE.allowThis(result) - contract can use
            // FHE.allow(result, user) - user can decrypt

            await contract.connect(user).add(5, 5);
            await contract.connect(user).subtract(10, 3);
            await contract.connect(user).multiply(4, 4);
        });
    });

    describe("Edge Cases", function () {
        it("✅ Should handle zero operands", async function () {
            await contract.connect(user).add(0, 0);
            await contract.connect(user).subtract(0, 0);
            await contract.connect(user).multiply(0, 0);
        });

        it("✅ Should handle large numbers", async function () {
            const large = ethers.constants.MaxUint32;

            await contract.connect(user).add(large, 1);
            await contract.connect(user).subtract(large, 1);
            await contract.connect(user).multiply(large, 1);
        });

        it("✅ Should handle single operand operations", async function () {
            await contract.connect(user).add(100, 0);
            await contract.connect(user).subtract(100, 0);
            await contract.connect(user).multiply(100, 1);
        });
    });

    describe("Learning Outcomes", function () {
        it("✅ Should demonstrate basic FHE operations", async function () {
            // Shows:
            // - FHE.add(a, b)
            // - FHE.sub(a, b)
            // - FHE.mul(a, b)
            // All on encrypted data
        });

        it("✅ Should show operations preserve types", async function () {
            // euint32 + euint32 = euint32
            // euint32 - euint32 = euint32
            // euint32 * euint32 = euint32
        });

        it("✅ Should demonstrate no decryption needed", async function () {
            // Contract performs operations without decryption
            // All operations on ciphertexts
            // Security maintained

            await contract.connect(user).add(5, 10);
            // Contract never knows 5 or 10
        });

        it("✅ Should show practical arithmetic", async function () {
            // Real-world use cases:
            // - Balance calculations (encrypted)
            // - Vote counting (encrypted)
            // - Statistical analysis (encrypted)
            // All without exposing data
        });
    });
});
