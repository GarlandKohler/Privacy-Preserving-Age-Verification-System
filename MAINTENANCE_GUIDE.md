# Maintenance Guide

This guide provides instructions for maintaining and updating the Privacy-Preserving Age Verification System, including adding new examples, updating dependencies, and handling version changes.

---

## Table of Contents

1. [Adding New Examples](#adding-new-examples)
2. [Updating Dependencies](#updating-dependencies)
3. [Regenerating Documentation](#regenerating-documentation)
4. [Testing After Updates](#testing-after-updates)
5. [Version Management](#version-management)
6. [Troubleshooting Updates](#troubleshooting-updates)

---

## Adding New Examples

### Step 1: Create Contract

Create a new Solidity contract in the `contracts/` directory:

```solidity
// contracts/YourNewExample.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Your New Example
/// @notice Description of what this example demonstrates
contract YourNewExample is SepoliaConfig {
    // Your implementation here
}
```

**Best Practices:**
- Use NatSpec comments (`///` and `@notice`, `@param`, `@return`)
- Include inline comments explaining FHE concepts
- Demonstrate proper use of `FHE.allowThis()` and `FHE.allow()`
- Show both correct usage and common pitfalls

### Step 2: Create Tests

Create corresponding test file in `test/` directory:

```typescript
// test/YourNewExample.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("YourNewExample", function () {
    // Test setup
    beforeEach(async function () {
        // Deploy contract
    });

    // Success cases with ✅
    it("✅ Should work correctly", async function () {
        // Test implementation
    });

    // Error cases with ❌
    it("❌ Should reject invalid input", async function () {
        // Test error handling
    });
});
```

### Step 3: Update Automation Scripts

Add your example to `scripts/create-example.ts`:

```typescript
const EXAMPLES_MAP: { [key: string]: ExampleConfig } = {
    // ... existing examples
    "your-new-example": {
        name: "Your New Example",
        description: "Description of your example",
        contract: "YourNewExample.sol",
        test: "YourNewExample.test.ts",
        keywords: ["keyword1", "keyword2"],
    },
};
```

Add to `scripts/generate-docs.ts`:

```typescript
const CONTRACTS = [
    // ... existing contracts
    {
        name: "YourNewExample",
        description: "Description of your example",
        file: "contracts/YourNewExample.sol",
    },
];
```

### Step 4: Generate Documentation

Run the documentation generator:

```bash
npm run generate-docs
```

This will create `docs/YourNewExample.md` and update `docs/SUMMARY.md`.

### Step 5: Test the Example

```bash
# Compile
npm run compile

# Run tests
npm test

# Test creating standalone example
npm run create-example your-new-example ./output-test
cd output-test
npm install
npm run compile
npm test
```

---

## Updating Dependencies

### When FHEVM Updates Are Released

When `@fhevm/solidity` or other FHEVM dependencies release new versions:

#### Step 1: Review Release Notes

Before updating, review the release notes:
- Breaking changes
- New features
- Deprecated APIs
- Migration guides

**Official Resources:**
- [FHEVM Releases](https://github.com/zama-ai/fhevm/releases)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)

#### Step 2: Update Package.json

Update the version in `package.json`:

```json
{
  "devDependencies": {
    "@fhevm/solidity": "^0.10.0",  // Update version
    "@fhevm/hardhat": "^0.4.0",     // Update version
    "@zama-fhe/relayer-sdk": "^0.4.0"
  }
}
```

#### Step 3: Install New Versions

```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Clean Hardhat cache
npm run clean

# Install updated dependencies
npm install
```

#### Step 4: Update Imports (if needed)

Check if import statements need updating:

**Old (example):**
```solidity
import { FHE } from "@fhevm/solidity/lib/FHE.sol";
```

**New (example - if path changed):**
```solidity
import { FHE } from "@fhevm/solidity/FHE.sol";
```

#### Step 5: Update Configuration (if needed)

Check if `hardhat.config.ts` needs updates:

```typescript
// Check for new FHEVM configuration options
fhevm: {
    threadPoolSize: 0,
    // Any new options from release notes
}
```

#### Step 6: Test All Contracts

```bash
# Compile all contracts
npm run compile

# Run full test suite
npm test

# Check for warnings and errors
npm run lint
```

#### Step 7: Update All Examples

If changes are required, update all contract files:

```bash
# List all contracts
ls contracts/

# Update each contract if needed
# Then regenerate standalone examples
npm run create-example private-age-verification ./test-output/pav
npm run create-example verifier-registry ./test-output/vr
# ... etc for all examples
```

### Updating Other Dependencies

#### Hardhat Updates

```bash
npm install -D hardhat@latest @nomicfoundation/hardhat-toolbox@latest
npm run compile
npm test
```

#### TypeScript Updates

```bash
npm install -D typescript@latest ts-node@latest @types/node@latest
npm run compile
```

#### Testing Libraries

```bash
npm install -D chai@latest @types/chai@latest mocha@latest @types/mocha@latest
npm test
```

---

## Regenerating Documentation

### When to Regenerate Docs

Regenerate documentation when:
- Contracts are modified
- New examples are added
- Function signatures change
- NatSpec comments are updated

### Full Documentation Regeneration

```bash
# Generate all documentation
npm run generate-docs

# Output will be in docs/ directory
# - docs/PrivateAgeVerification.md
# - docs/VerifierRegistry.md
# - docs/SUMMARY.md
# - etc.
```

### Single Contract Documentation

```bash
# Generate docs for specific contract
npx ts-node scripts/generate-docs.ts PrivateAgeVerification
```

### Verify GitBook Compatibility

The generated `docs/SUMMARY.md` should have this structure:

```markdown
# Summary

* [Introduction](../README.md)
* [API Reference](INDEX.md)

## Contracts

* [PrivateAgeVerification](PrivateAgeVerification.md)
* [VerifierRegistry](VerifierRegistry.md)
* [AgeRangeVerification](AgeRangeVerification.md)
* [MultiPartyVerification](MultiPartyVerification.md)
* [AuditedVerification](AuditedVerification.md)
```

---

## Testing After Updates

### Complete Testing Workflow

```bash
# 1. Clean build artifacts
npm run clean

# 2. Compile contracts
npm run compile

# 3. Run all tests
npm test

# 4. Generate coverage report
npm run test:coverage

# 5. Run gas reporting
npm run test:gas

# 6. Lint code
npm run lint
```

### Test Standalone Examples

After updates, verify that standalone examples still work:

```bash
# Test creating each example
for example in private-age-verification verifier-registry age-range-verification multi-party-verification audited-verification; do
    echo "Testing $example..."
    npm run create-example $example ./test-output/$example
    cd ./test-output/$example
    npm install
    npm run compile
    npm test
    cd ../..
    echo "✅ $example works correctly"
done
```

### Deployment Testing

Test deployments to ensure they still work:

```bash
# Test local deployment
npx hardhat node  # In terminal 1
npm run deploy:localhost  # In terminal 2

# Test testnet deployment (requires testnet ETH)
npm run deploy:sepolia
```

---

## Version Management

### Semantic Versioning

This project follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes (update when FHEVM has breaking changes)
- **MINOR**: New features (new examples, new functionality)
- **PATCH**: Bug fixes and minor improvements

### Update package.json Version

```json
{
  "name": "privacy-age-verification-system",
  "version": "1.1.0",  // Update this
  "description": "Privacy-preserving age verification system using FHE"
}
```

### Tag Releases

```bash
# Create a git tag for the version
git tag -a v1.1.0 -m "Version 1.1.0: Updated to FHEVM 0.10.0"
git push origin v1.1.0
```

### Changelog

Maintain a CHANGELOG.md file:

```markdown
# Changelog

## [1.1.0] - 2025-01-15

### Changed
- Updated @fhevm/solidity to v0.10.0
- Updated hardhat to v2.21.0

### Added
- New example: AdvancedAgeVerification
- Support for euint16 encrypted types

### Fixed
- Fixed gas optimization in submitEncryptedAge
```

---

## Troubleshooting Updates

### Common Issues After Updates

#### Issue 1: Compilation Errors

**Symptom:**
```
Error: Cannot find module '@fhevm/solidity'
```

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run compile
```

#### Issue 2: Type Errors in Tests

**Symptom:**
```
TS2305: Module has no exported member 'euint32'
```

**Solution:**
Check import statements match new FHEVM version:
```typescript
import { euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
```

#### Issue 3: FHE Permission Errors

**Symptom:**
```
Error: FHE permission denied
```

**Solution:**
Ensure both permissions are granted:
```solidity
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, msg.sender);
```

#### Issue 4: Hardhat Configuration Issues

**Symptom:**
```
Error: Invalid Hardhat configuration
```

**Solution:**
Check `hardhat.config.ts` against latest FHEVM template:
```typescript
import "@fhevm/hardhat";

const config: HardhatUserConfig = {
    fhevm: {
        threadPoolSize: 0,
    },
    // ... rest of config
};
```

### Getting Help

If you encounter issues:

1. **Check Documentation**
   - [FHEVM Docs](https://docs.zama.ai/fhevm)
   - [Hardhat Docs](https://hardhat.org/)

2. **Community Support**
   - [Zama Discord](https://discord.com/invite/zama)
   - [Community Forum](https://www.zama.ai/community)

3. **GitHub Issues**
   - Search existing issues
   - Create new issue with reproduction steps

---

## Automated Maintenance Scripts

### Script: Update All Dependencies

Create a script to automate dependency updates:

```bash
#!/bin/bash
# scripts/update-deps.sh

echo "🔄 Updating all dependencies..."

# Backup current package.json
cp package.json package.json.backup

# Update all dependencies
npm update

# Run tests
npm run compile
npm test

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    rm package.json.backup
else
    echo "❌ Tests failed, reverting..."
    mv package.json.backup package.json
    npm install
fi
```

### Script: Regenerate All Examples

```bash
#!/bin/bash
# scripts/regenerate-all.sh

examples=("private-age-verification" "verifier-registry" "age-range-verification" "multi-party-verification" "audited-verification")

for example in "${examples[@]}"; do
    echo "Regenerating $example..."
    npm run create-example $example ./output/$example
done

echo "✅ All examples regenerated!"
```

---

## Best Practices for Maintenance

### 1. Test Before Committing

Always run full test suite before committing changes:

```bash
npm run compile && npm test && npm run lint
```

### 2. Document Breaking Changes

When updates introduce breaking changes:
- Update README.md
- Update CHANGELOG.md
- Update migration guides
- Notify users via GitHub releases

### 3. Maintain Backward Compatibility

When possible:
- Keep old function signatures working
- Add deprecation warnings
- Provide migration path

### 4. Regular Dependency Audits

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### 5. Keep Examples Up-to-Date

Ensure all examples work with latest versions:
- Test each example monthly
- Update docs when APIs change
- Verify deployment scripts work

---

## Maintenance Checklist

When performing maintenance:

- [ ] Review FHEVM release notes
- [ ] Update package.json versions
- [ ] Install new dependencies
- [ ] Update import statements if needed
- [ ] Update hardhat.config.ts if needed
- [ ] Compile all contracts
- [ ] Run full test suite
- [ ] Test all standalone examples
- [ ] Regenerate documentation
- [ ] Update CHANGELOG.md
- [ ] Test deployments
- [ ] Tag new release
- [ ] Push to repository

---

## Additional Resources

- **FHEVM GitHub**: https://github.com/zama-ai/fhevm
- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Hardhat Documentation**: https://hardhat.org/
- **Example Template**: https://github.com/zama-ai/fhevm-hardhat-template
- **Community Forum**: https://www.zama.ai/community
- **Discord**: https://discord.com/invite/zama

---

**Last Updated**: 2025-12-24
**Recommended Review Frequency**: Monthly or when FHEVM updates are released
