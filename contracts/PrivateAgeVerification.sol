// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateAgeVerification is SepoliaConfig {

    address public owner;
    uint256 public totalVerifications;

    struct AgeVerification {
        euint8 encryptedAge;
        bool isVerified;
        uint256 timestamp;
        ebool isAdult;
        bool verificationCompleted;
    }

    struct VerificationResult {
        address user;
        bool isAdult;
        uint256 timestamp;
        bool success;
    }

    mapping(address => AgeVerification) public userVerifications;
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => bool) public pendingVerifications;
    VerificationResult[] public verificationHistory;

    uint8 constant ADULT_AGE_THRESHOLD = 18;
    uint8 constant SENIOR_AGE_THRESHOLD = 65;

    event AgeSubmitted(address indexed user, uint256 timestamp);
    event VerificationCompleted(address indexed user, bool isAdult, uint256 timestamp);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event AgeVerificationRequested(address indexed user, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner, "Not authorized verifier");
        _;
    }

    modifier onlyValidAge(uint8 _age) {
        require(_age >= 1 && _age <= 120, "Invalid age range");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
        totalVerifications = 0;
    }

    /// @notice User submits encrypted age for verification
    /// @param _age The age to be encrypted and verified (must be between 1-120)
    /// @dev Encrypts the age using FHE and performs age comparison against adult threshold
    function submitEncryptedAge(uint8 _age) external onlyValidAge(_age) {
        require(!userVerifications[msg.sender].isVerified, "Already verified");

        // Encrypt age data using FHE
        euint8 encryptedAge = FHE.asEuint8(_age);

        // Perform privacy-preserving age comparison using FHE
        ebool isAdult = FHE.ge(encryptedAge, FHE.asEuint8(ADULT_AGE_THRESHOLD));

        userVerifications[msg.sender] = AgeVerification({
            encryptedAge: encryptedAge,
            isVerified: true,
            timestamp: block.timestamp,
            isAdult: isAdult,
            verificationCompleted: false
        });

        // Set access control permissions for encrypted values
        FHE.allowThis(encryptedAge);
        FHE.allowThis(isAdult);
        FHE.allow(encryptedAge, msg.sender);
        FHE.allow(isAdult, msg.sender);

        totalVerifications++;

        emit AgeSubmitted(msg.sender, block.timestamp);
    }

    /// @notice Get verification result for the caller
    /// @return ebool Encrypted boolean indicating if user is an adult
    /// @dev Returns encrypted result to maintain privacy
    function getVerificationResult() external view returns (ebool) {
        require(userVerifications[msg.sender].isVerified, "Age not submitted");

        AgeVerification storage verification = userVerifications[msg.sender];
        return verification.isAdult;
    }

    /// @notice Admin completes verification for a user (for demonstration purposes)
    /// @param user The address of the user whose verification is being completed
    /// @param isAdult Whether the user is an adult
    function completeVerificationForUser(address user, bool isAdult) external onlyAuthorizedVerifier {
        require(userVerifications[user].isVerified, "User age not submitted");
        require(!userVerifications[user].verificationCompleted, "Verification already completed");

        userVerifications[user].verificationCompleted = true;

        // Record verification in history
        verificationHistory.push(VerificationResult({
            user: user,
            isAdult: isAdult,
            timestamp: block.timestamp,
            success: true
        }));

        emit VerificationCompleted(user, isAdult, block.timestamp);
    }

    /// @notice Check if a user is an adult (returns public result only)
    /// @param user The address to check
    /// @return completed Whether verification has been completed
    /// @return isAdult Whether the user is an adult (only valid if completed is true)
    function isUserAdult(address user) external view returns (bool completed, bool isAdult) {
        AgeVerification storage verification = userVerifications[user];
        if (!verification.verificationCompleted) {
            return (false, false);
        }

        // Search history for the result
        for (uint i = verificationHistory.length; i > 0; i--) {
            if (verificationHistory[i-1].user == user) {
                return (true, verificationHistory[i-1].isAdult);
            }
        }

        return (false, false);
    }

    /// @notice Verify if age falls within a specific range (advanced feature)
    /// @param minAge Minimum age of the range
    /// @param maxAge Maximum age of the range
    /// @return ebool Encrypted boolean indicating if age is within range
    function verifyAgeRange(uint8 minAge, uint8 maxAge) external returns (ebool) {
        require(userVerifications[msg.sender].isVerified, "Age not submitted");
        require(minAge <= maxAge, "Invalid age range");

        AgeVerification storage verification = userVerifications[msg.sender];

        // Check if age is within specified range
        euint8 minAgeEncrypted = FHE.asEuint8(minAge);
        euint8 maxAgeEncrypted = FHE.asEuint8(maxAge);

        ebool ageAboveMin = FHE.ge(verification.encryptedAge, minAgeEncrypted);
        ebool ageBelowMax = FHE.le(verification.encryptedAge, maxAgeEncrypted);

        return FHE.and(ageAboveMin, ageBelowMax);
    }

    /// @notice Compare ages between two users (without revealing actual ages)
    /// @param otherUser The address of the other user to compare with
    /// @return ebool Encrypted boolean indicating if caller is older than otherUser
    function compareAges(address otherUser) external returns (ebool) {
        require(userVerifications[msg.sender].isVerified, "Your age not submitted");
        require(userVerifications[otherUser].isVerified, "Other user age not submitted");

        AgeVerification storage myVerification = userVerifications[msg.sender];
        AgeVerification storage otherVerification = userVerifications[otherUser];

        // Return whether current user is older than the other user
        return FHE.gt(myVerification.encryptedAge, otherVerification.encryptedAge);
    }

    /// @notice Add an authorized verifier
    /// @param verifier The address to authorize as a verifier
    function addAuthorizedVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        authorizedVerifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }

    /// @notice Remove an authorized verifier
    /// @param verifier The address to remove from authorized verifiers
    function removeAuthorizedVerifier(address verifier) external onlyOwner {
        require(verifier != owner, "Cannot remove owner");
        authorizedVerifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }

    /// @notice Get user verification status
    /// @param user The address to check
    /// @return hasSubmittedAge Whether the user has submitted their age
    /// @return verificationCompleted Whether verification has been completed
    /// @return timestamp When the age was submitted
    function getUserVerificationStatus(address user) external view returns (
        bool hasSubmittedAge,
        bool verificationCompleted,
        uint256 timestamp
    ) {
        AgeVerification storage verification = userVerifications[user];
        return (
            verification.isVerified,
            verification.verificationCompleted,
            verification.timestamp
        );
    }

    /// @notice Get verification statistics
    /// @return totalUsers Total number of verifications
    /// @return completedVerifications Number of completed verifications
    /// @return pendingCount Number of pending verifications
    function getVerificationStats() external view returns (
        uint256 totalUsers,
        uint256 completedVerifications,
        uint256 pendingCount
    ) {
        uint256 completed = verificationHistory.length;
        return (
            totalVerifications,
            completed,
            totalVerifications - completed
        );
    }

    /// @notice Get verification history (authorized verifiers only)
    /// @param startIndex Starting index in the history array
    /// @param count Number of records to retrieve
    /// @return Array of verification results
    function getVerificationHistory(uint256 startIndex, uint256 count)
        external
        view
        onlyAuthorizedVerifier
        returns (VerificationResult[] memory)
    {
        require(startIndex < verificationHistory.length, "Invalid start index");

        uint256 endIndex = startIndex + count;
        if (endIndex > verificationHistory.length) {
            endIndex = verificationHistory.length;
        }

        VerificationResult[] memory results = new VerificationResult[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            results[i - startIndex] = verificationHistory[i];
        }

        return results;
    }

    /// @notice Reset user verification status (owner only)
    /// @param user The address whose verification status to reset
    function resetUserVerification(address user) external onlyOwner {
        delete userVerifications[user];
    }

    /// @notice Check if an address is an authorized verifier
    /// @param verifier The address to check
    /// @return bool Whether the address is authorized
    function isAuthorizedVerifier(address verifier) external view returns (bool) {
        return authorizedVerifiers[verifier];
    }

    /// @notice Emergency pause status
    bool public emergencyPaused = false;

    modifier whenNotPaused() {
        require(!emergencyPaused, "Contract is paused");
        _;
    }

    function emergencyPause() external onlyOwner {
        emergencyPaused = true;
    }

    function emergencyUnpause() external onlyOwner {
        emergencyPaused = false;
    }
}