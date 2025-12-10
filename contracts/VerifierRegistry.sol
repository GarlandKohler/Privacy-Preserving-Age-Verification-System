// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VerifierRegistry
 * @notice Manages authorized verifiers and their permissions
 * @dev Controls access to verification operations
 */
contract VerifierRegistry {
    address public owner;

    mapping(address => bool) public authorizedVerifiers;
    mapping(address => bool) public verifierActive;
    address[] public verifierList;

    event VerifierAdded(address indexed verifier, uint256 timestamp);
    event VerifierRemoved(address indexed verifier, uint256 timestamp);
    event VerifierDeactivated(address indexed verifier, uint256 timestamp);
    event VerifierReactivated(address indexed verifier, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: not owner");
        _;
    }

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "Not authorized: not verifier");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
        verifierActive[msg.sender] = true;
        verifierList.push(msg.sender);
    }

    /**
     * @notice Add a new authorized verifier
     * @param verifier Address of the verifier to add
     * @dev Only owner can add verifiers
     * @dev Verifier address must be valid
     */
    function addVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        require(!authorizedVerifiers[verifier], "Verifier already exists");

        authorizedVerifiers[verifier] = true;
        verifierActive[verifier] = true;
        verifierList.push(verifier);

        emit VerifierAdded(verifier, block.timestamp);
    }

    /**
     * @notice Remove a verifier's authorization
     * @param verifier Address of the verifier to remove
     * @dev Only owner can remove verifiers
     * @dev Cannot remove owner
     */
    function removeVerifier(address verifier) external onlyOwner {
        require(verifier != owner, "Cannot remove owner");
        require(authorizedVerifiers[verifier], "Verifier does not exist");

        authorizedVerifiers[verifier] = false;
        verifierActive[verifier] = false;

        emit VerifierRemoved(verifier, block.timestamp);
    }

    /**
     * @notice Deactivate a verifier temporarily
     * @param verifier Address of the verifier to deactivate
     * @dev Deactivated verifiers cannot perform verifications
     */
    function deactivateVerifier(address verifier) external onlyOwner {
        require(authorizedVerifiers[verifier], "Verifier does not exist");
        require(verifierActive[verifier], "Verifier already deactivated");

        verifierActive[verifier] = false;

        emit VerifierDeactivated(verifier, block.timestamp);
    }

    /**
     * @notice Reactivate a deactivated verifier
     * @param verifier Address of the verifier to reactivate
     */
    function reactivateVerifier(address verifier) external onlyOwner {
        require(authorizedVerifiers[verifier], "Verifier does not exist");
        require(!verifierActive[verifier], "Verifier is already active");

        verifierActive[verifier] = true;

        emit VerifierReactivated(verifier, block.timestamp);
    }

    /**
     * @notice Check if an address is an active verifier
     * @param verifier Address to check
     * @return True if verifier is active and authorized
     */
    function isActiveVerifier(address verifier) external view returns (bool) {
        return authorizedVerifiers[verifier] && verifierActive[verifier];
    }

    /**
     * @notice Get total number of verifiers
     * @return Count of all registered verifiers
     */
    function getVerifierCount() external view returns (uint256) {
        return verifierList.length;
    }

    /**
     * @notice Get verifier address by index
     * @param index Index in the verifier list
     * @return Address of the verifier at that index
     */
    function getVerifierAt(uint256 index) external view returns (address) {
        require(index < verifierList.length, "Index out of bounds");
        return verifierList[index];
    }

    /**
     * @notice Get all verifiers
     * @return Array of all verifier addresses
     */
    function getAllVerifiers() external view returns (address[] memory) {
        return verifierList;
    }

    /**
     * @notice Transfer ownership to a new owner
     * @param newOwner Address of the new owner
     * @dev Only current owner can transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}
