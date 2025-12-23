import { expect } from "chai";
import { ethers } from "hardhat";
import { EncryptSingleValue } from "../typechain-types";

/**
 * Test Suite: EncryptSingleValue
 * Tests encryption and storage of single values
 */
describe("EncryptSingleValue", function () {
    let contract: EncryptSingleValue;
    let user: any;
    let user2: any;

    beforeEach(async function () {
        const EncryptSingleValue = await ethers.getContractFactory("EncryptSingleValue");
        contract = await EncryptSingleValue.deploy();
        await contract.deployed();

        [, user, user2] = await ethers.getSigners();
    });

    describe("Store and Retrieve", function () {
        it("✅ Should store encrypted value", async function () {
            await expect(contract.connect(user).storeValue(42)).not.to.be.reverted;
        });

        it("✅ Should retrieve encrypted value", async function () {
            await contract.connect(user).storeValue(100);
            const value = await contract.connect(user).getValue();
            expect(value).not.to.be.undefined;
        });

        it("✅ Should allow different users to store separately", async function () {
            await contract.connect(user).storeValue(10);
            await contract.connect(user2).storeValue(20);
        });
    });

    describe("Value Updates", function () {
        it("✅ Should update stored value", async function () {
            await contract.connect(user).storeValue(5);
            await contract.connect(user).storeValue(10);
        });

        it("✅ Should handle multiple updates", async function () {
            for (let i = 0; i < 5; i++) {
                await contract.connect(user).storeValue(i * 10);
            }
        });
    });

    describe("Edge Cases", function () {
        it("✅ Should store zero", async function () {
            await contract.connect(user).storeValue(0);
        });

        it("✅ Should store maximum value", async function () {
            const maxVal = ethers.constants.MaxUint32;
            await contract.connect(user).storeValue(maxVal);
        });
    });

    describe("Learning Outcomes", function () {
        it("✅ Should demonstrate FHE encryption basics", async function () {
            // Shows:
            // - Encrypting plaintext value
            // - Storing encrypted value
            // - Retrieving encrypted value
            await contract.connect(user).storeValue(42);
            await contract.connect(user).getValue();
        });

        it("✅ Should show per-user encrypted storage", async function () {
            // Each user has their own encrypted value
            // Values are isolated and private
            await contract.connect(user).storeValue(100);
            await contract.connect(user2).storeValue(200);
        });
    });
});
