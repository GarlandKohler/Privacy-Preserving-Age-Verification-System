# Quick Start Guide

Get up and running with the Privacy-Preserving Age Verification System in 5 minutes.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 8+ (comes with Node.js)
- Git
- Code editor (VS Code recommended)

## Installation (2 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/privacy-age-verification-system.git
cd privacy-age-verification-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration (optional for local testing).

## Compilation (1 minute)

### Compile Smart Contracts

```bash
npm run compile
```

You should see:
```
✓ 5 contracts compiled successfully
```

## Testing (1 minute)

### Run Test Suite

```bash
npm test
```

You should see all tests pass:
```
✓ 50+ tests passing
✓ All contracts tested
```

## Deployment (1 minute)

### Deploy to Local Network

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:localhost
```

### Deploy to Sepolia Testnet

```bash
# 1. Add Sepolia RPC URL to .env.local
SEPOLIA_RPC_URL=https://rpc.sepolia.dev/

# 2. Add your private key
PRIVATE_KEY=your_private_key_here

# 3. Deploy
npm run deploy:sepolia
```

## Usage Examples

### Example 1: Submit Age

```typescript
// Assuming you have the contract instance
const tx = await contract.submitEncryptedAge(25);
await tx.wait();
console.log("Age submitted!");
```

### Example 2: Verify Adult Status

```typescript
const result = await contract.getVerificationResult();
console.log("Verification result:", result);
```

### Example 3: Add Verifier

```typescript
const verifierAddress = "0x...";
const tx = await contract.addAuthorizedVerifier(verifierAddress);
await tx.wait();
console.log("Verifier added!");
```

## Project Structure

```
privacy-age-verification-system/
├── contracts/                 # Smart contracts
│   ├── PrivateAgeVerification.sol
│   ├── VerifierRegistry.sol
│   ├── AgeRangeVerification.sol
│   ├── MultiPartyVerification.sol
│   └── AuditedVerification.sol
├── test/                      # Test suites
│   ├── PrivateAgeVerification.test.ts
│   └── VerifierRegistry.test.ts
├── scripts/                   # Automation scripts
│   ├── deploy.ts
│   ├── create-example.ts
│   └── generate-docs.ts
├── docs/                      # Generated documentation
├── hardhat.config.ts
├── package.json
└── README.md
```

## Common Commands

| Command | Description |
|---------|------------|
| `npm run compile` | Compile all contracts |
| `npm test` | Run test suite |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:gas` | Run tests with gas reporting |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run generate-docs` | Generate documentation |
| `npm run create-example` | Create standalone example |
| `npm run lint` | Lint Solidity code |
| `npm run format` | Format code |

## Next Steps

1. **Read Documentation**
   - [README.md](./README.md) - Project overview
   - [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development instructions
   - [TECHNICAL_SPECIFICATIONS.md](./TECHNICAL_SPECIFICATIONS.md) - Technical details

2. **Explore Contracts**
   - [PrivateAgeVerification.sol](./contracts/PrivateAgeVerification.sol)
   - [VerifierRegistry.sol](./contracts/VerifierRegistry.sol)
   - [Other contracts](./contracts/)

3. **Review Tests**
   - [PrivateAgeVerification Tests](./test/PrivateAgeVerification.test.ts)
   - [VerifierRegistry Tests](./test/VerifierRegistry.test.ts)

4. **Understand Architecture**
   - [System Architecture](./ARCHITECTURE.md)
   - [FHE Concepts](./FAQ_AND_BEST_PRACTICES.md)

## Troubleshooting

### "Cannot find module '@fhevm/solidity'"

```bash
npm install @fhevm/solidity @fhevm/hardhat-plugin
```

### "Compilation failed"

Make sure you have Solidity 0.8.24 or later:

```bash
npm install solc@0.8.24
```

### Tests timeout

Increase timeout in hardhat.config.ts:

```typescript
mocha: {
  timeout: 60000  // 60 seconds
}
```

## Frequently Asked Questions

**Q: Do I need a wallet to test locally?**
A: No, Hardhat provides test accounts automatically.

**Q: Can I deploy to testnet without ETH?**
A: Use a [faucet](https://sepoliafaucet.com/) to get free Sepolia ETH.

**Q: How do I verify my contract on Etherscan?**
A: Add your Etherscan API key to .env and run:
```bash
npm run verify -- --network sepolia <ADDRESS>
```

**Q: Where can I get help?**
A: Ask on [Zama Discord](https://discord.com/invite/zama)

## Resources

- **Official Docs**: [FHEVM Documentation](https://docs.zama.ai/fhevm)
- **Community**: [Zama Discord](https://discord.com/invite/zama)
- **Forum**: [Community Forum](https://www.zama.ai/community)
- **GitHub**: [Zama GitHub](https://github.com/zama-ai)

## What's Next?

1. Explore the contract functionality
2. Write your own tests
3. Deploy to testnet
4. Create example projects using the automation scripts
5. Contribute to the project!

---

**Happy coding! 🚀**

For detailed information, see the [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md).
