# Submission Requirements

This document outlines all requirements and guidelines for submitting your privacy-preserving age verification system implementation to the competition.

---

## Overview

All submissions must be complete, working implementations that demonstrate production-ready code quality and comprehensive documentation. This challenge is designed to create educational resources for the FHE development community.

---

## Code Requirements

### 1. Smart Contract Deliverables

#### Minimum Scope
- **Minimum 5 Contract Variations**:
  1. Core PrivateAgeVerification contract (enhanced version)
  2. Access control contract (RoleBasedVerification or similar)
  3. Extended verification contract (AgeRangeVerification)
  4. Multi-party verification contract
  5. At least one advanced pattern contract (audit trails, delegation, etc.)

#### Quality Standards
- ✅ All contracts must compile without errors or warnings
- ✅ Must follow Solidity 0.8.24+ standards
- ✅ Include comprehensive NatSpec documentation
- ✅ Demonstrate FHE best practices and patterns
- ✅ Include error handling and input validation
- ✅ Proper access control implementation
- ✅ Clear comments explaining FHE-specific logic

#### Structure Example
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivateAgeVerification
 * @notice Enhanced privacy-preserving age verification system
 * @dev Uses FHE for all age comparisons and storage
 */
contract PrivateAgeVerification is SepoliaConfig {
    // ... well-documented implementation
}
```

### 2. Test Suite Deliverables

#### Minimum Requirements
- **Minimum 50 Test Cases** across all contracts:
  - At least 10 unit tests per core contract
  - Integration tests for contract interactions
  - Security-focused tests for permission enforcement
  - Error handling and edge case tests

#### Test Categories

**Unit Tests**:
```typescript
- Function execution tests (success path)
- Input validation tests
- Permission validation tests
- State change verification
- Event emission verification
```

**Integration Tests**:
```typescript
- Multi-contract interactions
- User workflow scenarios
- Verifier authorization flows
- Cross-contract permission management
```

**Security Tests**:
```typescript
- Permission enforcement validation
- Unauthorized access attempts
- Boundary condition testing
- Re-entrancy prevention
```

**Error Tests**:
```typescript
- Common FHE anti-patterns
- Invalid input handling
- Missing permission scenarios
- Edge cases and boundary conditions
```

#### Test Quality Standards
- ✅ Use descriptive test names (✅ for passing, ❌ for failing scenarios)
- ✅ Include comments explaining test purpose
- ✅ Test both success and failure paths
- ✅ Achieve >85% code coverage
- ✅ All tests must pass consistently
- ✅ Use proper setup and teardown fixtures

#### Example Test Structure
```typescript
describe("Contract Name", function () {
    describe("Feature/Function", function () {
        it("✅ Should [expected behavior]", async function () {
            // Test implementation
        });

        it("❌ Should reject [invalid scenario]", async function () {
            // Error test implementation
        });
    });
});
```

---

## Automation Scripts

### Required Scripts

#### 1. Example Generation Script
**File**: `scripts/create-example.ts`

**Functionality**:
```bash
npm run create-example privacy-age-verification ./output-dir
```

**Requirements**:
- ✅ Clone base template repository
- ✅ Copy specified contract and test files
- ✅ Update configuration files (hardhat.config.ts, package.json)
- ✅ Generate README for the example
- ✅ Create .env.example template
- ✅ Validate generated project compiles

**Output Structure**:
```
output-dir/
├── contracts/
│   └── PrivateAgeVerification.sol
├── test/
│   └── PrivateAgeVerification.test.ts
├── hardhat.config.ts
├── package.json
├── README.md
├── .env.example
└── tsconfig.json
```

#### 2. Documentation Generation Script
**File**: `scripts/generate-docs.ts`

**Functionality**:
```bash
npm run generate-docs
```

**Requirements**:
- ✅ Extract contract code and documentation
- ✅ Extract test code and explanations
- ✅ Generate formatted markdown files
- ✅ Create GitBook-compatible structure
- ✅ Generate SUMMARY.md index
- ✅ Include code syntax highlighting

**Output Structure**:
```
docs/
├── SUMMARY.md
├── guides/
│   ├── getting-started.md
│   ├── core-concepts.md
│   └── advanced-patterns.md
├── examples/
│   ├── basic-verification.md
│   ├── advanced-patterns.md
│   └── integration-guide.md
└── api/
    └── contract-reference.md
