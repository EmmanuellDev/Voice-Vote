// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NullifierStorage {
    // Mapping to store nullifiers
    mapping(bytes32 => bool) private nullifiers;
    
    // Event emitted when a nullifier is stored
    event NullifierStored(bytes32 indexed nullifier, address indexed sender);
    
    /**
     * @dev Store a nullifier hash
     * @param _nullifier The nullifier hash to store
     */
    function storeNullifier(bytes32 _nullifier) external {
        require(!nullifiers[_nullifier], "Nullifier already exists");
        nullifiers[_nullifier] = true;
        emit NullifierStored(_nullifier, msg.sender);
    }
    
    /**
     * @dev Check if a nullifier exists
     * @param _nullifier The nullifier hash to check
     * @return bool True if nullifier exists, false otherwise
     */
    function nullifierExists(bytes32 _nullifier) external view returns (bool) {
        return nullifiers[_nullifier];
    }
}