import { expect } from "chai";
import { ethers } from "hardhat";
import { VerifierRegistry } from "../typechain-types";

/**
 * Test Suite: VerifierRegistry
 * Tests verifier management functionality
 */
describe("VerifierRegistry", function () {
    let contract: VerifierRegistry;
    let owner: any;
    let verifier1: any;
    let verifier2: any;
    let unauthorized: any;

    beforeEach(async function () {
        const VerifierRegistry = await ethers.getContractFactory("VerifierRegistry");
        contract = await VerifierRegistry.deploy();
        await contract.deployed();

        [owner, verifier1, verifier2, unauthorized] = await ethers.getSigners();
    });

    describe("Initialization", function () {
        it("✅ Should deploy successfully", async function () {
            expect(contract.address).to.not.equal(ethers.constants.AddressZero);
        });

        it("✅ Should set owner as first verifier", async function () {
            expect(await contract.authorizedVerifiers(owner.address)).to.be.true;
        });

        it("✅ Should set owner as active", async function () {
            expect(await contract.verifierActive(owner.address)).to.be.true;
        });
    });

    describe("Adding Verifiers", function () {
        it("✅ Should add new verifier", async function () {
            await expect(
                contract.connect(owner).addVerifier(verifier1.address)
            ).to.emit(contract, "VerifierAdded").withArgs(verifier1.address);
        });

        it("❌ Should reject zero address", async function () {
            await expect(
                contract.connect(owner).addVerifier(ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid verifier address");
        });

        it("❌ Should reject duplicate verifier", async function () {
            await contract.connect(owner).addVerifier(verifier1.address);

            await expect(
                contract.connect(owner).addVerifier(verifier1.address)
            ).to.be.revertedWith("Verifier already exists");
        });

        it("❌ Should reject non-owner adding verifier", async function () {
            await expect(
                contract.connect(unauthorized).addVerifier(verifier1.address)
            ).to.be.revertedWith("Not authorized: not owner");
        });

        it("✅ Should add multiple verifiers", async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            await contract.connect(owner).addVerifier(verifier2.address);

            expect(await contract.authorizedVerifiers(verifier1.address)).to.be.true;
            expect(await contract.authorizedVerifiers(verifier2.address)).to.be.true;
        });

        it("✅ Should activate new verifier", async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            expect(await contract.verifierActive(verifier1.address)).to.be.true;
        });
    });

    describe("Removing Verifiers", function () {
        beforeEach(async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
        });

        it("✅ Should remove verifier", async function () {
            await expect(
                contract.connect(owner).removeVerifier(verifier1.address)
            ).to.emit(contract, "VerifierRemoved").withArgs(verifier1.address);
        });

        it("❌ Should reject removing non-existent verifier", async function () {
            await expect(
                contract.connect(owner).removeVerifier(verifier2.address)
            ).to.be.revertedWith("Verifier does not exist");
        });

        it("❌ Should reject removing owner", async function () {
            await expect(
                contract.connect(owner).removeVerifier(owner.address)
            ).to.be.revertedWith("Cannot remove owner");
        });

        it("❌ Should reject non-owner removal", async function () {
            await expect(
                contract.connect(unauthorized).removeVerifier(verifier1.address)
            ).to.be.revertedWith("Not authorized: not owner");
        });

        it("✅ Should deactivate verifier when removed", async function () {
            await contract.connect(owner).removeVerifier(verifier1.address);
            expect(await contract.verifierActive(verifier1.address)).to.be.false;
        });
    });

    describe("Deactivating Verifiers", function () {
        beforeEach(async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
        });

        it("✅ Should deactivate active verifier", async function () {
            await expect(
                contract.connect(owner).deactivateVerifier(verifier1.address)
            ).to.emit(contract, "VerifierDeactivated").withArgs(verifier1.address);
        });

        it("✅ Should keep verifier in list but inactive", async function () {
            await contract.connect(owner).deactivateVerifier(verifier1.address);

            expect(await contract.authorizedVerifiers(verifier1.address)).to.be.true;
            expect(await contract.verifierActive(verifier1.address)).to.be.false;
        });

        it("❌ Should reject deactivating non-existent verifier", async function () {
            await expect(
                contract.connect(owner).deactivateVerifier(verifier2.address)
            ).to.be.revertedWith("Verifier does not exist");
        });

        it("❌ Should reject deactivating already deactivated", async function () {
            await contract.connect(owner).deactivateVerifier(verifier1.address);

            await expect(
                contract.connect(owner).deactivateVerifier(verifier1.address)
            ).to.be.revertedWith("Verifier already deactivated");
        });
    });

    describe("Reactivating Verifiers", function () {
        beforeEach(async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            await contract.connect(owner).deactivateVerifier(verifier1.address);
        });

        it("✅ Should reactivate deactivated verifier", async function () {
            await expect(
                contract.connect(owner).reactivateVerifier(verifier1.address)
            ).to.emit(contract, "VerifierReactivated").withArgs(verifier1.address);
        });

        it("✅ Should set verifier to active", async function () {
            await contract.connect(owner).reactivateVerifier(verifier1.address);
            expect(await contract.verifierActive(verifier1.address)).to.be.true;
        });

        it("❌ Should reject reactivating already active", async function () {
            await contract.connect(owner).reactivateVerifier(verifier1.address);

            await expect(
                contract.connect(owner).reactivateVerifier(verifier1.address)
            ).to.be.revertedWith("Verifier is already active");
        });

        it("❌ Should reject reactivating non-existent verifier", async function () {
            await expect(
                contract.connect(owner).reactivateVerifier(verifier2.address)
            ).to.be.revertedWith("Verifier does not exist");
        });
    });

    describe("Checking Verifier Status", function () {
        it("✅ Should identify active verifier", async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            expect(await contract.isActiveVerifier(verifier1.address)).to.be.true;
        });

        it("✅ Should identify inactive verifier", async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            await contract.connect(owner).deactivateVerifier(verifier1.address);

            expect(await contract.isActiveVerifier(verifier1.address)).to.be.false;
        });

        it("❌ Should identify unauthorized user", async function () {
            expect(await contract.isActiveVerifier(unauthorized.address)).to.be.false;
        });

        it("❌ Should identify removed verifier as inactive", async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            await contract.connect(owner).removeVerifier(verifier1.address);

            expect(await contract.isActiveVerifier(verifier1.address)).to.be.false;
        });
    });

    describe("Retrieving Verifiers", function () {
        beforeEach(async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            await contract.connect(owner).addVerifier(verifier2.address);
        });

        it("✅ Should return correct verifier count", async function () {
            const count = await contract.getVerifierCount();
            expect(count).to.equal(3); // owner + 2 added
        });

        it("✅ Should get verifier by index", async function () {
            const verifier = await contract.getVerifierAt(1);
            expect(verifier).to.equal(verifier1.address);
        });

        it("❌ Should reject invalid index", async function () {
            await expect(
                contract.getVerifierAt(100)
            ).to.be.revertedWith("Index out of bounds");
        });

        it("✅ Should get all verifiers", async function () {
            const verifiers = await contract.getAllVerifiers();
            expect(verifiers.length).to.equal(3);
            expect(verifiers[0]).to.equal(owner.address);
            expect(verifiers[1]).to.equal(verifier1.address);
            expect(verifiers[2]).to.equal(verifier2.address);
        });
    });

    describe("Ownership Transfer", function () {
        it("✅ Should transfer ownership", async function () {
            await contract.connect(owner).transferOwnership(verifier1.address);
            expect(await contract.owner()).to.equal(verifier1.address);
        });

        it("❌ Should reject zero address", async function () {
            await expect(
                contract.connect(owner).transferOwnership(ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid new owner address");
        });

        it("❌ Should reject non-owner transfer", async function () {
            await expect(
                contract.connect(unauthorized).transferOwnership(verifier1.address)
            ).to.be.revertedWith("Not authorized: not owner");
        });

        it("✅ Should allow new owner to manage verifiers", async function () {
            await contract.connect(owner).transferOwnership(verifier1.address);

            await expect(
                contract.connect(verifier1).addVerifier(verifier2.address)
            ).to.emit(contract, "VerifierAdded");
        });

        it("❌ Should reject former owner after transfer", async function () {
            await contract.connect(owner).transferOwnership(verifier1.address);

            await expect(
                contract.connect(owner).addVerifier(verifier2.address)
            ).to.be.revertedWith("Not authorized: not owner");
        });
    });

    describe("Complex Scenarios", function () {
        it("✅ Should handle add-remove-add cycle", async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            await contract.connect(owner).removeVerifier(verifier1.address);

            // Try to add again
            await expect(
                contract.connect(owner).addVerifier(verifier1.address)
            ).to.be.revertedWith("Verifier already exists"); // Because removal doesn't really remove
        });

        it("✅ Should handle deactivate-reactivate cycle", async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            await contract.connect(owner).deactivateVerifier(verifier1.address);
            await contract.connect(owner).reactivateVerifier(verifier1.address);

            expect(await contract.verifierActive(verifier1.address)).to.be.true;
        });

        it("✅ Should manage multiple verifiers independently", async function () {
            await contract.connect(owner).addVerifier(verifier1.address);
            await contract.connect(owner).addVerifier(verifier2.address);

            await contract.connect(owner).deactivateVerifier(verifier1.address);

            expect(await contract.isActiveVerifier(verifier1.address)).to.be.false;
            expect(await contract.isActiveVerifier(verifier2.address)).to.be.true;
        });
    });
});
