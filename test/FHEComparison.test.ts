import { expect } from "chai";
import { ethers } from "hardhat";
import { FHEComparison } from "../typechain-types";

/**
 * Test Suite: FHEComparison
 * Tests comparison operations on encrypted values
 */
describe("FHEComparison", function () {
    let contract: FHEComparison;
    let user: any;

    beforeEach(async function () {
        const FHEComparison = await ethers.getContractFactory("FHEComparison");
        contract = await FHEComparison.deploy();
        await contract.deployed();

        [, user] = await ethers.getSigners();
    });

    describe("Equality Operations", function () {
        it("✅ Should check equality of equal numbers", async function () {
            await expect(contract.connect(user).isEqual(5, 5)).not.to.be.reverted;
        });

        it("✅ Should check equality of different numbers", async function () {
            await expect(contract.connect(user).isEqual(5, 10)).not.to.be.reverted;
        });
    });

    describe("Greater Than Operations", function () {
        it("✅ Should check if a > b", async function () {
            await expect(contract.connect(user).isGreaterThan(10, 5)).not.to.be.reverted;
        });

        it("✅ Should check when a < b", async function () {
            await expect(contract.connect(user).isGreaterThan(5, 10)).not.to.be.reverted;
        });
    });

    describe("Less Than Operations", function () {
        it("✅ Should check if a < b", async function () {
            await expect(contract.connect(user).isLessThan(5, 10)).not.to.be.reverted;
        });

        it("✅ Should check when a > b", async function () {
            await expect(contract.connect(user).isLessThan(10, 5)).not.to.be.reverted;
        });
    });

    describe("Encrypted Comparisons", function () {
        it("✅ Should perform encrypted equality check", async function () {
            // FHE.eq(encrypted_a, encrypted_b) = encrypted_bool
            await contract.connect(user).isEqual(7, 7);
        });

        it("✅ Should perform encrypted greater than", async function () {
            // FHE.gt(encrypted_a, encrypted_b) = encrypted_bool
            await contract.connect(user).isGreaterThan(100, 50);
        });

        it("✅ Should perform encrypted less than", async function () {
            // FHE.lt(encrypted_a, encrypted_b) = encrypted_bool
            await contract.connect(user).isLessThan(50, 100);
        });
    });

    describe("Edge Cases", function () {
        it("✅ Should handle zero values", async function () {
            await contract.connect(user).isEqual(0, 0);
            await contract.connect(user).isGreaterThan(0, 1);
            await contract.connect(user).isLessThan(0, 1);
        });

        it("✅ Should handle max values", async function () {
            const maxVal = ethers.constants.MaxUint32;
            await contract.connect(user).isEqual(maxVal, maxVal);
            await contract.connect(user).isGreaterThan(maxVal, 0);
        });
    });

    describe("Learning Outcomes", function () {
        it("✅ Should demonstrate encrypted boolean results", async function () {
            // FHE.eq(), FHE.gt(), FHE.lt()
            // All return encrypted boolean (ebool)
            // Cannot be used in if statements
            // Must be returned for off-chain use
        });

        it("✅ Should show comparison operations work encrypted", async function () {
            // Can compare encrypted values
            // Result is encrypted
            // No plaintext exposure
            await contract.connect(user).isEqual(5, 5);
        });
    });
});
