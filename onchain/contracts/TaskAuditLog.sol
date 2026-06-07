// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TaskAuditLog
 * @dev Immutable on-chain audit trail for task manager events.
 *      Every task lifecycle event (create / update / complete / delete)
 *      is stored as a hash-anchored record that cannot be altered.
 */
contract TaskAuditLog {
    // ─── Enums ────────────────────────────────────────────────────────────────

    enum EventType { CREATED, UPDATED, COMPLETED, DELETED }

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct AuditEntry {
        uint256 taskId;        // off-chain task ID
        EventType eventType;
        bytes32 dataHash;      // keccak256 of task JSON snapshot
        address actor;         // wallet that recorded the event
        uint256 timestamp;
        string metadata;       // optional human-readable note
    }

    // ─── State ────────────────────────────────────────────────────────────────

    AuditEntry[] private _log;

    // taskId → array of log indices for that task
    mapping(uint256 => uint256[]) private _taskEntries;

    // total counts per task
    mapping(uint256 => uint256) public taskEventCount;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TaskEventLogged(
        uint256 indexed logIndex,
        uint256 indexed taskId,
        EventType indexed eventType,
        bytes32 dataHash,
        address actor,
        uint256 timestamp
    );

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Log a task lifecycle event.
     * @param taskId     Off-chain database ID of the task.
     * @param eventType  One of CREATED / UPDATED / COMPLETED / DELETED.
     * @param dataHash   keccak256 hash of the task JSON at the time of the event.
     * @param metadata   Optional short description (e.g. "status changed to DONE").
     */
    function logEvent(
        uint256 taskId,
        EventType eventType,
        bytes32 dataHash,
        string calldata metadata
    ) external returns (uint256 logIndex) {
        logIndex = _log.length;

        _log.push(AuditEntry({
            taskId: taskId,
            eventType: eventType,
            dataHash: dataHash,
            actor: msg.sender,
            timestamp: block.timestamp,
            metadata: metadata
        }));

        _taskEntries[taskId].push(logIndex);
        taskEventCount[taskId]++;

        emit TaskEventLogged(logIndex, taskId, eventType, dataHash, msg.sender, block.timestamp);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Total number of audit entries across all tasks.
    function totalEntries() external view returns (uint256) {
        return _log.length;
    }

    /// @notice Fetch a single audit entry by its global log index.
    function getEntry(uint256 index) external view returns (AuditEntry memory) {
        require(index < _log.length, "Index out of bounds");
        return _log[index];
    }

    /// @notice Fetch all audit entries for a specific task ID.
    function getTaskHistory(uint256 taskId)
        external
        view
        returns (AuditEntry[] memory entries)
    {
        uint256[] storage indices = _taskEntries[taskId];
        entries = new AuditEntry[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            entries[i] = _log[indices[i]];
        }
    }

    /// @notice Verify that a given JSON hash matches the stored record.
    function verifyEntry(uint256 logIndex, bytes32 expectedHash)
        external
        view
        returns (bool)
    {
        require(logIndex < _log.length, "Index out of bounds");
        return _log[logIndex].dataHash == expectedHash;
    }
}