```

#### 3. Testing Automation Script
**File**: `scripts/test-suite.ts`

**Functionality**:
```bash
npm run test:all
npm run test:coverage
```

**Requirements**:
- ✅ Run all tests in project
- ✅ Generate coverage reports
- ✅ Display test results summary
- ✅ Exit with appropriate status codes

---

## Documentation Deliverables

### 1. README.md

**Required Sections**:
- Project overview and goals
- Key features and capabilities
- Quick start guide
- Installation instructions
- Usage examples
- Architecture explanation
- Running tests
- Deployment guide
- Troubleshooting
- Contributing guidelines
- License information

**Example Structure**:
```markdown
# Privacy-Preserving Age Verification Suite

## Overview
[Project description...]

## Features
- Feature 1
- Feature 2

## Quick Start
[Setup instructions...]

## Architecture
[System design...]

## Documentation
[Link to detailed docs...]

## Contributing
[Contribution guidelines...]

## License
MIT
```

### 2. Developer Guide (DEVELOPMENT_GUIDE.md)

**Required Sections**:
- Prerequisites and setup
- Environment configuration
- Project structure explanation
- Contract development guide
- Test development guide
- Common patterns and best practices
- Troubleshooting guide
- FHE-specific guidelines

### 3. Technical Documentation

#### Contract Reference (docs/api/CONTRACT_REFERENCE.md)
- Complete function documentation
- Parameter descriptions
- Return value specifications
- Event documentation
- Error messages and handling

#### Getting Started Guide (docs/guides/GETTING_STARTED.md)
- Installation steps
- First deployment
- Basic usage example
- Connecting to testnet
- Viewing contract state

#### Core Concepts Guide (docs/guides/CORE_CONCEPTS.md)
- FHE encryption model explanation
- Handle generation and lifecycle
- Permission system architecture
- Encryption binding details
- Zero-knowledge proofs overview

#### Examples Documentation (docs/examples/)
- Basic verification example
- Age range verification example
- Multi-user verification example
- Advanced patterns example

### 4. Code Examples

All contracts should include:
- **NatSpec Comments**: Full documentation of functions, parameters, and return values
- **Inline Comments**: Explanation of complex FHE operations
- **Example Patterns**: Demonstration of correct vs incorrect usage

Example Format:
```solidity
/**
 * @notice Verifies if a user is an adult
 * @param user The user address to verify
 * @return isAdult Boolean indicating if user is 18 or older
 *
 * @dev This function demonstrates:
 * - Encrypted data comparison
 * - Permission grant pattern (FHE.allowThis + FHE.allow)
 * - Return type handling (ebool)
 */
