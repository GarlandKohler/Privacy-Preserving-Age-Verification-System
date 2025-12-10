# Privacy-Preserving Age Verification System Challenge

**Competition Period**: December 2025
**Submission Deadline**: December 31, 2025 (23:59 AoE)
**Prize Pool**: $10,000
**Technology**: Fully Homomorphic Encryption (FHE) via Zama

---

## 🎯 Challenge Overview

This bounty challenges developers to build upon and enhance the **Private Age Verification System** - a revolutionary approach to age verification that leverages Fully Homomorphic Encryption to preserve user privacy while ensuring compliance and security.

The goal is to create production-ready examples, comprehensive documentation, and automated tools that demonstrate how to build privacy-preserving age verification systems and similar compliance-focused applications using FHEVM (FHE Virtual Machine).

### Why This Challenge Matters

Traditional age verification systems require collecting and storing sensitive personal information. This challenge demonstrates that with FHE technology, we can:

- Verify age without knowing or storing actual age data
- Perform compliance checks on encrypted data
- Maintain immutable verification records on blockchain
- Eliminate privacy concerns for users
- Create a new standard for confidential identity verification

---

## 📋 Scope of Work

### 1. Enhanced Smart Contracts

Develop a suite of Solidity contracts demonstrating various aspects of privacy-preserving verification:

#### Core Requirements
- **Main Contract**: Enhanced PrivateAgeVerification system with:
  - Support for multiple verification types (age verification, age range checking, comparative age verification)
  - Comprehensive access control patterns
  - Emergency pause functionality
  - Verification history tracking with privacy guarantees

- **Supporting Contracts**:
  - Access control implementation examples
  - Permission management patterns
  - Error handling for common FHE pitfalls
  - Multi-party verification scenarios

#### Advanced Features
- Cross-contract verification delegations
- Role-based access control for verifiers
- Time-based verification expiration
- Decryption authorization for authorized parties
- Audit trail with encrypted logging

### 2. Test Suites

Create comprehensive test suites covering:

#### Unit Tests
- Individual FHE operations (comparison, range checking, logical operations)
- Permission and access control validation
- State management and data persistence
- Edge cases and boundary conditions

#### Integration Tests
- Multi-step verification workflows
- Cross-contract interactions
- Verifier authorization flows
- Emergency pause and recovery procedures

#### Security Tests
- Input validation edge cases
- Permission enforcement verification
- Encryption/decryption lifecycle testing
- Re-entrance and race condition prevention

#### Error Handling Tests
- Common FHE anti-patterns and how to avoid them
- Missing permission grants
- Mismatched encryption signers
- View function restrictions on encrypted data

### 3. Documentation

Comprehensive documentation including:

#### Technical Documentation
- FHE encryption model explanation
- Handle generation and lifecycle
- Permission system architecture
- Common pitfalls and solutions

#### Developer Guides
- Quick start guide for using the system
- Step-by-step tutorials for each contract
- Integration patterns for third-party systems
- Troubleshooting common issues

#### API Documentation
- Complete contract interface documentation
- Function parameter explanations
- Event descriptions and use cases
- Return value specifications

#### Example Implementations
- Basic age verification flow
- Age range checking scenarios
- Multi-user verification comparisons
- Role-based verifier scenarios

### 4. Automation Scripts

Create TypeScript-based tools for:

#### Project Scaffolding
```bash
npm run create-example privacy-age-verification ./output-dir
```
- Clones and customizes base Hardhat template
- Copies contract and test files
- Updates configuration files
- Generates documentation

#### Documentation Generation
```bash
npm run generate-docs
```
- Extracts code examples from contracts and tests
- Creates formatted markdown documentation
- Generates GitBook-compatible documentation
- Creates visual diagrams where helpful

#### Testing Automation
- Automated test execution across examples
- Coverage reporting
- Performance benchmarking
- Deployment simulation

### 5. Base Template

Provide a complete, minimal Hardhat configuration that includes:

```
base-template/
├── contracts/
│   ├── PrivateAgeVerification.sol    # Main contract template
│   └── VerifierRole.sol               # Access control template
├── test/
│   ├── PrivateAgeVerification.test.ts # Test template
│   └── fixtures.ts                    # Test fixtures and utilities
├── hardhat.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── .env.example
```

---

## 🏗️ Project Structure

Your submission must follow this structure:

```
privacy-age-verification-suite/
│
├── base-template/
│   ├── contracts/
│   ├── test/
│   ├── hardhat.config.ts
│   ├── package.json
│   └── README.md
│
├── contracts/
│   ├── core/
│   │   ├── PrivateAgeVerification.sol
│   │   └── VerifierRegistry.sol
│   ├── access-control/
│   │   ├── RoleBasedVerification.sol
│   │   └── TimeBasedPermissions.sol
│   ├── extensions/
│   │   ├── MultiPartyVerification.sol
│   │   └── AuditedVerification.sol
│   └── patterns/
│       └── CommonPatterns.sol
│
├── test/
│   ├── core/
│   ├── access-control/
│   ├── extensions/
│   └── patterns/
│
├── scripts/
│   ├── create-example.ts
│   ├── generate-docs.ts
│   ├── test-suite.ts
│   └── README.md
│
├── docs/
│   ├── SUMMARY.md
│   ├── guides/
│   │   ├── getting-started.md
│   │   ├── core-concepts.md
│   │   └── tutorials.md
│   ├── examples/
│   │   ├── basic-verification.md
│   │   ├── advanced-patterns.md
│   │   └── integration-guide.md
│   └── api/
│       └── contract-reference.md
│
├── package.json
├── tsconfig.json
├── README.md
└── DEVELOPMENT_GUIDE.md
```

---

## 📊 Key Deliverables

