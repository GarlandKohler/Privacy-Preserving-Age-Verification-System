// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Anti-Patterns in FHEVM
/// @notice Educational contract showing common mistakes and anti-patterns in FHE development
/// @dev This contract demonstrates:
/// - ❌ View functions with encrypted values
/// - ❌ Missing FHE.allowThis() permissions
/// - ❌ Missing FHE.allow() permissions
/// - ❌ Other common mistakes
///
/// DO NOT USE THESE PATTERNS IN PRODUCTION!
/// This is for learning purposes only.
contract AntiPatterns is SepoliaConfig {
    mapping(address => euint32) private values;

    // ========== ANTI-PATTERN 1: View Functions with Encrypted Values ==========

    /// @notice ❌ ANTI-PATTERN: View function returning encrypted value
    /// @dev WHY THIS IS WRONG:
    /// - View functions are read-only and shouldn't be called during transactions
    /// - Encrypted values in view functions confuse the system
    /// - Can cause unexpected behavior or errors
    /// - FHE operations on encrypted values from view functions may fail
    ///
    /// ✅ CORRECT APPROACH:
    /// - Use state functions to return encrypted values
    /// - Keep view functions for reading plaintext metadata only
    /// - Use external transactions for encrypted operations
    function BAD_viewWithEncrypted() external view returns (euint32) {
        // ❌ WRONG: Returning encrypted value from view function
        // This breaks FHE assumptions about transaction flow
        return values[msg.sender];
    }

    /// @notice ✅ CORRECT: Use state-modifying function for encrypted values
    /// @dev Better pattern for working with encrypted values
    function GOOD_stateWithEncrypted() external view returns (euint32) {
        // ✅ Better: At least return from storage
        // But ideally, use transactions for encrypted operations
        return values[msg.sender];
    }

    // ========== ANTI-PATTERN 2: Missing FHE.allowThis() ==========

    /// @notice ❌ ANTI-PATTERN: Missing FHE.allowThis() permission
    /// @param input Encrypted input
    /// @param proof Proof for input
    /// @dev WHY THIS IS WRONG:
    /// - Without FHE.allowThis(), contract cannot use the encrypted value
    /// - Any operation on the value will fail with "FHE permission denied"
    /// - Contract cannot decrypt, compute with, or manipulate the value
    ///
    /// WHAT FAILS:
    /// ❌ FHE.add(value, x) - Permission denied
    /// ❌ FHE.sub(value, x) - Permission denied
    /// ❌ FHE.eq(value, x) - Permission denied
    /// ❌ Any FHE operation - Permission denied
    ///
    /// THE FIX:
    /// ✅ Always call FHE.allowThis(encryptedValue) after converting input
    function BAD_missingAllowThis(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        // ❌ MISSING: FHE.allowThis(value);

        values[msg.sender] = value;

        // ❌ This line would fail if uncommented:
        // euint32 result = FHE.add(value, FHE.asEuint32(10));
        // Error: FHE permission denied - contract doesn't have permission

        // ❌ This line would also fail:
        // FHE.allow(value, msg.sender);
        // Error: Cannot grant user permission without contract permission first
    }

    /// @notice ✅ CORRECT: Include FHE.allowThis()
    /// @param input Encrypted input
    /// @param proof Proof for input
    function GOOD_withAllowThis(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        // ✅ CORRECT: Grant contract permission
        FHE.allowThis(value);

        values[msg.sender] = value;

        // ✅ Now FHE operations work:
        euint32 result = FHE.add(value, FHE.asEuint32(10));

        // ✅ And user permissions work:
        FHE.allow(value, msg.sender);
    }

    // ========== ANTI-PATTERN 3: Missing FHE.allow() ==========

    /// @notice ❌ ANTI-PATTERN: Missing FHE.allow() permission
    /// @param input Encrypted input
    /// @param proof Proof for input
    /// @dev WHY THIS IS WRONG:
    /// - Without FHE.allow(), user cannot decrypt the value
    /// - Only the contract can manipulate it (if allowThis is set)
    /// - User receives encrypted value but cannot read it
    /// - Contract cannot share results with user
    ///
    /// WHAT FAILS:
    /// ❌ User cannot decrypt the value
    /// ❌ User receives result but cannot use it
    /// ❌ Breaks user's ability to see their own data
    ///
    /// THE FIX:
    /// ✅ Always call FHE.allow(encryptedValue, user) for user's values
    function BAD_missingAllow(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        // ✅ Grant contract permission
        FHE.allowThis(value);

        // ❌ MISSING: FHE.allow(value, msg.sender);

        values[msg.sender] = value;

        // ✅ Contract can manipulate:
        euint32 result = FHE.add(value, FHE.asEuint32(5));
        FHE.allowThis(result);

        // ❌ But user cannot decrypt result because:
        // ❌ FHE.allow(result, msg.sender) is missing
        // ❌ User gets encrypted result they cannot decrypt
    }

    /// @notice ✅ CORRECT: Include both allowThis and allow
    /// @param input Encrypted input
    /// @param proof Proof for input
    function GOOD_withBothPermissions(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        // ✅ Grant both permissions
        FHE.allowThis(value);
        FHE.allow(value, msg.sender);

        values[msg.sender] = value;

        // ✅ All operations work:
        euint32 result = FHE.add(value, FHE.asEuint32(5));

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        // ✅ User can now decrypt result
    }

    // ========== ANTI-PATTERN 4: Using encrypted values in conditionals ==========

    /// @notice ❌ ANTI-PATTERN: Using encrypted boolean in if statement
    /// @param input Encrypted value
    /// @param proof Proof for input
    /// @dev WHY THIS IS WRONG:
    /// - Cannot use encrypted boolean (ebool) in if statement
    /// - Smart contract conditionals require plaintext values
    /// - Would leak information about encrypted data
    /// - System cannot branch on encrypted values
    ///
    /// THE FIX:
    /// ✅ Return encrypted result for off-chain decryption
    /// ✅ Use conditional FHE operations (FHE.select/if-then-else)
    /// ✅ Decrypt off-chain and call different function
    function BAD_encryptedConditional(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        FHE.allowThis(value);
        FHE.allow(value, msg.sender);

        // ❌ This does not work:
        // if (value > FHE.asEuint32(100)) {
        //     values[msg.sender] = FHE.asEuint32(1);
        // } else {
        //     values[msg.sender] = FHE.asEuint32(0);
        // }
        // Error: Cannot use ebool in if statement

        // ❌ Trying to cast also fails:
        // if (value) { }
        // Error: Cannot convert euint32 to bool
    }

    /// @notice ✅ CORRECT: Return encrypted result or use FHE.select
    /// @param input Encrypted value
    /// @param proof Proof for input
    /// @return ebool Encrypted comparison result
    function GOOD_returnEncryptedResult(
        inEuint32 calldata input,
        bytes calldata proof
    ) external view returns (ebool) {
        euint32 value = FHE.asEuint32(input, proof);

        // ✅ Return encrypted result
        // User decrypts off-chain and determines next action
        return FHE.gt(value, FHE.asEuint32(100));
    }

    // ========== ANTI-PATTERN 5: Assuming plaintext on encrypted values ==========

    /// @notice ❌ ANTI-PATTERN: Treating encrypted value as plaintext
    /// @dev WHY THIS IS WRONG:
    /// - Cannot cast euint32 to uint32
    /// - Cannot extract value from encrypted representation
    /// - Contract never sees plaintext values
    /// - Would require decryption (only user can do)
    function BAD_castingEncrypted(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        FHE.allowThis(value);
        FHE.allow(value, msg.sender);

        // ❌ These do not work:
        // uint32 plaintext = uint32(value);  // Type error
        // uint256 amount = value;             // Type error
        // require(value > 100);               // Cannot use in require

        // ❌ Cannot do arithmetic with plaintext:
        // uint32 result = value + 50;         // Type error
    }

    // ========== ANTI-PATTERN 6: Forgetting permissions entirely ==========

    /// @notice ❌ ANTI-PATTERN: No permissions at all
    /// @param input Encrypted input
    /// @param proof Proof for input
    function BAD_noPermissions(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        // ❌ NO PERMISSIONS GRANTED
        // ❌ Contract cannot use value
        // ❌ User cannot decrypt value
        // ❌ System is in undefined state

        values[msg.sender] = value;

        // ❌ Everything fails from here:
        // FHE.add(value, x)     - Permission denied
        // return value;         - User cannot decrypt
        // Any operation         - Permission denied
    }

    // ========== ANTI-PATTERN 7: Duplicating permission grants unnecessarily ==========

    /// @notice ⚠️ NOT NECESSARILY WRONG but inefficient
    /// @dev Unnecessarily granting same permission multiple times
    function INEFFICIENT_duplicatePermissions(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        // ✅ These work but are redundant:
        FHE.allowThis(value);
        FHE.allowThis(value);  // ⚠️ Unnecessary: already granted
        FHE.allowThis(value);  // ⚠️ Unnecessary: already granted

        FHE.allow(value, msg.sender);
        FHE.allow(value, msg.sender);  // ⚠️ Unnecessary: already granted

        values[msg.sender] = value;

        // Works fine but wastes gas
    }

    // ========== ANTI-PATTERN 8: Permission order matters sometimes ==========

    /// @notice ⚠️ May fail: allowThis after allow (depends on implementation)
    /// @param input Encrypted input
    /// @param proof Proof for input
    function RISKY_wrongOrderPermissions(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        // ⚠️ Risky: Granting user permission before contract permission
        FHE.allow(value, msg.sender);
        FHE.allowThis(value);

        // ⚠️ May work but violates best practices
        // Best practice: allowThis BEFORE allow
    }

    /// @notice ✅ CORRECT: allowThis before allow
    /// @param input Encrypted input
    /// @param proof Proof for input
    function GOOD_correctOrderPermissions(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        // ✅ CORRECT ORDER:
        // 1. Contract permission first
        FHE.allowThis(value);

        // 2. Then user permission
        FHE.allow(value, msg.sender);

        values[msg.sender] = value;
    }

    /// @notice Summary of anti-patterns
    /// @dev Quick reference of what NOT to do:
    ///
    /// ❌ DON'T:
    /// 1. Return encrypted value from view function
    /// 2. Forget FHE.allowThis()
    /// 3. Forget FHE.allow()
    /// 4. Use ebool in if statements
    /// 5. Cast euint32 to uint32
    /// 6. Assume contract/user can access value without permissions
    /// 7. Try to read plaintext from encrypted value
    /// 8. Use encrypted value in require/assert
    /// 9. Duplicate permissions excessively
    /// 10. Grant allow before allowThis
    ///
    /// ✅ DO:
    /// 1. Use state functions for encrypted values
    /// 2. Always call FHE.allowThis(value)
    /// 3. Always call FHE.allow(value, user)
    /// 4. Return encrypted results for off-chain handling
    /// 5. Use FHE operations for all encrypted logic
    /// 6. Grant permissions in correct order
    /// 7. Store encrypted values in contract state
    /// 8. Test encrypted operations thoroughly
    /// 9. Document all FHE operations
    /// 10. Review permissions carefully
    function antiPatternSummary() external pure {
        // Documentation only
    }
}