function verifyAdult(address user) external returns (ebool) {
    euint8 age = encryptedAges[user];
    ebool result = FHE.ge(age, FHE.asEuint8(18));

    FHE.allowThis(result);
    FHE.allow(result, user);

    return result;
}
```

---

## Demonstration Video Requirements

### Mandatory Requirements
- ✅ **Duration**: 5-15 minutes
- ✅ **Quality**: Clear audio and screen recording (1080p+ recommended)
- ✅ **Content**: Must demonstrate all of the following:

### Required Content

#### 1. Project Setup (1-2 minutes)
- Clone repository
- Install dependencies
- Show project structure
- Verify installation success

#### 2. Contract Overview (1-2 minutes)
- Explain core concepts
- Show contract files
- Highlight key functions
- Discuss FHE patterns used

#### 3. Testing Demonstration (2-3 minutes)
- Run test suite
- Show test output
- Demonstrate coverage
- Explain key test cases

#### 4. Automation Tools in Action (2-3 minutes)
- Run example generation script
- Show generated output
- Run generated project's tests
- Run documentation generation
- Show generated documentation

#### 5. Deployment and Usage (1-2 minutes)
- Show deployment script
- Demonstrate contract interaction
- Run a complete workflow
- Show transaction results

#### 6. Summary and Discussion (30-60 seconds)
- Recap implementation
- Highlight key achievements
- Discuss challenges faced
- Suggest future improvements

### Video Submission Format
- Format: MP4, WebM, or MOV
- Codec: H.264 (video), AAC (audio)
- Upload to YouTube (unlisted OK) or provide download link
- Include link in submission

---

## Repository Structure Requirements

```
your-privacy-verification-suite/
│
├── README.md                          # Main project documentation
├── DEVELOPMENT_GUIDE.md               # Developer guide
├── SUBMISSION_REQUIREMENTS.md         # This file
├── LICENSE                            # MIT or compatible
├── .gitignore                         # Exclude node_modules, etc.
├── .env.example                       # Environment template
│
├── base-template/                     # Reusable Hardhat template
│   ├── contracts/
│   │   ├── PrivateAgeVerification.sol
│   │   └── utils/
│   ├── test/
│   │   ├── fixtures.ts
│   │   └── PrivateAgeVerification.test.ts
│   ├── hardhat.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── contracts/                         # All source contracts
│   ├── core/
│   │   ├── PrivateAgeVerification.sol
│   │   ├── VerifierRegistry.sol
│   │   └── PermissionManager.sol
│   ├── access-control/
│   │   ├── RoleBasedVerification.sol
│   │   └── TimeBasedPermissions.sol
│   ├── extensions/
│   │   ├── MultiPartyVerification.sol
│   │   └── AuditedVerification.sol
│   └── patterns/
│       └── CommonPatterns.sol
│
├── test/                              # Test files (mirror structure)
│   ├── core/
│   │   ├── PrivateAgeVerification.test.ts
│   │   ├── VerifierRegistry.test.ts
│   │   └── PermissionManager.test.ts
│   ├── access-control/
│   │   ├── RoleBasedVerification.test.ts
│   │   └── TimeBasedPermissions.test.ts
│   ├── extensions/
│   │   ├── MultiPartyVerification.test.ts
│   │   └── AuditedVerification.test.ts
│   ├── patterns/
│   │   └── CommonPatterns.test.ts
│   ├── fixtures.ts
│   └── setup.ts
│
├── scripts/                           # Automation tools
│   ├── create-example.ts              # Example generation
│   ├── generate-docs.ts               # Documentation generation
│   ├── test-suite.ts                  # Testing automation
│   └── README.md                      # Scripts documentation
│
├── docs/                              # Documentation
│   ├── SUMMARY.md                     # GitBook index
│   ├── guides/
│   │   ├── getting-started.md
│   │   ├── core-concepts.md
│   │   ├── common-patterns.md
│   │   └── troubleshooting.md
│   ├── examples/
│   │   ├── basic-verification.md
│   │   ├── age-range-verification.md
│   │   ├── multi-user-comparison.md
│   │   └── advanced-patterns.md
│   ├── api/
│   │   ├── contract-reference.md
│   │   └── function-glossary.md
│   └── videos/
│       └── DEMO_NOTES.md
│
├── package.json                       # Root dependencies
├── tsconfig.json                      # TypeScript configuration
├── hardhat.config.ts                  # Hardhat configuration
└── .github/
    └── workflows/
        └── tests.yml                  # CI/CD pipeline (optional)
