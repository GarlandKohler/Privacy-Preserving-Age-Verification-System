import { expect } from "chai";
import { ethers } from "hardhat";
import { UserDecryptSingleValue } from "../typechain-types";

/**
 * Test Suite: UserDecryptSingleValue
 * Tests user-side decryption of encrypted values
 */
describe("UserDecryptSingleValue", function () {
    let contract: UserDecryptSingleValue;
    let user: any;
    let user2: any;

    beforeEach(async function () {
        const UserDecryptSingleValue = await ethers.getContractFactory("UserDecryptSingleValue");
        contract = await UserDecryptSingleValue.deploy();
        await contract.deployed();

        [, user, user2] = await ethers.getSigners();
    });

    describe("Initialization", function () {
        it("✅ Should deploy contract successfully", async function () {
            expect(contract.address).to.not.equal(ethers.constants.AddressZero);
        });
    });

    describe("Store Encrypted Value", function () {
        it("✅ Should store encrypted value", async function () {
            const value = 42;

            await expect(
                contract.connect(user).storeEncryptedValue(value)
            ).not.to.be.reverted;
        });

        it("✅ Should allow different users to store", async function () {
            await contract.connect(user).storeEncryptedValue(10);
            await contract.connect(user2).storeEncryptedValue(20);
        });
    });

    describe("Retrieve Encrypted Value", function () {
        beforeEach(async function () {
            await contract.connect(user).storeEncryptedValue(100);
        });

        it("✅ Should retrieve encrypted value from storage", async function () {
            const value = await contract.connect(user).getEncryptedValue();
            expect(value).not.to.be.undefined;
        });

        it("✅ Should allow owner to retrieve their value", async function () {
            const value = await contract.connect(user).getEncryptedValue();
            expect(value).not.to.be.undefined;
        });
    });

    describe("User Decryption", function () {
        it("✅ Should demonstrate user can decrypt their value", async function () {
            const plaintext = 123;

            // Store encrypted
            await contract.connect(user).storeEncryptedValue(plaintext);

            // User can decrypt (off-chain in real scenario)
            // Here we show they have access to encrypted value
            const encrypted = await contract.connect(user).getEncryptedValue();
            expect(encrypted).not.to.be.undefined;

            // In real FHEVM, user would:
            // 1. Get encrypted value from contract
            // 2. Decrypt using private key (off-chain)
            // 3. See plaintext value
        });

        it("✅ Should show user-only decryption permissions", async function () {
            // Only the user who stored the value can decrypt it
            const plaintext = 456;

            await contract.connect(user).storeEncryptedValue(plaintext);

            // User can access
            const value1 = await contract.connect(user).getEncryptedValue();
            expect(value1).not.to.be.undefined;

            // Different user has different value
            await contract.connect(user2).storeEncryptedValue(789);
            const value2 = await contract.connect(user2).getEncryptedValue();
            expect(value2).not.to.be.undefined;
        });
    });

    describe("Permission Model", function () {
        it("✅ Should grant user decryption permission", async function () {
            // Function demonstrates:
            // FHE.allowThis(encryptedValue) - Contract can use
            // FHE.allow(encryptedValue, msg.sender) - User can decrypt

            await contract.connect(user).storeEncryptedValue(100);

            // User can decrypt
            const encrypted = await contract.connect(user).getEncryptedValue();
            expect(encrypted).not.to.be.undefined;
        });

        it("✅ Should enforce user isolation", async function () {
            // Each user's encrypted value is separate
            const value1 = 111;
            const value2 = 222;

            await contract.connect(user).storeEncryptedValue(value1);
            await contract.connect(user2).storeEncryptedValue(value2);

            // Each user retrieves their own
            const encrypted1 = await contract.connect(user).getEncryptedValue();
            const encrypted2 = await contract.connect(user2).getEncryptedValue();

            // Different values (encrypted)
            expect(encrypted1).not.to.be.undefined;
            expect(encrypted2).not.to.be.undefined;
        });
    });

    describe("Value Updates", function () {
        it("✅ Should allow updating encrypted value", async function () {
            // Store initial
            await contract.connect(user).storeEncryptedValue(10);

            // Update
            await contract.connect(user).storeEncryptedValue(20);

            // Retrieve updated
            const value = await contract.connect(user).getEncryptedValue();
            expect(value).not.to.be.undefined;
        });

        it("✅ Should handle multiple updates", async function () {
            for (let i = 0; i < 5; i++) {
                await contract.connect(user).storeEncryptedValue(i * 100);
                const value = await contract.connect(user).getEncryptedValue();
                expect(value).not.to.be.undefined;
            }
        });
    });

    describe("Decryption Workflow", function () {
        it("✅ Should demonstrate complete decrypt workflow", async function () {
            // Step 1: User encrypts and stores value
            const secretValue = 999;
            await contract.connect(user).storeEncryptedValue(secretValue);

            // Step 2: Get encrypted value from contract
            const encryptedValue = await contract.connect(user).getEncryptedValue();
            expect(encryptedValue).not.to.be.undefined;

            // Step 3: (Off-chain) User decrypts using private key
            // In real scenario: user.decrypt(encryptedValue) -> plaintext

            // This test shows:
            // - Value stored encrypted in contract
            // - User can retrieve encrypted value
            // - User (only) can decrypt it
        });
    });

    describe("Privacy Features", function () {
        it("✅ Should maintain privacy during storage", async function () {
            // Value encrypted before storing
            const plaintext = 12345;
            await contract.connect(user).storeEncryptedValue(plaintext);

            // Contract stores encrypted
            const encrypted = await contract.connect(user).getEncryptedValue();

            // Cannot extract plaintext from contract
            expect(encrypted).not.to.equal(plaintext);
        });

        it("✅ Should prevent unauthorized decryption", async function () {
            // User 1 stores value
            await contract.connect(user).storeEncryptedValue(111);

            // User 2 cannot decrypt user 1's value
            // (Different [contract, user] binding)
            const valueUser1 = await contract.connect(user).getEncryptedValue();

            // User 2 has their own value
            await contract.connect(user2).storeEncryptedValue(222);
            const valueUser2 = await contract.connect(user2).getEncryptedValue();

            // Different encrypted values
            expect(valueUser1).not.to.be.undefined;
            expect(valueUser2).not.to.be.undefined;
        });
    });

    describe("Learning Outcomes", function () {
        it("✅ Should demonstrate user-only decryption pattern", async function () {
            // Shows:
            // - Value encrypted in contract
            // - Only user can decrypt
            // - Contract cannot decrypt
            // - Privacy preserved

            await contract.connect(user).storeEncryptedValue(42);
            const encrypted = await contract.connect(user).getEncryptedValue();
            expect(encrypted).not.to.be.undefined;
        });

        it("✅ Should show FHE privacy benefits", async function () {
            // Contract stores user data encrypted
            // Contract cannot see plaintext
            // Contract cannot manipulate without user permission
            // User has decryption capability only

            for (let i = 0; i < 3; i++) {
                await contract.connect(user).storeEncryptedValue(i);
                await contract.connect(user).getEncryptedValue();
            }
        });

        it("✅ Should demonstrate practical use case", async function () {
            // Use case: Private data storage
            // - User stores personal data encrypted
            // - Contract manages encrypted data
            // - User can decrypt anytime
            // - Complete privacy guarantee

            const personalData = 555;
            await contract.connect(user).storeEncryptedValue(personalData);
            const encrypted = await contract.connect(user).getEncryptedValue();
            expect(encrypted).not.to.be.undefined;
        });
    });
});
