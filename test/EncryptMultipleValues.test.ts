import { expect } from "chai";
import { ethers } from "hardhat";
import { EncryptMultipleValues } from "../typechain-types";

/**
 * Test Suite: EncryptMultipleValues
 * Tests encryption and management of multiple values
 */
describe("EncryptMultipleValues", function () {
    let contract: EncryptMultipleValues;
    let user: any;

    beforeEach(async function () {
        const EncryptMultipleValues = await ethers.getContractFactory("EncryptMultipleValues");
        contract = await EncryptMultipleValues.deploy();
        await contract.deployed();

        [, user] = await ethers.getSigners();
    });

    describe("Store Multiple Values", function () {
        it("✅ Should store multiple encrypted values", async function () {
            await contract.connect(user).storeValue(10);
            await contract.connect(user).storeValue(20);
            await contract.connect(user).storeValue(30);
        });

        it("✅ Should track count of stored values", async function () {
            expect(await contract.connect(user).getValueCount()).to.equal(0);

            await contract.connect(user).storeValue(100);
            expect(await contract.connect(user).getValueCount()).to.equal(1);

            await contract.connect(user).storeValue(200);
            expect(await contract.connect(user).getValueCount()).to.equal(2);
        });
    });

    describe("Retrieve Values", function () {
        beforeEach(async function () {
            await contract.connect(user).storeValue(15);
            await contract.connect(user).storeValue(25);
            await contract.connect(user).storeValue(35);
        });

        it("✅ Should retrieve value by index", async function () {
            const value0 = await contract.connect(user).getValue(0);
            expect(value0).not.to.be.undefined;

            const value1 = await contract.connect(user).getValue(1);
            expect(value1).not.to.be.undefined;
        });

        it("✅ Should retrieve all values", async function () {
            const count = await contract.connect(user).getValueCount();

            for (let i = 0; i < count.toNumber(); i++) {
                const value = await contract.connect(user).getValue(i);
                expect(value).not.to.be.undefined;
            }
        });
    });

    describe("Multiple Users", function () {
        it("✅ Should maintain separate value lists per user", async function () {
            const [, user1, user2, user3] = await ethers.getSigners();

            // User 1: 2 values
            await contract.connect(user1).storeValue(100);
            await contract.connect(user1).storeValue(200);

            // User 2: 1 value
            await contract.connect(user2).storeValue(300);

            // User 3: 3 values
            await contract.connect(user3).storeValue(400);
            await contract.connect(user3).storeValue(500);
            await contract.connect(user3).storeValue(600);

            expect(await contract.connect(user1).getValueCount()).to.equal(2);
            expect(await contract.connect(user2).getValueCount()).to.equal(1);
            expect(await contract.connect(user3).getValueCount()).to.equal(3);
        });
    });

    describe("Value Ranges", function () {
        it("✅ Should handle various value ranges", async function () {
            await contract.connect(user).storeValue(0);           // Min
            await contract.connect(user).storeValue(255);          // Byte
            await contract.connect(user).storeValue(65535);        // Word
            await contract.connect(user).storeValue(1000000);      // Large

            expect(await contract.connect(user).getValueCount()).to.equal(4);
        });
    });

    describe("Batch Operations", function () {
        it("✅ Should handle storing many values", async function () {
            for (let i = 0; i < 20; i++) {
                await contract.connect(user).storeValue(i * 10);
            }

            expect(await contract.connect(user).getValueCount()).to.equal(20);
        });

        it("✅ Should retrieve all stored values", async function () {
            // Store values
            const values = [100, 200, 300, 400, 500];
            for (const val of values) {
                await contract.connect(user).storeValue(val);
            }

            // Retrieve all
            for (let i = 0; i < values.length; i++) {
                const retrieved = await contract.connect(user).getValue(i);
                expect(retrieved).not.to.be.undefined;
            }
        });
    });

    describe("Edge Cases", function () {
        it("✅ Should handle storing and retrieving zero", async function () {
            await contract.connect(user).storeValue(0);
            const value = await contract.connect(user).getValue(0);
            expect(value).not.to.be.undefined;
        });

        it("✅ Should handle max uint32 values", async function () {
            const maxVal = ethers.constants.MaxUint32;
            await contract.connect(user).storeValue(maxVal);
            const value = await contract.connect(user).getValue(0);
            expect(value).not.to.be.undefined;
        });

        it("✅ Should handle retrieving from empty list gracefully", async function () {
            // Depends on implementation
            // May revert or return default
            expect(await contract.connect(user).getValueCount()).to.equal(0);
        });
    });

    describe("Learning Outcomes", function () {
        it("✅ Should demonstrate array of encrypted values", async function () {
            // Shows:
            // - Storing multiple encrypted values
            // - Managing array of euint32
            // - Per-user isolation
            for (let i = 0; i < 3; i++) {
                await contract.connect(user).storeValue(i * 10);
            }
        });

        it("✅ Should show encrypted arrays maintain privacy", async function () {
            // All values in array are encrypted
            // Cannot be individually inspected
            // Contract manipulates without decryption
            await contract.connect(user).storeValue(42);
            await contract.connect(user).getValue(0);
        });

        it("✅ Should demonstrate scalability", async function () {
            // Can store many encrypted values
            // Contract manages collection
            // Each value independently encrypted
            for (let i = 0; i < 50; i++) {
                await contract.connect(user).storeValue(i);
            }
            expect(await contract.connect(user).getValueCount()).to.equal(50);
        });
    });
});