```

---

## Code Quality Standards

### Solidity Best Practices
- ✅ Use consistent naming conventions (camelCase for functions/variables)
- ✅ Include comprehensive error messages
- ✅ Implement proper access control
- ✅ Follow CEI pattern (Checks, Effects, Interactions)
- ✅ Avoid using magic numbers (use named constants)
- ✅ Include natspec documentation for all public functions

### TypeScript/JavaScript Best Practices
- ✅ Use strict TypeScript configuration
- ✅ Proper error handling
- ✅ Clear variable and function names
- ✅ Consistent code formatting
- ✅ Comprehensive comments on complex logic

### Testing Best Practices
- ✅ Use descriptive test names
- ✅ One assertion per test (or related assertions)
- ✅ Setup/teardown for test isolation
- ✅ Mock external dependencies
- ✅ Test error cases
- ✅ Maintain >85% code coverage

---

## Compilation and Testing Requirements

### Build Requirements
```bash
# Must compile without errors
npm run compile

# All tests must pass
npm run test

# No TypeScript errors
npm run type-check

# Linting should pass
npm run lint
```

### Expected Output
```
✓ 50+ tests passing
✓ 85%+ code coverage
✓ 0 compilation errors
✓ 0 TypeScript errors
✓ 0 linting errors
```

---

## Submission Checklist

Before submitting, verify the following:

### Code Completeness
- [ ] 5+ contract variations implemented
- [ ] 50+ test cases passing
- [ ] All tests pass: `npm test`
- [ ] No compilation errors: `npm run compile`
- [ ] Coverage >85%: `npm run test:coverage`

### Documentation Completeness
- [ ] README.md is comprehensive
- [ ] DEVELOPMENT_GUIDE.md is complete
- [ ] API documentation generated
- [ ] Examples documentation created
- [ ] Troubleshooting guide included
- [ ] All inline code comments are present

### Automation Scripts
- [ ] Example generation works: `npm run create-example`
- [ ] Documentation generation works: `npm run generate-docs`
- [ ] Generated examples compile and test
- [ ] All scripts are documented

### Repository Requirements
- [ ] Public GitHub repository
- [ ] Proper .gitignore configuration
- [ ] LICENSE file (MIT or compatible)
- [ ] Clear commit history
- [ ] Meaningful commit messages

### Demonstration Video
- [ ] Video uploaded (YouTube/Link provided)
- [ ] 5-15 minute duration
- [ ] 1080p+ quality
- [ ] Clear audio
- [ ] Covers all required content
- [ ] Link provided in submission

### Final Verification
- [ ] Repository URL is public and accessible
- [ ] All code is present and readable
- [ ] Video link is accessible
- [ ] No broken links in documentation
- [ ] All file paths are correct

---

## Submission Process

### Step 1: Prepare Repository
1. Create public GitHub repository
2. Push all code and documentation
3. Verify all tests pass
4. Create release/tag for submission

### Step 2: Record Video
1. Record demonstration video (5-15 minutes)
2. Upload to YouTube or hosting service
3. Create unlisted link if preferred
4. Verify audio and video quality

### Step 3: Submit via Guild
1. Go to [Guild - Zama Bounty Program](https://guild.xyz/zama/bounty-program)
2. Click "Submit" for this competition
3. Provide:
   - GitHub repository URL
   - Video demonstration link
   - Brief description of your implementation
   - Any additional notes

### Step 4: Confirmation
- You'll receive confirmation of submission
- Judges will evaluate submissions after deadline
- Winners announced within 2 weeks

---

## Late Submissions

- Submissions received after **December 31, 2025 23:59 AoE** will not be accepted
- Verify your timezone and plan accordingly
- We recommend submitting at least 24 hours before deadline

---

## Questions?

- **Discord**: [Zama Discord](https://discord.com/invite/zama)
- **Forum**: [Community Forum](https://www.zama.ai/community)
- **Email**: Check Guild platform for contact information

---

**Good luck with your submission!**

We're excited to see what you build with privacy-preserving technologies.
