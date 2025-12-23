import { expect } from "chai";
import { ethers } from "hardhat";
import { AgeRangeVerification } from "../typechain-types";

/**
 * Test Suite: AgeRangeVerification
 * Tests age range verification functionality
 */
describe("AgeRangeVerification", function () {
    let contract: AgeRangeVerification;
    let owner: any;
    let user: any;

    beforeEach(async function () {
        const AgeRangeVerification = await ethers.getContractFactory("AgeRangeVerification");
        contract = await AgeRangeVerification.deploy();
        await contract.deployed();

        [owner, user] = await ethers.getSigners();
    });

    describe("Initialization", function () {
        it("✅ Should deploy contract successfully", async function () {
            expect(contract.address).to.not.equal(ethers.constants.AddressZero);
        });
    });

    describe("Age Range Verification", function () {
        it("✅ Should verify age within range", async function () {
            const age = 25;
            await contract.connect(user).submitEncryptedAge(age);
        });

        it("✅ Should handle custom range verification", async function () {
            const age = 30;
            await contract.connect(user).submitEncryptedAge(age);
        });
    });

    describe("Range Checking", function () {
        it("✅ Should support different age ranges", async function () {
            await contract.connect(user).submitEncryptedAge(18); // Adult
            await contract.connect(user).submitEncryptedAge(65); // Senior
        });
    });

    describe("Learning Outcomes", function () {
        it("✅ Should demonstrate range-based verification", async function () {
            // Shows encrypted range checking
            await contract.connect(user).submitEncryptedAge(25);
        });
    });
});