### Required
1. **Enhanced Contracts**: Minimum 5 contract variations demonstrating different verification patterns
2. **Test Suite**: Minimum 50 test cases covering all contract functionality
3. **Documentation**: Complete documentation for all contracts and functions
4. **Automation Tools**: Working scripts for example generation and documentation
5. **Base Template**: Ready-to-use Hardhat template with all dependencies
6. **Developer Guide**: Step-by-step guide for using and extending the system

### Bonus Points
- **Additional Examples**: Age range verification, multi-party verification, role-based access
- **Advanced Patterns**: Blind authentication, decryption delegation, audit trails
- **Interactive Tutorials**: Step-by-step guides with code walkthroughs
- **Video Demonstrations**: Setup, deployment, and usage walkthroughs
- **Performance Analysis**: Gas optimization tips and benchmarks
- **Security Analysis**: Detailed explanation of security measures and threat model

---

## 🎓 Learning Outcomes

Developers working on this challenge will learn:

### Cryptographic Concepts
- Fully Homomorphic Encryption fundamentals
- Encryption binding and handles
- Zero-knowledge proofs for input validation
- Decryption authorization mechanisms

### Solidity Patterns
- FHE-specific programming patterns
- Permission and access control design
- State management with encrypted data
- Error handling in cryptographic contexts

### Smart Contract Security
- Privacy preservation techniques
- Secure cryptographic operations
- Preventing common FHE anti-patterns
- Audit trail implementation

---

## ✅ Submission Requirements

All submissions must include:

1. **GitHub Repository**: Well-organized, publicly accessible repository
2. **Demonstration Video**:
   - Show the project setup and installation
   - Demonstrate key features in action
   - Show automated tools working (example generation, documentation generation)
   - Run test suites and show results
   - Deployment to testnet (optional but encouraged)
   - **Duration**: 5-15 minutes
   - **Quality**: Clear audio and screen sharing

3. **Comprehensive README**:
   - Project overview and goals
   - Installation and setup instructions
   - Usage examples and tutorials
   - Architecture explanation
   - Troubleshooting guide

4. **Complete Documentation**:
   - Contract function reference
   - Test coverage report
   - Example documentation
   - Developer guide

5. **Working Code**:
   - All contracts compile without errors
   - All tests pass
   - Scripts execute successfully
   - Examples generate correctly

6. **Deployment Artifacts** (Optional):
   - Deployment scripts
   - Testnet addresses
   - Verification reports

---

## 🏆 Judging Criteria

Submissions will be evaluated on:

### Code Quality (25%)
- Clean, readable, well-structured code
- Comprehensive comments and documentation
- Following Solidity best practices
- Proper error handling and validation

### Automation Completeness (20%)
- Example generation tools function properly
- Documentation generation is comprehensive
- Scripts are well-documented and maintainable
- Error handling in automation scripts

### Example Quality (20%)
- Examples demonstrate clear concepts
- Code is educational and well-commented
- Examples progress from basic to advanced
- Real-world applicability

### Documentation (20%)
- Clear explanations of concepts
- Comprehensive API documentation
- Step-by-step tutorials
- Troubleshooting guides

### Innovation & Polish (15%)
- Creative enhancements to the core concept
- Exceptional user experience
- Maintenance tools and utilities
- Performance optimizations
- Advanced patterns and demonstrations

---

## 📚 Reference Materials

### Official Documentation
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [Solidity FHE Library](https://docs.zama.ai/fhevm/fundamentals/solidity_lib)
- [Input Proofs & Encryption](https://docs.zama.ai/fhevm/fundamentals/input_proofs)

### Reference Projects
- Base Hardhat Template: `D:\\fhevm-hardhat-template-main\fhevm-hardhat-template-main`
- Example Implementation: `D:\\zama-bounty-11-example-project-main\zama-bounty-11-example-project-main`
- OpenZeppelin Confidential: `D:\\openzeppelin-confidential-contracts-master\openzeppelin-confidential-contracts-master`
- Existing dApps: `D:\\dapps-main\dapps-main`

### Community Resources
- [Zama Community Forum](https://www.zama.ai/community)
- [Zama Discord](https://discord.com/invite/zama)
- [Zama on GitHub](https://github.com/zama-ai)

---

## 🚀 How to Submit

1. **Create Repository**: Fork or create a new public GitHub repository
2. **Implement Solution**: Build your privacy-preserving age verification system
3. **Record Video**: Create a demonstration video (5-15 minutes)
4. **Submit**:
   - Share GitHub repository link
   - Upload demonstration video
   - Include all documentation
   - Submit through [Guild - Zama Bounty Program](https://guild.xyz/zama/bounty-program)

**Submission Deadline**: December 31, 2025 at 23:59 AoE

---

## ❓ FAQ

**Q: Can I use existing code?**
A: Yes, you can build upon existing examples and patterns, but all code must be properly documented and attribution given.

**Q: What's the minimum scope?**
A: At least 5 contract variations, 50 test cases, automation scripts, and comprehensive documentation.

**Q: Can I work in a team?**
A: Yes, teams are encouraged. Prize may be split among team members.

**Q: What if I find a bug in the template?**
A: Report it on GitHub or in the Discord community. You can work around it in your submission.

**Q: How is the video assessment handled?**
A: The video is mandatory and helps judges understand your implementation. It should clearly demonstrate all features and automation tools.

---

## 📞 Support & Community

- **Discord**: [Zama Discord Server](https://discord.com/invite/zama)
- **Forum**: [Community Forum](https://www.zama.ai/community)
- **Twitter/X**: [@ZamaMPC](https://twitter.com/zama)
- **Telegram**: [Zama Telegram](https://t.me/zama_on_telegram)

---

**Built with ❤️ for the privacy-preserving blockchain future**

Good luck with your submission!
