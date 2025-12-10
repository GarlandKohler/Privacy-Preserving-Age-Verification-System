// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title MultiPartyVerification
 * @notice Compare and verify ages between multiple parties
 * @dev Uses FHE for private age comparisons
 */
contract MultiPartyVerification is SepoliaConfig {
    address public owner;

    struct UserAge {
        euint8 encryptedAge;
        uint256 submitTime;
        bool submitted;
    }

    struct Comparison {
        address user1;
        address user2;
        ebool user1IsOlder;
        uint256 timestamp;
    }

    mapping(address => UserAge) public userAges;
    mapping(bytes32 => Comparison) public comparisons;

    event AgeSubmitted(address indexed user, uint256 timestamp);
    event AgeCompared(address indexed user1, address indexed user2, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: not owner");
        _;
    }

    modifier validAge(uint8 age) {
        require(age >= 1 && age <= 120, "Invalid age range");
        _;
    }

    modifier ageSubmitted(address user) {
        require(userAges[user].submitted, "Age not submitted for this user");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Submit encrypted age
     * @param _age User's age (1-120)
     * @dev Stores encrypted age with timestamp
     */
    function submitAge(uint8 _age) external validAge(_age) {
        euint8 encryptedAge = FHE.asEuint8(_age);

        userAges[msg.sender] = UserAge({
            encryptedAge: encryptedAge,
            submitTime: block.timestamp,
            submitted: true
        });

        FHE.allowThis(encryptedAge);
        FHE.allow(encryptedAge, msg.sender);

        emit AgeSubmitted(msg.sender, block.timestamp);
    }

    /**
     * @notice Compare caller's age with another user's age
     * @param otherUser Address of the other user to compare with
     * @return isOlder Encrypted boolean - true if caller is older
     * @dev Both users must have submitted ages
     */
    function compareAges(address otherUser)
        external
        ageSubmitted(msg.sender)
        ageSubmitted(otherUser)
        returns (ebool)
    {
        euint8 myAge = userAges[msg.sender].encryptedAge;
        euint8 theirAge = userAges[otherUser].encryptedAge;

        // Compare: myAge > theirAge
        ebool isOlder = FHE.gt(myAge, theirAge);

        FHE.allowThis(isOlder);
        FHE.allow(isOlder, msg.sender);
        FHE.allow(isOlder, otherUser);

        // Store comparison
        bytes32 comparisonKey = keccak256(abi.encodePacked(msg.sender, otherUser));
        comparisons[comparisonKey] = Comparison({
            user1: msg.sender,
            user2: otherUser,
            user1IsOlder: isOlder,
            timestamp: block.timestamp
        });

        emit AgeCompared(msg.sender, otherUser, block.timestamp);

        return isOlder;
    }

    /**
     * @notice Check if user's age equals a specific value (without revealing actual age)
     * @param otherUser Another user to compare equality with
     * @return isEqual Encrypted boolean - true if ages are equal
     */
    function compareAgesEqual(address otherUser)
        external
        ageSubmitted(msg.sender)
        ageSubmitted(otherUser)
        returns (ebool)
    {
        euint8 myAge = userAges[msg.sender].encryptedAge;
        euint8 theirAge = userAges[otherUser].encryptedAge;

        // Check equality: myAge == theirAge
        ebool isEqual = FHE.eq(myAge, theirAge);

        FHE.allowThis(isEqual);
        FHE.allow(isEqual, msg.sender);
        FHE.allow(isEqual, otherUser);

        return isEqual;
    }

    /**
     * @notice Check if caller is older than a specific age
     * @param targetAge The age to compare against
     * @return isOlder Encrypted boolean - true if caller is older than target age
     */
    function isOlderThan(uint8 targetAge)
        external
        ageSubmitted(msg.sender)
        validAge(targetAge)
        returns (ebool)
    {
        euint8 myAge = userAges[msg.sender].encryptedAge;
        euint8 targetAgeEncrypted = FHE.asEuint8(targetAge);

        ebool isOlder = FHE.gt(myAge, targetAgeEncrypted);

        FHE.allowThis(isOlder);
        FHE.allow(isOlder, msg.sender);

        return isOlder;
    }

    /**
     * @notice Check if caller is younger than a specific age
     * @param targetAge The age to compare against
     * @return isYounger Encrypted boolean - true if caller is younger than target age
     */
    function isYoungerThan(uint8 targetAge)
        external
        ageSubmitted(msg.sender)
        validAge(targetAge)
        returns (ebool)
    {
        euint8 myAge = userAges[msg.sender].encryptedAge;
        euint8 targetAgeEncrypted = FHE.asEuint8(targetAge);

        ebool isYounger = FHE.lt(myAge, targetAgeEncrypted);

        FHE.allowThis(isYounger);
        FHE.allow(isYounger, msg.sender);

        return isYounger;
    }

    /**
     * @notice Get a previous comparison result
     * @param user1 First user in the comparison
     * @param user2 Second user in the comparison
     * @return Comparison data including the encrypted result
     */
    function getComparison(address user1, address user2)
        external
        view
        returns (Comparison memory)
    {
        bytes32 comparisonKey = keccak256(abi.encodePacked(user1, user2));
        return comparisons[comparisonKey];
    }

    /**
     * @notice Check if a user has submitted their age
     * @param user Address to check
     * @return True if user has submitted age
     */
    function hasSubmittedAge(address user) external view returns (bool) {
        return userAges[user].submitted;
    }

    /**
     * @notice Get submission time for a user's age
     * @param user Address to check
     * @return Timestamp of when age was submitted
     */
    function getSubmissionTime(address user) external view returns (uint256) {
        require(userAges[user].submitted, "Age not submitted");
        return userAges[user].submitTime;
    }

    /**
     * @notice Get number of seconds since a user submitted their age
     * @param user Address to check
     * @return Seconds elapsed since submission
     */
    function getTimeSinceSubmission(address user) external view returns (uint256) {
        require(userAges[user].submitted, "Age not submitted");
        return block.timestamp - userAges[user].submitTime;
    }
}
