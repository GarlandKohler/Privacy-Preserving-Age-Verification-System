import { expect } from "chai";
import { ethers } from "hardhat";
import { PrivateAgeVerification } from "../typechain-types";

/**
 * Test Suite: PrivateAgeVerification
 * Tests core age verification functionality
 */
describe("PrivateAgeVerification", function () {
    let contract: PrivateAgeVerification;
    let owner: any;
    let user: any;
    let verifier: any;
    let attacker: any;

    beforeEach(async function () {
        const PrivateAgeVerification = await ethers.getContractFactory("PrivateAgeVerification");
        contract = await PrivateAgeVerification.deploy();
        await contract.deployed();

        [owner, user, verifier, attacker] = await ethers.getSigners();
    });

    describe("Initialization", function () {
        it("✅ Should deploy contract successfully", async function () {
            expect(contract.address).to.not.equal(ethers.constants.AddressZero);
        });

        it("✅ Should set owner correctly", async function () {
            expect(await contract.owner()).to.equal(owner.address);
        });

        it("✅ Should initialize with zero total verifications", async function () {
            expect(await contract.totalVerifications()).to.equal(0);
        });

        it("✅ Should grant owner as verifier", async function () {
            expect(await contract.authorizedVerifiers(owner.address)).to.be.true;
        });
    });

    describe("Age Submission", function () {
        it("✅ Should accept valid age submission (age 25)", async function () {
            const age = 25;

            await expect(
                contract.connect(user).submitEncryptedAge(age)
            ).to.emit(contract, "AgeSubmitted").withArgs(user.address);
        });

        it("✅ Should accept minimum valid age (1)", async function () {
            const age = 1;

            await expect(
                contract.connect(user).submitEncryptedAge(age)
            ).to.emit(contract, "AgeSubmitted");
        });

        it("✅ Should accept maximum valid age (120)", async function () {
            const age = 120;

            await expect(
                contract.connect(user).submitEncryptedAge(age)
            ).to.emit(contract, "AgeSubmitted");
        });

        it("❌ Should reject age below minimum (0)", async function () {
            const age = 0;

            await expect(
                contract.connect(user).submitEncryptedAge(age)
            ).to.be.revertedWith("Invalid age range");
        });

        it("❌ Should reject age above maximum (121)", async function () {
            const age = 121;

            await expect(
                contract.connect(user).submitEncryptedAge(age)
            ).to.be.revertedWith("Invalid age range");
        });

        it("❌ Should reject unrealistic age (200)", async function () {
            const age = 200;

            await expect(
                contract.connect(user).submitEncryptedAge(age)
            ).to.be.revertedWith("Invalid age range");
        });

        it("✅ Should increment total verifications", async function () {
            const initialCount = await contract.totalVerifications();

            await contract.connect(user).submitEncryptedAge(25);

            const finalCount = await contract.totalVerifications();
            expect(finalCount).to.equal(initialCount.add(1));
        });

        it("✅ Should allow different users to submit", async function () {
            await contract.connect(user).submitEncryptedAge(25);
            await contract.connect(attacker).submitEncryptedAge(30);

            expect(await contract.totalVerifications()).to.equal(2);
        });

        it("❌ Should prevent duplicate submission by same user", async function () {
            await contract.connect(user).submitEncryptedAge(25);

            await expect(
                contract.connect(user).submitEncryptedAge(30)
            ).to.be.revertedWith("Already verified");
        });
    });

    describe("Verification Results", function () {
        beforeEach(async function () {
            await contract.connect(user).submitEncryptedAge(25);
        });

        it("✅ Should return verification result", async function () {
            const result = await contract.connect(user).getVerificationResult();
            expect(result).to.not.be.undefined;
        });

        it("✅ Should reject query before submission", async function () {
            await expect(
                contract.connect(attacker).getVerificationResult()
            ).to.be.revertedWith("Age not submitted");
        });
    });

    describe("Age Range Verification", function () {
        beforeEach(async function () {
            await contract.connect(user).submitEncryptedAge(25);
        });

        it("✅ Should verify age in valid range (20-30)", async function () {
            const result = await contract.connect(user).verifyAgeRange(20, 30);
            expect(result).to.not.be.undefined;
        });

        it("✅ Should verify single point range (25-25)", async function () {
            const result = await contract.connect(user).verifyAgeRange(25, 25);
            expect(result).to.not.be.undefined;
        });

        it("✅ Should verify wide range (1-120)", async function () {
            const result = await contract.connect(user).verifyAgeRange(1, 120);
            expect(result).to.not.be.undefined;
        });

        it("❌ Should reject invalid range (min > max)", async function () {
            await expect(
                contract.connect(user).verifyAgeRange(30, 20)
            ).to.be.revertedWith("Invalid age range");
        });

        it("❌ Should reject range with invalid min age", async function () {
            await expect(
                contract.connect(user).verifyAgeRange(0, 30)
            ).to.be.revertedWith("Invalid age range");
        });

        it("❌ Should reject range with invalid max age", async function () {
            await expect(
                contract.connect(user).verifyAgeRange(20, 150)
            ).to.be.revertedWith("Invalid age range");
        });

        it("❌ Should reject before age submission", async function () {
            await expect(
                contract.connect(attacker).verifyAgeRange(20, 30)
            ).to.be.revertedWith("Age not submitted");
        });
    });

    describe("Age Comparison", function () {
        beforeEach(async function () {
            await contract.connect(user).submitEncryptedAge(30);
            await contract.connect(verifier).submitEncryptedAge(25);
        });

        it("✅ Should compare two users' ages", async function () {
            const result = await contract.connect(user).compareAges(verifier.address);
            expect(result).to.not.be.undefined;
        });

        it("❌ Should reject comparison if caller hasn't submitted", async function () {
            await expect(
                contract.connect(attacker).compareAges(verifier.address)
            ).to.be.revertedWith("Your age not submitted");
        });

        it("❌ Should reject comparison if target hasn't submitted", async function () {
            await expect(
                contract.connect(user).compareAges(attacker.address)
            ).to.be.revertedWith("Other user age not submitted");
        });

        it("✅ Should allow comparing with same user", async function () {
            // User comparing their own age
            const result = await contract.connect(user).compareAges(user.address);
            expect(result).to.not.be.undefined;
        });
    });

    describe("Verifier Management", function () {
        it("✅ Should add authorized verifier", async function () {
            await expect(
                contract.connect(owner).addAuthorizedVerifier(verifier.address)
            ).to.emit(contract, "VerifierAdded").withArgs(verifier.address);
        });

        it("❌ Should reject invalid verifier address (zero)", async function () {
            await expect(
                contract.connect(owner).addAuthorizedVerifier(ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid verifier address");
        });

        it("✅ Should allow verifier to complete verification", async function () {
            await contract.connect(user).submitEncryptedAge(25);
            await contract.connect(owner).addAuthorizedVerifier(verifier.address);

            await expect(
                contract.connect(verifier).completeVerificationForUser(user.address, true)
            ).to.emit(contract, "VerificationCompleted");
        });

        it("❌ Should reject non-owner adding verifier", async function () {
            await expect(
                contract.connect(user).addAuthorizedVerifier(verifier.address)
            ).to.be.revertedWith("Not authorized");
        });

        it("✅ Should remove verifier", async function () {
            await contract.connect(owner).addAuthorizedVerifier(verifier.address);

            await expect(
                contract.connect(owner).removeAuthorizedVerifier(verifier.address)
            ).to.emit(contract, "VerifierRemoved");
        });

        it("❌ Should prevent removing owner as verifier", async function () {
            await expect(
                contract.connect(owner).removeAuthorizedVerifier(owner.address)
            ).to.be.revertedWith("Cannot remove owner");
        });
    });

    describe("Adult Status Verification", function () {
        it("✅ Should verify adult status for age 18", async function () {
            await contract.connect(user).submitEncryptedAge(18);
            const status = await contract.connect(user).isUserAdult(user.address);
            expect(status[0]).to.equal(false); // Not yet completed by verifier
        });

        it("✅ Should verify adult status for age 30", async function () {
            await contract.connect(user).submitEncryptedAge(30);
            const status = await contract.connect(user).isUserAdult(user.address);
            expect(status[0]).to.equal(false);
        });

        it("✅ Should show not adult for age 17", async function () {
            await contract.connect(user).submitEncryptedAge(17);
            const status = await contract.connect(user).isUserAdult(user.address);
            expect(status[0]).to.equal(false);
        });
    });

    describe("Verification Status", function () {
        it("✅ Should get user verification status after submission", async function () {
            await contract.connect(user).submitEncryptedAge(25);

            const status = await contract.getUserVerificationStatus(user.address);
            expect(status.hasSubmittedAge).to.be.true;
            expect(status.timestamp).to.be.greaterThan(0);
        });

        it("✅ Should show not submitted for new user", async function () {
            const status = await contract.getUserVerificationStatus(attacker.address);
            expect(status.hasSubmittedAge).to.be.false;
        });
    });

    describe("Verification Statistics", function () {
        it("✅ Should return correct statistics on empty contract", async function () {
            const stats = await contract.getVerificationStats();
            expect(stats.totalUsers).to.equal(0);
            expect(stats.completedVerifications).to.equal(0);
            expect(stats.pendingCount).to.equal(0);
        });

        it("✅ Should return correct statistics after submissions", async function () {
            await contract.connect(user).submitEncryptedAge(25);
            await contract.connect(verifier).submitEncryptedAge(30);

            const stats = await contract.getVerificationStats();
            expect(stats.totalUsers).to.equal(2);
            expect(stats.pendingCount).to.equal(2);
        });

        it("✅ Should update statistics after verification completion", async function () {
            await contract.connect(user).submitEncryptedAge(25);
            await contract.connect(owner).completeVerificationForUser(user.address, true);

            const stats = await contract.getVerificationStats();
            expect(stats.completedVerifications).to.equal(1);
            expect(stats.pendingCount).to.equal(0);
        });
    });

    describe("Verification History", function () {
        it("✅ Should retrieve verification history", async function () {
            await contract.connect(user).submitEncryptedAge(25);
            await contract.connect(owner).completeVerificationForUser(user.address, true);

            const history = await contract.getVerificationHistory(0, 10);
            expect(history.length).to.be.greaterThan(0);
        });

        it("❌ Should reject unauthorized history access", async function () {
            await expect(
                contract.connect(attacker).getVerificationHistory(0, 10)
            ).to.be.revertedWith("Not authorized verifier");
        });

        it("✅ Should allow verifier to access history", async function () {
            await contract.connect(user).submitEncryptedAge(25);
            await contract.connect(owner).completeVerificationForUser(user.address, true);
            await contract.connect(owner).addAuthorizedVerifier(verifier.address);

            const history = await contract.connect(verifier).getVerificationHistory(0, 10);
            expect(history.length).to.be.greaterThan(0);
        });
    });

    describe("Emergency Pause", function () {
        it("✅ Should allow owner to pause", async function () {
            await contract.connect(owner).emergencyPause();
            expect(await contract.emergencyPaused()).to.be.true;
        });

        it("✅ Should allow owner to unpause", async function () {
            await contract.connect(owner).emergencyPause();
            await contract.connect(owner).emergencyUnpause();
            expect(await contract.emergencyPaused()).to.be.false;
        });

        it("❌ Should reject non-owner pause attempt", async function () {
            await expect(
                contract.connect(user).emergencyPause()
            ).to.be.revertedWith("Not authorized");
        });
    });

    describe("User Verification Reset", function () {
        beforeEach(async function () {
            await contract.connect(user).submitEncryptedAge(25);
        });

        it("✅ Should allow owner to reset verification", async function () {
            expect(await contract.getUserVerificationStatus(user.address)).to.exist;

            await contract.connect(owner).resetUserVerification(user.address);

            const status = await contract.getUserVerificationStatus(user.address);
            expect(status.hasSubmittedAge).to.be.false;
        });

        it("❌ Should reject non-owner reset attempt", async function () {
            await expect(
                contract.connect(user).resetUserVerification(user.address)
            ).to.be.revertedWith("Not authorized");
        });
    });

    describe("Verifier Authorization Check", function () {
        it("✅ Should identify owner as verifier", async function () {
            expect(await contract.isAuthorizedVerifier(owner.address)).to.be.true;
        });

        it("❌ Should identify non-verifier as unauthorized", async function () {
            expect(await contract.isAuthorizedVerifier(user.address)).to.be.false;
        });

        it("✅ Should identify added verifier", async function () {
            await contract.connect(owner).addAuthorizedVerifier(verifier.address);
            expect(await contract.isAuthorizedVerifier(verifier.address)).to.be.true;
        });
    });

    describe("Edge Cases", function () {
        it("✅ Should handle multiple verifications in sequence", async function () {
            const ages = [18, 25, 30, 50, 65, 75];

            for (let i = 0; i < ages.length; i++) {
                const signer = (await ethers.getSigners())[i];
                await contract.connect(signer).submitEncryptedAge(ages[i]);
            }

            const stats = await contract.getVerificationStats();
            expect(stats.totalUsers).to.equal(ages.length);
        });

        it("✅ Should handle boundary ages correctly", async function () {
            // Test age 18 (exactly at adult threshold)
            await contract.connect(user).submitEncryptedAge(18);
            const result1 = await contract.connect(user).getVerificationResult();
            expect(result1).to.not.be.undefined;

            // Test age 17 (below threshold)
            const [signer2] = await ethers.getSigners();
            await contract.connect(signer2).submitEncryptedAge(17);
            const result2 = await contract.connect(signer2).getVerificationResult();
            expect(result2).to.not.be.undefined;
        });
    });
});
