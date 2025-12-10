// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title AuditedVerification
 * @notice Age verification with complete audit trail
 * @dev Maintains detailed history of all verifications
 */
contract AuditedVerification is SepoliaConfig {
    address public owner;
    address[] public authorizedAuditors;

    struct AuditLog {
        address user;
        string action;
        uint256 timestamp;
        bytes32 actionHash;
        address initiatedBy;
    }

    struct VerificationRecord {
        address user;
        euint8 encryptedAge;
        ebool isAdult;
        uint256 verificationTime;
        uint256 auditLogIndex;
        bool verified;
    }

    mapping(address => VerificationRecord) public records;
    mapping(address => bool) public isAuditor;
    AuditLog[] public auditTrail;

    event VerificationRecorded(address indexed user, uint256 timestamp, uint256 auditIndex);
    event AuditLogCreated(address indexed user, string action, uint256 timestamp);
    event AuditorAdded(address indexed auditor);
    event AuditorRemoved(address indexed auditor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: not owner");
        _;
    }

    modifier onlyAuditor() {
        require(isAuditor[msg.sender], "Not authorized: not auditor");
        _;
    }

    modifier validAge(uint8 age) {
        require(age >= 1 && age <= 120, "Invalid age range");
        _;
    }

    constructor() {
        owner = msg.sender;
        isAuditor[msg.sender] = true;
        authorizedAuditors.push(msg.sender);
    }

    /**
     * @notice Add an auditor with permission to view audit logs
     * @param auditor Address of the auditor
     * @dev Only owner can add auditors
     */
    function addAuditor(address auditor) external onlyOwner {
        require(auditor != address(0), "Invalid auditor address");
        require(!isAuditor[auditor], "Auditor already exists");

        isAuditor[auditor] = true;
        authorizedAuditors.push(auditor);

        _createAuditLog(auditor, "AUDITOR_ADDED");

        emit AuditorAdded(auditor);
    }

    /**
     * @notice Remove an auditor
     * @param auditor Address of the auditor to remove
     */
    function removeAuditor(address auditor) external onlyOwner {
        require(auditor != owner, "Cannot remove owner");
        require(isAuditor[auditor], "Auditor does not exist");

        isAuditor[auditor] = false;

        _createAuditLog(auditor, "AUDITOR_REMOVED");

        emit AuditorRemoved(auditor);
    }

    /**
     * @notice Submit age for verification with audit recording
     * @param _age User's age (1-120)
     * @dev Creates audit log entry
     */
    function submitAgeForAudit(uint8 _age) external validAge(_age) {
        euint8 encryptedAge = FHE.asEuint8(_age);

        // Perform verification
        ebool isAdult = FHE.ge(encryptedAge, FHE.asEuint8(18));

        // Grant permissions
        FHE.allowThis(encryptedAge);
        FHE.allowThis(isAdult);
        FHE.allow(encryptedAge, msg.sender);
        FHE.allow(isAdult, msg.sender);

        // Create audit log entry
        uint256 auditIndex = auditTrail.length;
        _createAuditLog(msg.sender, "AGE_SUBMITTED");

        // Store verification record
        records[msg.sender] = VerificationRecord({
            user: msg.sender,
            encryptedAge: encryptedAge,
            isAdult: isAdult,
            verificationTime: block.timestamp,
            auditLogIndex: auditIndex,
            verified: true
        });

        emit VerificationRecorded(msg.sender, block.timestamp, auditIndex);
    }

    /**
     * @notice Get verification result for a user
     * @param user Address of the user
     * @return isAdult Encrypted boolean indicating adult status
     */
    function getVerificationResult(address user) external view returns (ebool) {
        require(records[user].verified, "User age not verified");
        return records[user].isAdult;
    }

    /**
     * @notice Get verification record details (public information only)
     * @param user Address of the user
     * @return Verification time and audit log index
     */
    function getVerificationRecord(address user)
        external
        view
        returns (uint256, uint256)
    {
        require(records[user].verified, "User age not verified");
        return (records[user].verificationTime, records[user].auditLogIndex);
    }

    /**
     * @notice Get audit logs for a specific user
     * @param user Address of the user
     * @param startIndex Starting index in audit trail
     * @param count Number of entries to retrieve
     * @return Array of audit log entries
     * @dev Only auditors can view audit logs
     */
    function getAuditLogsForUser(
        address user,
        uint256 startIndex,
        uint256 count
    ) external view onlyAuditor returns (AuditLog[] memory) {
        require(startIndex < auditTrail.length, "Invalid start index");

        uint256 endIndex = startIndex + count;
        if (endIndex > auditTrail.length) {
            endIndex = auditTrail.length;
        }

        AuditLog[] memory results = new AuditLog[](endIndex - startIndex);
        uint256 resultIndex = 0;

        for (uint256 i = startIndex; i < endIndex; i++) {
            if (auditTrail[i].user == user) {
                results[resultIndex] = auditTrail[i];
                resultIndex++;
            }
        }

        return results;
    }

    /**
     * @notice Get all audit logs
     * @return Complete audit trail
     * @dev Only auditors can view
     */
    function getCompleteAuditTrail() external view onlyAuditor returns (AuditLog[] memory) {
        return auditTrail;
    }

    /**
     * @notice Get number of audit entries
     * @return Total audit log count
     */
    function getAuditLogCount() external view returns (uint256) {
        return auditTrail.length;
    }

    /**
     * @notice Get specific audit log entry
     * @param index Index of the audit log entry
     * @return Audit log entry details
     * @dev Only auditors can view
     */
    function getAuditLogAt(uint256 index)
        external
        view
        onlyAuditor
        returns (AuditLog memory)
    {
        require(index < auditTrail.length, "Index out of bounds");
        return auditTrail[index];
    }

    /**
     * @notice Get list of all auditors
     * @return Array of auditor addresses
     * @dev Only owner can call
     */
    function getAuditors() external view onlyOwner returns (address[] memory) {
        return authorizedAuditors;
    }

    /**
     * @notice Check if an address is an auditor
     * @param address_ Address to check
     * @return True if address is an active auditor
     */
    function isAuthorizedAuditor(address address_) external view returns (bool) {
        return isAuditor[address_];
    }

    /**
     * @notice Internal function to create audit log entry
     * @param user Address of the user involved
     * @param action Description of the action
     */
    function _createAuditLog(address user, string memory action) internal {
        bytes32 actionHash = keccak256(abi.encodePacked(action, block.timestamp));

        auditTrail.push(
            AuditLog({
                user: user,
                action: action,
                timestamp: block.timestamp,
                actionHash: actionHash,
                initiatedBy: msg.sender
            })
        );

        emit AuditLogCreated(user, action, block.timestamp);
    }
}
