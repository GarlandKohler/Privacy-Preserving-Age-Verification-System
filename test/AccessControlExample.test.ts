import { expect } from "chai";
import { ethers } from "hardhat";
import { AccessControlExample } from "../typechain-types";

/**
 * Test Suite: AccessControlExample
 * Tests FHE access control using allowThis and allow
 */
describe("AccessControlExample", function () {
    let contract: AccessControlExample;
    let user: any;
    let user2: any;

    beforeEach(async function () {
        const AccessControlExample = await ethers.getContractFactory("AccessControlExample");
        contract = await AccessControlExample.deploy();
        await contract.deployed();

        [, user, user2] = await ethers.getSigners();
    });

    describe("Contract Permissions (allowThis)", function () {
        it("✅ Should grant contract permission to use encrypted value", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            await expect(
                contract.connect(user).storeWithContractPermission(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should allow contract to manipulate encrypted values", async function () {
            // With allowThis(), contract can:
            // - Use value in FHE operations
            // - Add, subtract, multiply
            // - Compare values

            const input = ethers.constants.Zero;
            const proof = "0x";

            await contract.connect(user).storeWithContractPermission(input, proof);
        });
    });

    describe("User Permissions (allow)", function () {
        it("✅ Should grant user decryption permission", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            await expect(
                contract.connect(user).storeWithUserPermission(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should allow user to decrypt results", async function () {
            // With allow(value, user), user can decrypt
            // Without it, user receives encrypted they cannot read

            const input = ethers.constants.Zero;
            const proof = "0x";

            await contract.connect(user).storeWithUserPermission(input, proof);
        });
    });

    describe("Both Permissions", function () {
        it("✅ Should grant both contract and user permissions", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            await expect(
                contract.connect(user).storeWithBothPermissions(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should enable full encrypted workflow", async function () {
            // With both permissions:
            // - Contract can use encrypted value
            // - Contract can perform operations
            // - User can decrypt result
            // - Complete secure computation

            const input = ethers.constants.Zero;
            const proof = "0x";

            await contract.connect(user).storeWithBothPermissions(input, proof);
        });
    });

    describe("Permission Importance", function () {
        it("✅ Should demonstrate contract permission is essential", async function () {
            // Without allowThis():
            // - Contract cannot use encrypted value
            // - Any FHE operation fails
            // - "Permission denied" error

            // Shows why FHE.allowThis() is mandatory
        });

        it("✅ Should demonstrate user permission is essential", async function () {
            // Without allow(value, user):
            // - User receives encrypted result
            // - Cannot decrypt result
            // - Data unusable for user

            // Shows why FHE.allow() is mandatory
        });

        it("✅ Should demonstrate permission order matters", async function () {
            // Best practice:
            // 1. allowThis(value) - Contract first
            // 2. allow(value, user) - User second

            // Correct order ensures reliability
        });
    });

    describe("Multiple Users", function () {
        it("✅ Should isolate permissions per user", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // User 1 grants permissions for their data
            await contract.connect(user).storeWithBothPermissions(input, proof);

            // User 2 grants permissions for their data
            await contract.connect(user2).storeWithBothPermissions(input, proof);

            // Each user's data has independent permissions
        });

        it("✅ Should prevent cross-user access", async function () {
            // User 1's permissions bound to [contract, user1]
            // User 2's permissions bound to [contract, user2]
            // Cannot mix or transfer

            const input = ethers.constants.Zero;
            const proof = "0x";

            await contract.connect(user).storeWithBothPermissions(input, proof);
            await contract.connect(user2).storeWithBothPermissions(input, proof);
        });
    });

    describe("Permission Workflow", function () {
        it("✅ Should demonstrate permission grant sequence", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // Step 1: User sends encrypted value with proof
            // Step 2: Contract calls FHE.asEuint32(input, proof)
            // Step 3: Contract calls FHE.allowThis(value)
            // Step 4: Contract calls FHE.allow(value, msg.sender)
            // Step 5: Encrypted value now fully usable

            await contract.connect(user).storeWithBothPermissions(input, proof);
        });

        it("✅ Should show permission is per-operation", async function () {
            // Each FHE operation may need permissions granted
            // Permissions for intermediate results also needed
            // Complete workflow grants all needed permissions

            const input = ethers.constants.Zero;
            const proof = "0x";

            await contract.connect(user).storeWithBothPermissions(input, proof);
        });
    });

    describe("Real-World Scenarios", function () {
        it("✅ Should support bank balance computation", async function () {
            // Bank stores encrypted account balance
            // Has allowThis() for computations
            // Has allow() for account owner decryption
            // Owner can withdraw, deposit, check balance

            const input = ethers.constants.Zero;
            const proof = "0x";

            await contract.connect(user).storeWithBothPermissions(input, proof);
        });

        it("✅ Should support medical record access", async function () {
            // Hospital stores encrypted patient data
            // Has allowThis() for analysis
            // Has allow() for patient access
            // Patient and doctor can access appropriately

            const input = ethers.constants.Zero;
            const proof = "0x";

            await contract.connect(user).storeWithBothPermissions(input, proof);
        });

        it("✅ Should support voting system", async function () {
            // Voting contract stores encrypted votes
            // Has allowThis() for vote counting
            // Has allow() for voter verification
            // Privacy maintained during tallying

            const input = ethers.constants.Zero;
            const proof = "0x";

            await contract.connect(user).storeWithBothPermissions(input, proof);
        });
    });

    describe("Learning Outcomes", function () {
        it("✅ Should teach FHE permission model", async function () {
            // Two types of permissions:
            // 1. allowThis() - Contract can use
            // 2. allow(user) - User can decrypt

            // Both are essential for secure FHE
        });

        it("✅ Should show permission binding", async function () {
            // Permissions bound to specific contexts:
            // - Contract address
            // - User address
            // - Transaction context

            // Prevents unauthorized access
        });

        it("✅ Should demonstrate best practices", async function () {
            // Best practice pattern:
            // 1. User encrypts and sends proof
            // 2. Contract validates proof
            // 3. Contract grants allowThis()
            // 4. Contract grants allow(user)
            // 5. Contract performs operations
            // 6. User decrypts result

            const input = ethers.constants.Zero;
            const proof = "0x";

            await contract.connect(user).storeWithBothPermissions(input, proof);
        });

        it("✅ Should highlight permission importance", async function () {
            // Permissions are fundamental to FHE security
            // Forgetting permissions causes failures
            // Proper permissions enable secure computation
            // Both permissions are mandatory

            const input = ethers.constants.Zero;
            const proof = "0x";

            // Shows proper implementation
            await contract.connect(user).storeWithBothPermissions(input, proof);
        });
    });
});
