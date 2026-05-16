// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgentRegistry
/// @notice Catalog of registered AI agents. Read-heavy, write rarely.
contract AgentRegistry {
    struct Agent {
        string name;
        string specialty;
        uint256 pricePerTask;
        address payable wallet;
        bool active;
    }

    mapping(uint256 => Agent) public agents;
    uint256 public agentCount;
    address public owner;

    event AgentRegistered(uint256 indexed id, string name, address wallet, uint256 price);
    event AgentDeactivated(uint256 indexed id);

    error NotOwner();
    error InactiveAgent();

    constructor() {
        owner = msg.sender;
    }

    function registerAgent(
        string memory name,
        string memory specialty,
        uint256 pricePerTask,
        address payable wallet
    ) external returns (uint256) {
        if (msg.sender != owner) revert NotOwner();
        uint256 id = agentCount++;
        agents[id] = Agent(name, specialty, pricePerTask, wallet, true);
        emit AgentRegistered(id, name, wallet, pricePerTask);
        return id;
    }

    function deactivateAgent(uint256 id) external {
        if (msg.sender != owner) revert NotOwner();
        agents[id].active = false;
        emit AgentDeactivated(id);
    }

    function getAgent(uint256 id) external view returns (Agent memory) {
        return agents[id];
    }
}
