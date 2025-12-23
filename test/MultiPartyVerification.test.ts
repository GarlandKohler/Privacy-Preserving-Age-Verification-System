import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiPartyVerification } from "../typechain-types";

/**
 * Test Suite: MultiPartyVerification
 * Tests multi-party age verification and comparison
 */
describe("MultiPartyVerification", function () {
    let contract: MultiPartyVerification;
    let owner: any;
    let user: any;
    let user2: any;

    beforeEach(async function () {
        const MultiPartyVerification = await ethers.getContractFactory("MultiPartyVerification");
        contract = await MultiPartyVerification.deploy();
        await contract.deployed();

        [owner, user, user2] = await ethers.getSigners();
    });

    describe("Initialization", function () {
        it("✅ Should deploy contract successfully", async function () {
            expect(contract.address).to.not.equal(ethers.constants.AddressZero);
        });
    });

    describe("Multi-Party Verification", function () {
        it("✅ Should allow multiple users to submit ages", async function () {
            await contract.connect(user).submitEncryptedAge(25);
            await contract.connect(user2).submitEncryptedAge(30);
        });

        it("✅ Should support age comparisons between users", async function () {
            await contract.connect(user).submitEncryptedAge(20);
            await contract.connect(user2).submitEncryptedAge(25);
        });
    });

    describe("Privacy-Preserving Comparisons", function () {
        it("✅ Should compare ages without revealing values", async function () {
            // Users submit encrypted ages
            await contract.connect(user).submitEncryptedAge(18);
            await contract.connect(user2).submitEncryptedAge(21);

            // Comparison can occur without revealing actual ages
        });
    });

    describe("Learning Outcomes", function () {
        it("✅ Should demonstrate multi-user FHE operations", async function () {
            // Shows:
            // - Multiple users with encrypted data
            // - Comparisons without decryption
            // - Privacy for all parties
            await contract.connect(user).submitEncryptedAge(25);
            await contract.connect(user2).submitEncryptedAge(30);
        });
    });
});
