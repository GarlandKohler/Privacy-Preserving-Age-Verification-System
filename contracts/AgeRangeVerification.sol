// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title AgeRangeVerification
 * @notice Verifies if a user's age falls within specific ranges
 * @dev Advanced age verification with range checking using FHE
 */
contract AgeRangeVerification is SepoliaConfig {
    address public owner;

    struct AgeRange {
        uint8 minAge;
        uint8 maxAge;
        string description;
        uint256 createdAt;
    }

    struct RangeVerification {
        address user;
        uint256 rangeId;
        ebool result;
        uint256 timestamp;
    }

    mapping(address => euint8) private encryptedAges;
    mapping(uint256 => AgeRange) public ageRanges;
    mapping(address => mapping(uint256 => RangeVerification)) public verifications;

    AgeRange[] public rangeList;
    uint256 public rangeCounter;

    event AgeSubmitted(address indexed user, uint256 timestamp);
    event RangeCreated(uint256 indexed rangeId, uint8 minAge, uint8 maxAge, string description);
    event RangeVerified(address indexed user, uint256 indexed rangeId, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: not owner");
        _;
    }

    modifier validAge(uint8 age) {
        require(age >= 1 && age <= 120, "Invalid age range");
        _;
    }

    constructor() {
        owner = msg.sender;
        rangeCounter = 0;
    }

    /**
     * @notice Submit encrypted age
     * @param _age User's age (1-120)
     * @dev Stores age as encrypted value
     */
    function submitAge(uint8 _age) external validAge(_age) {
        euint8 encryptedAge = FHE.asEuint8(_age);

        encryptedAges[msg.sender] = encryptedAge;

        FHE.allowThis(encryptedAge);
        FHE.allow(encryptedAge, msg.sender);

        emit AgeSubmitted(msg.sender, block.timestamp);
    }

    /**
     * @notice Create a new age range for verification
     * @param minAge Minimum age of the range
     * @param maxAge Maximum age of the range
     * @param description Description of what this range represents
     * @dev Only owner can create ranges
     */
    function createAgeRange(
        uint8 minAge,
        uint8 maxAge,
        string memory description
    ) external onlyOwner validAge(minAge) validAge(maxAge) {
        require(minAge <= maxAge, "Min age must be less than or equal to max age");

        AgeRange memory newRange = AgeRange({
            minAge: minAge,
            maxAge: maxAge,
            description: description,
            createdAt: block.timestamp
        });

        ageRanges[rangeCounter] = newRange;
        rangeList.push(newRange);

        emit RangeCreated(rangeCounter, minAge, maxAge, description);

        rangeCounter++;
    }

    /**
     * @notice Verify if user's age falls within a specific range
     * @param rangeId ID of the age range to verify against
     * @return result Encrypted boolean indicating if age is in range
     * @dev Requires user to have previously submitted age
     */
    function verifyAgeInRange(uint256 rangeId) external returns (ebool) {
        require(rangeId < rangeCounter, "Invalid range ID");

        euint8 userAge = encryptedAges[msg.sender];
        AgeRange storage targetRange = ageRanges[rangeId];

        // Check if age >= minAge
        euint8 minAgeEncrypted = FHE.asEuint8(targetRange.minAge);
        ebool ageAboveMin = FHE.ge(userAge, minAgeEncrypted);

        // Check if age <= maxAge
        euint8 maxAgeEncrypted = FHE.asEuint8(targetRange.maxAge);
        ebool ageBelowMax = FHE.le(userAge, maxAgeEncrypted);

        // Combine conditions with AND
        ebool result = FHE.and(ageAboveMin, ageBelowMax);

        // Grant permissions
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        // Store verification
        verifications[msg.sender][rangeId] = RangeVerification({
            user: msg.sender,
            rangeId: rangeId,
            result: result,
            timestamp: block.timestamp
        });

        emit RangeVerified(msg.sender, rangeId, block.timestamp);

        return result;
    }

    /**
     * @notice Verify against multiple ranges simultaneously
     * @param rangeIds Array of range IDs to verify
     * @return results Array of encrypted results for each range
     */
    function verifyMultipleRanges(uint256[] calldata rangeIds) external returns (ebool[] memory) {
        require(rangeIds.length > 0, "Must provide at least one range");
        require(rangeIds.length <= 10, "Cannot verify more than 10 ranges at once");

        ebool[] memory results = new ebool[](rangeIds.length);
        euint8 userAge = encryptedAges[msg.sender];

        for (uint256 i = 0; i < rangeIds.length; i++) {
            uint256 rangeId = rangeIds[i];
            require(rangeId < rangeCounter, "Invalid range ID");

            AgeRange storage targetRange = ageRanges[rangeId];

            euint8 minAgeEncrypted = FHE.asEuint8(targetRange.minAge);
            euint8 maxAgeEncrypted = FHE.asEuint8(targetRange.maxAge);

            ebool ageAboveMin = FHE.ge(userAge, minAgeEncrypted);
            ebool ageBelowMax = FHE.le(userAge, maxAgeEncrypted);

            ebool result = FHE.and(ageAboveMin, ageBelowMax);

            FHE.allowThis(result);
            FHE.allow(result, msg.sender);

            results[i] = result;

            verifications[msg.sender][rangeId] = RangeVerification({
                user: msg.sender,
                rangeId: rangeId,
                result: result,
                timestamp: block.timestamp
            });
        }

        return results;
    }

    /**
     * @notice Get information about a specific age range
     * @param rangeId ID of the range
     * @return Range information (min, max, description, created time)
     */
    function getAgeRange(uint256 rangeId)
        external
        view
        returns (
            uint8,
            uint8,
            string memory,
            uint256
        )
    {
        require(rangeId < rangeCounter, "Invalid range ID");
        AgeRange storage targetRange = ageRanges[rangeId];

        return (
            targetRange.minAge,
            targetRange.maxAge,
            targetRange.description,
            targetRange.createdAt
        );
    }

    /**
     * @notice Get total number of age ranges
     * @return Count of all ranges
     */
    function getRangeCount() external view returns (uint256) {
        return rangeCounter;
    }

    /**
     * @notice Get all age ranges
     * @return Array of all age ranges
     */
    function getAllRanges() external view returns (AgeRange[] memory) {
        return rangeList;
    }
}
