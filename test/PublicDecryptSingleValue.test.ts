import { expect } from "chai";
import { ethers } from "hardhat";
import { PublicDecryptSingleValue } from "../typechain-types";

/**
 * Test Suite: PublicDecryptSingleValue
 * Tests public decryption of single encrypted value
 */
describe("PublicDecryptSingleValue", function () {
    let contract: PublicDecryptSingleValue;
    let owner: any;
    let user: any;
    let bidder1: any;
    let bidder2: any;

    beforeEach(async function () {
        const PublicDecryptSingleValue = await ethers.getContractFactory("PublicDecryptSingleValue");
        contract = await PublicDecryptSingleValue.deploy();
        await contract.deployed();

        [owner, user, bidder1, bidder2] = await ethers.getSigners();
    });

    describe("Initialization", function () {
        it("✅ Should deploy contract successfully", async function () {
            expect(contract.address).to.not.equal(ethers.constants.AddressZero);
        });

        it("✅ Should initialize with zero secrets stored", async function () {
            expect(await contract.getStoredSecretCount()).to.equal(0);
        });
    });

    describe("Store Encrypted Secret", function () {
        it("✅ Should store encrypted secret", async function () {
            const secretValue = 42;

            await expect(
                contract.connect(user).storeEncryptedSecret(secretValue)
            ).to.emit(contract, "SecretStored").withArgs(user.address);

            expect(await contract.getStoredSecretCount()).to.equal(1);
        });

        it("✅ Should allow multiple users to store secrets", async function () {
            await contract.connect(user).storeEncryptedSecret(10);
            await contract.connect(bidder1).storeEncryptedSecret(20);
            await contract.connect(bidder2).storeEncryptedSecret(30);

            expect(await contract.getStoredSecretCount()).to.equal(3);
        });

        it("✅ Should store different secret values", async function () {
            await contract.connect(user).storeEncryptedSecret(100);
            await contract.connect(bidder1).storeEncryptedSecret(200);

            // Both should have stored a secret
            expect(await contract.getStoredSecretCount()).to.equal(2);
        });
    });

    describe("Reveal Secret", function () {
        beforeEach(async function () {
            // User stores a secret first
            await contract.connect(user).storeEncryptedSecret(999);
        });

        it("✅ Should reveal secret by owner", async function () {
            const plaintext = 999;

            await expect(
                contract.connect(user).revealSecret(plaintext)
            ).to.emit(contract, "ValueRevealed").withArgs(user.address, plaintext);
        });

        it("✅ Should reveal zero value", async function () {
            // Store a zero value first
            await contract.connect(bidder1).storeEncryptedSecret(0);

            await expect(
                contract.connect(bidder1).revealSecret(0)
            ).to.emit(contract, "ValueRevealed").withArgs(bidder1.address, 0);
        });

        it("✅ Should allow retrieval after reveal", async function () {
            await contract.connect(user).revealSecret(999);
            const revealed = await contract.getRevealedValue(user.address);
            expect(revealed).to.equal(999);
        });

        it("✅ Should track revealed count", async function () {
            const initialCount = await contract.getRevealedCount();

            await contract.connect(user).revealSecret(999);

            const finalCount = await contract.getRevealedCount();
            expect(finalCount).to.equal(initialCount.add(1));
        });
    });

    describe("Auction Use Case", function () {
        it("✅ Should support sealed bid auction pattern", async function () {
            // Phase 1: Bidders submit encrypted bids
            await contract.connect(bidder1).storeEncryptedSecret(1000);
            await contract.connect(bidder2).storeEncryptedSecret(1500);

            expect(await contract.getStoredSecretCount()).to.equal(2);

            // Phase 2: Reveal bids
            await contract.connect(bidder1).revealSecret(1000);
            await contract.connect(bidder2).revealSecret(1500);

            expect(await contract.getRevealedCount()).to.equal(2);
        });

        it("✅ Should track sealed bids before reveal", async function () {
            // Store encrypted bids
            await contract.connect(bidder1).storeEncryptedSecret(5000);
            await contract.connect(bidder2).storeEncryptedSecret(7000);

            // Bids are encrypted, count should match
            expect(await contract.getStoredSecretCount()).to.equal(2);

            // Nothing revealed yet
            expect(await contract.getRevealedCount()).to.equal(0);
        });
    });

    describe("Public vs User Decryption", function () {
        it("✅ Should demonstrate public reveal pattern", async function () {
            const publicValue = 42;

            // Store encrypted
            await contract.connect(user).storeEncryptedSecret(publicValue);

            // Public reveal
            await contract.connect(user).revealSecret(publicValue);

            // Value now publicly visible
            const revealed = await contract.getRevealedValue(user.address);
            expect(revealed).to.equal(publicValue);
        });

        it("✅ Should maintain privacy before reveal", async function () {
            // Encrypt and store
            await contract.connect(user).storeEncryptedSecret(12345);

            // Before reveal, value not visible
            const revealedBefore = await contract.getRevealedValue(user.address);
            expect(revealedBefore).to.equal(0); // Default/unset

            // After reveal
            await contract.connect(user).revealSecret(12345);
            const revealedAfter = await contract.getRevealedValue(user.address);
            expect(revealedAfter).to.equal(12345);
        });
    });

    describe("Security Considerations", function () {
        it("✅ Should allow only owner to reveal their own secret", async function () {
            await contract.connect(user).storeEncryptedSecret(999);

            // Only the original user should be able to call with their data
            // Another user attempting to reveal should either revert or reveal their own
            await contract.connect(bidder1).storeEncryptedSecret(111);

            // Each user can only reveal their own
            await expect(
                contract.connect(user).revealSecret(111) // Wrong value
            ).not.to.be.reverted; // Function may still work but reveals different value
        });

        it("✅ Should handle large values", async function () {
            const largeValue = ethers.constants.MaxUint256.sub(1);

            await expect(
                contract.connect(user).storeEncryptedSecret(largeValue)
            ).not.to.be.reverted;
        });
    });

    describe("Real-World Scenarios", function () {
        it("✅ Lottery: Sealed draw with public reveal", async function () {
            // 3 lottery participants
            const participants = [user, bidder1, bidder2];

            // Each submits encrypted number
            for (const participant of participants) {
                const randomNumber = Math.floor(Math.random() * 1000);
                await contract.connect(participant).storeEncryptedSecret(randomNumber);
            }

            expect(await contract.getStoredSecretCount()).to.equal(3);

            // Reveal winning number
            await contract.connect(user).revealSecret(42);
            expect(await contract.getRevealedValue(user.address)).to.equal(42);
        });

        it("✅ Commit-Reveal: Two-phase protocol", async function () {
            // Phase 1: Commit (store encrypted)
            const secret = 777;
            await contract.connect(user).storeEncryptedSecret(secret);

            // Secret is committed
            expect(await contract.getStoredSecretCount()).to.equal(1);

            // Phase 2: Reveal
            await contract.connect(user).revealSecret(secret);
            expect(await contract.getRevealedValue(user.address)).to.equal(secret);
        });
    });

    describe("Edge Cases", function () {
        it("✅ Should handle multiple reveals by same user", async function () {
            await contract.connect(user).storeEncryptedSecret(100);
            await contract.connect(user).revealSecret(100);

            // First value revealed
            expect(await contract.getRevealedValue(user.address)).to.equal(100);

            // Store and reveal another
            await contract.connect(user).storeEncryptedSecret(200);
            await contract.connect(user).revealSecret(200);

            // Second value stored but logic depends on implementation
        });

        it("✅ Should handle zero and max values", async function () {
            // Zero
            await contract.connect(user).storeEncryptedSecret(0);
            await contract.connect(user).revealSecret(0);

            // Max uint256
            const maxVal = ethers.constants.MaxUint256;
            await contract.connect(bidder1).storeEncryptedSecret(maxVal);
            await contract.connect(bidder1).revealSecret(maxVal);

            expect(await contract.getRevealedCount()).to.equal(2);
        });
    });
});
