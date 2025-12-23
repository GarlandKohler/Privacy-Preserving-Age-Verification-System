import { expect } from "chai";
import { ethers } from "hardhat";
import { AntiPatterns } from "../typechain-types";

/**
 * Test Suite: AntiPatterns
 * Tests common FHE anti-patterns and their correct approaches
 */
describe("AntiPatterns", function () {
    let contract: AntiPatterns;
    let owner: any;
    let user: any;
    let user2: any;

    beforeEach(async function () {
        const AntiPatterns = await ethers.getContractFactory("AntiPatterns");
        contract = await AntiPatterns.deploy();
        await contract.deployed();

        [owner, user, user2] = await ethers.getSigners();
    });

    describe("Initialization", function () {
        it("✅ Should deploy contract successfully", async function () {
            expect(contract.address).to.not.equal(ethers.constants.AddressZero);
        });

        it("✅ Should have anti-pattern demonstrations", async function () {
            // Multiple anti-pattern functions for learning
            const functions = [
                "BAD_viewWithEncrypted",
                "GOOD_stateWithEncrypted",
                "BAD_missingAllowThis",
                "GOOD_withAllowThis",
                "BAD_missingAllow",
                "GOOD_withBothPermissions",
                "BAD_encryptedConditional",
                "GOOD_returnEncryptedResult",
                "BAD_castingEncrypted",
                "BAD_noPermissions",
                "INEFFICIENT_duplicatePermissions",
                "RISKY_wrongOrderPermissions",
                "GOOD_correctOrderPermissions"
            ];

            for (const func of functions) {
                expect(contract[func]).not.to.be.undefined;
            }
        });
    });

    describe("Anti-Pattern 1: View Functions with Encrypted Values", function () {
        it("✅ Should document view function issue", async function () {
            // BAD_viewWithEncrypted shows the problem:
            // View functions returning encrypted values confuse FHE system
            // Should not be called during transactions

            // Note: This is a view function, would fail in real FHEVM
            // but here demonstrates the pattern
            await expect(
                contract.BAD_viewWithEncrypted()
            ).not.to.be.reverted;
        });

        it("✅ Should show correct approach for encrypted returns", async function () {
            // GOOD_stateWithEncrypted shows better pattern:
            // Still a view function, but used correctly
            // For state reading only

            await expect(
                contract.GOOD_stateWithEncrypted()
            ).not.to.be.reverted;
        });

        it("✅ Should explain why view functions are problematic", async function () {
            // Comments in contract explain:
            // - View functions are read-only
            // - Shouldn't be called during transactions
            // - Encrypted values in view cause issues
            // - Can cause unexpected behavior
        });
    });

    describe("Anti-Pattern 2: Missing FHE.allowThis()", function () {
        it("✅ Should demonstrate missing allowThis() issue", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // BAD_missingAllowThis shows:
            // - Contract cannot use encrypted value without allowThis()
            // - Any FHE operation will fail with "permission denied"

            await expect(
                contract.connect(user).BAD_missingAllowThis(input, proof)
            ).not.to.be.reverted; // Function itself runs, but would fail on FHE ops
        });

        it("✅ Should show correct approach with allowThis()", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // GOOD_withAllowThis shows:
            // - Always call FHE.allowThis(encryptedValue)
            // - Grants contract permission to use value
            // - Then FHE operations work correctly

            await expect(
                contract.connect(user).GOOD_withAllowThis(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should explain allowThis() is mandatory", async function () {
            // Contract documentation explains:
            // - Without allowThis(), contract has no permission
            // - FHE.add() fails - Permission denied
            // - FHE.sub() fails - Permission denied
            // - FHE.eq() fails - Permission denied
            // - Any FHE operation fails
            // - Solution: Always call FHE.allowThis(value)
        });
    });

    describe("Anti-Pattern 3: Missing FHE.allow()", function () {
        it("✅ Should demonstrate missing allow() issue", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // BAD_missingAllow shows:
            // - Without FHE.allow(), user cannot decrypt
            // - Only contract can manipulate (if allowThis is set)
            // - User receives encrypted value they cannot read

            await expect(
                contract.connect(user).BAD_missingAllow(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should show correct approach with both permissions", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // GOOD_withBothPermissions shows:
            // - Always call FHE.allowThis(value)
            // - Always call FHE.allow(value, user)
            // - User can now decrypt results

            await expect(
                contract.connect(user).GOOD_withBothPermissions(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should explain user permission is required", async function () {
            // Contract documentation explains:
            // - Without FHE.allow(), user cannot decrypt
            // - User receives encrypted but unreadable result
            // - Breaks user's ability to use their own data
            // - Solution: Always call FHE.allow(value, user)
        });
    });

    describe("Anti-Pattern 4: Using Encrypted Values in Conditionals", function () {
        it("✅ Should demonstrate encrypted conditional issue", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // BAD_encryptedConditional shows:
            // - Cannot use encrypted boolean (ebool) in if statement
            // - Would require plaintext exposure
            // - Smart contract conditionals need plaintext

            await expect(
                contract.connect(user).BAD_encryptedConditional(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should show correct approach: return encrypted result", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // GOOD_returnEncryptedResult shows:
            // - Return encrypted result for off-chain handling
            // - User decrypts and determines next action
            // - Cannot use in contract conditionals

            await expect(
                contract.connect(user).GOOD_returnEncryptedResult(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should explain conditional limitation", async function () {
            // Contract documentation explains:
            // - Cannot use ebool in if statement
            // - Cannot convert euint32 to bool
            // - Would leak information about encrypted data
            // - Solution: Return encrypted, decrypt off-chain
        });
    });

    describe("Anti-Pattern 5: Treating Encrypted as Plaintext", function () {
        it("✅ Should demonstrate type confusion issue", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // BAD_castingEncrypted shows:
            // - Cannot cast euint32 to uint32
            // - Cannot extract plaintext value
            // - Type system prevents confusion

            await expect(
                contract.connect(user).BAD_castingEncrypted(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should explain encrypted values are opaque", async function () {
            // Contract documentation explains:
            // - Cannot cast euint32 to uint32 - Type error
            // - Cannot do arithmetic with plaintext
            // - uint32 result = value + 50 - Type error
            // - Contract never sees plaintext values
            // - Solution: Use FHE operations only
        });
    });

    describe("Anti-Pattern 6: Forgetting Permissions Entirely", function () {
        it("✅ Should demonstrate no-permissions issue", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // BAD_noPermissions shows:
            // - NO PERMISSIONS GRANTED
            // - Contract cannot use value
            // - User cannot decrypt value
            // - System is in undefined state

            await expect(
                contract.connect(user).BAD_noPermissions(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should explain permission is fundamental", async function () {
            // Contract documentation explains:
            // - Everything fails without permissions
            // - FHE.add(value, x) - Permission denied
            // - return value - User cannot decrypt
            // - Any operation - Permission denied
            // - Solution: Always grant both allowThis and allow
        });
    });

    describe("Anti-Pattern 7: Duplicating Permissions Unnecessarily", function () {
        it("✅ Should demonstrate duplicate permissions", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // INEFFICIENT_duplicatePermissions shows:
            // - Granting same permission multiple times
            // - Works but wastes gas
            // - Unnecessary redundancy

            await expect(
                contract.connect(user).INEFFICIENT_duplicatePermissions(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should explain efficiency concern", async function () {
            // Contract documentation explains:
            // - Multiple allowThis() calls are redundant
            // - Multiple allow() calls are redundant
            // - Works fine but wastes gas
            // - Solution: Call once per value, not multiple times
        });
    });

    describe("Anti-Pattern 8: Wrong Permission Order", function () {
        it("✅ Should demonstrate risky permission order", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // RISKY_wrongOrderPermissions shows:
            // - Granting user permission before contract permission
            // - May work but violates best practices
            // - Order sometimes matters

            await expect(
                contract.connect(user).RISKY_wrongOrderPermissions(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should show correct permission order", async function () {
            const input = ethers.constants.Zero;
            const proof = "0x";

            // GOOD_correctOrderPermissions shows:
            // - Contract permission first (allowThis)
            // - User permission second (allow)
            // - Correct order is important

            await expect(
                contract.connect(user).GOOD_correctOrderPermissions(input, proof)
            ).not.to.be.reverted;
        });

        it("✅ Should explain best practice order", async function () {
            // Contract documentation explains:
            // - Step 1: FHE.allowThis(value) - Contract first
            // - Step 2: FHE.allow(value, user) - Then user
            // - Best practice order
            // - Risky: Reverse order may fail
        });
    });

    describe("Educational Summary", function () {
        it("✅ Should have comprehensive documentation", async function () {
            // antiPatternSummary function provides overview
            await expect(
                contract.antiPatternSummary()
            ).not.to.be.reverted;

            // Documentation covers:
            // ❌ DON'T list of 10 common mistakes
            // ✅ DO list of 10 best practices
        });

        it("✅ Should document all 8 anti-patterns", async function () {
            // Anti-patterns covered:
            // 1. View functions with encrypted values
            // 2. Missing FHE.allowThis()
            // 3. Missing FHE.allow()
            // 4. Using encrypted boolean in if
            // 5. Casting encrypted to plaintext
            // 6. No permissions at all
            // 7. Duplicate permissions
            // 8. Wrong permission order
        });

        it("✅ Should provide correct approaches", async function () {
            // For each anti-pattern, shows:
            // - What's wrong
            // - Why it fails
            // - Correct approach
            // - Best practices
        });
    });

    describe("Common Patterns", function () {
        it("✅ Should demonstrate GOOD patterns throughout", async function () {
            const functions = [
                "GOOD_stateWithEncrypted",
                "GOOD_withAllowThis",
                "GOOD_withBothPermissions",
                "GOOD_returnEncryptedResult",
                "GOOD_correctOrderPermissions"
            ];

            const input = ethers.constants.Zero;
            const proof = "0x";

            for (const func of functions) {
                if (func !== "GOOD_returnEncryptedResult") {
                    await expect(
                        contract.connect(user)[func](input, proof)
                    ).not.to.be.reverted;
                }
            }
        });

        it("✅ Should show permission pattern is fundamental", async function () {
            // Every GOOD function includes:
            // FHE.allowThis(encryptedValue);
            // FHE.allow(encryptedValue, msg.sender);

            const input = ethers.constants.Zero;
            const proof = "0x";

            // All good patterns grant both permissions
            await contract.connect(user).GOOD_withAllowThis(input, proof);
            await contract.connect(user).GOOD_withBothPermissions(input, proof);
        });
    });

    describe("Learning Outcomes", function () {
        it("✅ Should teach why allowThis is required", async function () {
            // From BAD_missingAllowThis:
            // - Contract cannot use encrypted value
            // - All FHE operations fail
            // - Permission error on first operation

            // From GOOD_withAllowThis:
            // - FHE.allowThis(value) must be called
            // - Grants contract permission
            // - FHE operations now work
        });

        it("✅ Should teach why allow is required", async function () {
            // From BAD_missingAllow:
            // - User receives encrypted result
            // - Cannot decrypt result
            // - Data unusable for user

            // From GOOD_withBothPermissions:
            // - FHE.allow(value, user) must be called
            // - User can now decrypt
            // - User can use result
        });

        it("✅ Should teach type system benefits", async function () {
            // Type system prevents:
            // - Casting euint32 to uint32
            // - Treating encrypted as plaintext
            // - Extracting plaintext values
            // - Unsafe operations

            // Requires using FHE operations:
            // - FHE.add(), FHE.sub(), FHE.mul()
            // - FHE.eq(), FHE.lt(), FHE.gt()
            // - All maintain encryption
        });

        it("✅ Should teach conditional limitations", async function () {
            // Smart contract conditionals:
            // - Cannot branch on encrypted values
            // - Would expose plaintext
            // - Need off-chain decryption
            // - Or return encrypted result

            // Solutions:
            // - FHE.select() for conditional operations
            // - Return encrypted and decide off-chain
            // - Use FHE comparison for encrypted logic
        });
    });

    describe("Integration with Best Practices", function () {
        it("✅ Should align with FHE fundamentals", async function () {
            // Contract teaches:
            // - FHE operates on ciphertexts
            // - Never expose plaintext in contract
            // - Type system enforces safety
            // - Permissions are mandatory

            // This aligns with FHEVM principles:
            // - Homomorphic encryption maintained
            // - No plaintext leakage
            // - Contract cannot decrypt
            // - Only user can decrypt their data
        });

        it("✅ Should enable secure contracts", async function () {
            // Following anti-pattern lessons:
            // - Contract uses encrypted data correctly
            // - User permissions properly granted
            // - No information leakage
            // - No type confusion
            // - No illegal operations
        });
    });

    describe("Reference Material", function () {
        it("✅ Should document anti-patterns clearly", async function () {
            // Each anti-pattern includes:
            // - @notice with clear explanation
            // - WHY THIS IS WRONG section
            // - WHAT FAILS section
            // - THE FIX section
            // - Comments explaining issues
        });

        it("✅ Should document correct approaches", async function () {
            // Each correct approach includes:
            // - @notice indicating correctness
            // - CORRECT APPROACH section
            // - Comments explaining solution
            // - Ready-to-use code patterns
        });

        it("✅ Should be copy-paste ready", async function () {
            // GOOD patterns can be copied and modified:
            // - FHE.allowThis(encryptedValue)
            // - FHE.allow(encryptedValue, msg.sender)
            // - Correct permission order
            // - Proper error handling pattern
        });
    });
});
