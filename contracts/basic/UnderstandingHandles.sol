// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Understanding Handles
/// @notice Educational contract explaining FHE handles and their lifecycle
/// @dev Key concepts:
/// - What are handles?
/// - How handles are generated
/// - Handle lifecycle
/// - Symbolic execution
/// - Handle preservation across operations
contract UnderstandingHandles is SepoliaConfig {
    /// @notice What are handles?
    /// @dev Handles are references to encrypted values in FHEVM
    ///
    /// DEFINITION:
    /// A handle is an opaque reference to an encrypted value stored by the FHE coprocessor.
    /// - Handles are NOT the encrypted data itself
    /// - Handles are NOT cryptographic keys
    /// - Handles are memory addresses/references
    /// - Each handle points to a specific encrypted value
    ///
    /// PROPERTIES:
    /// ✅ Unique per encrypted value
    /// ✅ Deterministic (same input produces same handle)
    /// ✅ Bound to [contract, user] pair
    /// ✅ Lifecycle tied to transaction/block
    /// ✅ Cannot be forged or faked (thanks to input proofs)
    ///
    /// RELATIONSHIP TO INPUT PROOFS:
    /// Input proofs validate that a handle correctly references an encrypted value
    /// that was properly bound to the contract and user
    function whatAreHandles() external pure {
        // Documentation only
    }

    /// @notice How handles are generated
    /// @dev Handle generation process
    ///
    /// CLIENT-SIDE (JavaScript/TypeScript):
    /// 1. User creates encrypted input using FHE client library
    /// 2. Library generates handle for the encrypted value
    /// 3. Library generates zero-knowledge proof
    /// 4. Both handle and proof are sent to contract
    ///
    /// Example from client side:
    /// ```typescript
    /// // Client-side encryption (JavaScript)
    /// const encrypted = await fhevm.createEncryptedInput(contractAddress, userAddress)
    ///   .add32(123)  // Encrypt the value 123
    ///   .encrypt();
    ///
    /// // encrypted.handles[0] = the handle
    /// // encrypted.inputProof = the proof of correct encryption
    ///
    /// // Send to contract
    /// await contract.processHandle(encrypted.handles[0], encrypted.inputProof);
    /// ```
    ///
    /// SMART CONTRACT SIDE (Solidity):
    /// 1. Contract receives handle and proof
    /// 2. Contract calls FHE.asEuint32(handle, proof)
    /// 3. FHE coprocessor validates proof
    /// 4. If valid, internal encrypted value is created
    /// 5. Contract can now use the encrypted value
    ///
    /// KEY POINTS:
    /// ✅ Handle is generated client-side
    /// ✅ Handle is deterministic based on encryption parameters
    /// ✅ Proof proves handle is valid
    /// ✅ Contract verifies proof before accepting handle
    /// ✅ Without proof, handle could be forged
    function howHandlesAreGenerated() external pure {
        // Documentation only
    }

    /// @notice Stores handles as internal encrypted values
    mapping(address => euint32) private storedHandles;

    /// @notice Process an encrypted handle
    /// @param input External encrypted input (handle + data)
    /// @param proof Proof validating the handle
    /// @dev Shows how to work with handles
    function processHandle(inEuint32 calldata input, bytes calldata proof) external {
        // Convert external handle to internal encrypted value
        // FHE coprocessor validates proof and creates internal reference
        euint32 encryptedValue = FHE.asEuint32(input, proof);

        // Store the internal encrypted value
        storedHandles[msg.sender] = encryptedValue;

        // Grant permissions
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);
    }

    /// @notice Demonstrate handle lifecycle
    /// @param input Encrypted input
    /// @param proof Proof for input
    /// @dev Shows handle creation and usage across operations
    function handleLifecycle(inEuint32 calldata input, bytes calldata proof) external {
        // STEP 1: Handle Creation
        // External handle received from client
        // (input parameter is the handle from client)

        // STEP 2: Handle Validation
        // Proof validates the handle is legitimate
        euint32 step2Value = FHE.asEuint32(input, proof);

        // STEP 3: Handle Usage
        // Use the handle in FHE operations
        euint32 step3Value = FHE.add(step2Value, FHE.asEuint32(10));

        // STEP 4: Handle Preservation
        // Handles are preserved through operations
        // The result of FHE.add is a new handle pointing to new encrypted value
        storedHandles[msg.sender] = step3Value;

        // STEP 5: Handle Persistence
        // Handles persist in storage
        // Can be retrieved and used later in new transactions
        FHE.allowThis(step3Value);
        FHE.allow(step3Value, msg.sender);
    }

    /// @notice Understand symbolic execution
    /// @dev Symbolic execution in FHE context
    ///
    /// WHAT IS SYMBOLIC EXECUTION?
    /// Symbolic execution means the FHE system evaluates operations on encrypted data
    /// without knowing the plaintext values.
    ///
    /// EXAMPLE:
    /// ```
    /// let x = encrypt(5)  // x is a handle to encrypted 5
    /// let y = encrypt(3)  // y is a handle to encrypted 3
    ///
    /// result = FHE.add(x, y)  // result is handle to encrypted (5+3)
    ///
    /// The contract doesn't know that:
    /// - x represents 5
    /// - y represents 3
    /// - result represents 8
    ///
    /// But the FHE coprocessor knows and performs the addition correctly!
    /// ```
    ///
    /// KEY POINTS:
    /// ✅ All operations happen on encrypted values
    /// ✅ Handles track which encrypted value is which
    /// ✅ Coprocessor maintains encryption throughout
    /// ✅ No plaintext exposure during operations
    ///
    /// HANDLE ROLE IN SYMBOLIC EXECUTION:
    /// - Handles track which encrypted value each variable refers to
    /// - Operations create new handles for operation results
    /// - Handles enable correct operation on encrypted data
    function symbolicExecution() external pure {
        // Documentation only
    }

    /// @notice Demonstrate handle manipulation
    /// @dev Shows various operations that modify handles
    function handleManipulation(
        inEuint32 calldata input1,
        bytes calldata proof1,
        inEuint32 calldata input2,
        bytes calldata proof2
    ) external {
        // Handle 1: Encrypt value 1
        euint32 handle1 = FHE.asEuint32(input1, proof1);

        // Handle 2: Encrypt value 2
        euint32 handle2 = FHE.asEuint32(input2, proof2);

        // Handle 3: Add operation creates new handle
        euint32 handle3 = FHE.add(handle1, handle2);

        // Handle 4: Multiply by constant creates another new handle
        euint32 handle4 = FHE.mul(handle3, FHE.asEuint32(2));

        // Handle 5: Comparison creates new handle with boolean result
        euint32 comparison = FHE.gt(handle4, FHE.asEuint32(100));

        // Each operation produced new handle pointing to new encrypted result
        storedHandles[msg.sender] = handle4;

        FHE.allowThis(handle4);
        FHE.allow(handle4, msg.sender);
    }

    /// @notice Handle lifetime and scope
    /// @dev Understanding when handles are valid
    ///
    /// HANDLE SCOPE:
    /// ✅ Valid within transaction
    /// ✅ Handles can be stored in contract state
    /// ✅ Stored handles persist across transactions
    /// ✅ External handles (client input) only valid in that transaction
    ///
    /// HANDLE CREATION:
    /// ✅ Client-side: When value is encrypted
    /// ✅ Contract-side: When operation creates result
    ///
    /// HANDLE DESTRUCTION:
    /// ✅ Implicit: Transaction ends
    /// ✅ Explicit: Delete from storage (rare)
    /// ✅ Not needed: Smart contract memory is ephemeral
    ///
    /// BEST PRACTICES:
    /// ✅ Store important encrypted values in contract state
    /// ✅ Local variables for temporary computations
    /// ✅ Map plaintext identifiers to handles
    /// ✅ Clean up unused handles when needed
    function handleLifetime() external pure {
        // Documentation only
    }

    /// @notice Handle binding to [contract, user] pair
    /// @dev Why handles are bound to contract and user
    ///
    /// BINDING CONCEPT:
    /// When a handle is created, it's bound to:
    /// 1. Specific contract address
    /// 2. Specific user address
    ///
    /// This binding ensures:
    /// ✅ Handle cannot be used on different contract
    /// ✅ Handle cannot be used by different user
    /// ✅ Prevents cross-contract or cross-user attacks
    ///
    /// VALIDATION:
    /// The input proof validates the [contract, user] binding
    /// Without valid proof, bound handle is rejected
    ///
    /// IMPLICATIONS:
    /// ✅ Can't copy encrypted value from one contract to another
    /// ✅ Can't copy encrypted value from one user to another
    /// ✅ Each contract/user combination is isolated
    /// ✅ Increases security model
    function handleBinding() external pure {
        // Documentation only
    }

    /// @notice ❌ ANTI-PATTERN: Incorrect handle usage
    /// @dev Shows common mistakes with handles
    function BAD_handleMisuse(inEuint32 calldata input, bytes calldata proof) external {
        euint32 value = FHE.asEuint32(input, proof);

        // ❌ MISTAKE 1: Not granting permissions
        // ❌ This causes later operations to fail
        // FHE.allowThis(value);  // Missing!
        // FHE.allow(value, msg.sender);  // Missing!

        // ❌ MISTAKE 2: Assuming handle is plaintext
        // uint32 plaintext = uint32(value);  // This doesn't work!
        // Handles cannot be cast to plaintext

        // ❌ MISTAKE 3: Trying to compare handles directly
        // if (value == 5) { }  // This doesn't work!
        // Must use FHE.eq for encrypted comparison

        // ❌ MISTAKE 4: Using handle in conditionals
        // if (value) { }  // This doesn't work!
        // Cannot branch on encrypted values
    }

    /// @notice Handle summary and key points
    /// @dev Recap of important concepts
    ///
    /// KEY POINTS TO REMEMBER:
    ///
    /// 1. DEFINITION:
    ///    - Handle = reference to encrypted value
    ///    - Not the encrypted data itself
    ///    - Not a cryptographic key
    ///    - Memory reference/pointer
    ///
    /// 2. GENERATION:
    ///    - Client-side: FHE client library generates handle
    ///    - Contract-side: FHE operations generate result handles
    ///    - Always paired with proof (on input)
    ///
    /// 3. VALIDATION:
    ///    - Proof validates handle is legitimate
    ///    - Proof proves [contract, user] binding
    ///    - Contract must verify proof
    ///
    /// 4. LIFECYCLE:
    ///    - Created when value is encrypted
    ///    - Modified by operations
    ///    - Stored in contract state
    ///    - Deleted when storage cleared
    ///
    /// 5. OPERATIONS:
    ///    - Each FHE operation takes handles
    ///    - Each FHE operation produces new handle
    ///    - Handles enable correct symbolic execution
    ///    - No plaintext exposure during ops
    ///
    /// 6. SECURITY:
    ///    - Bound to [contract, user]
    ///    - Cannot be forged
    ///    - Cannot be transferred between contexts
    ///    - Input proofs provide security
    ///
    /// 7. COMMON MISTAKES:
    ///    - ❌ Forgetting permissions
    ///    - ❌ Treating handle as plaintext
    ///    - ❌ Comparing handles directly
    ///    - ❌ Using handle in if statements
    ///    - ❌ Assuming handle value
    function handleSummary() external pure {
        // Documentation only
    }
}
