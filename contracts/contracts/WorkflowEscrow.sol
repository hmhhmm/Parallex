// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAgentRegistry {
    struct Agent {
        string name;
        string specialty;
        uint256 pricePerTask;
        address payable wallet;
        bool active;
    }
    function getAgent(uint256 id) external view returns (Agent memory);
}

/// @title WorkflowEscrow
/// @notice User deposits funds, agents are paid as they complete tasks.
/// @dev Each workflow's state is isolated → many workflows can run in parallel on Monad.
contract WorkflowEscrow {
    struct Workflow {
        address user;
        uint256[] agentIds;
        bool[] completed;
        uint256 totalDeposit;
        uint256 remainingFunds;
        uint256 createdAt;
    }

    IAgentRegistry public immutable registry;
    address public operator;

    mapping(uint256 => Workflow) public workflows;
    uint256 public workflowCount;

    event WorkflowStarted(uint256 indexed workflowId, address indexed user, uint256 totalDeposit, uint256[] agentIds);
    event AgentPaid(uint256 indexed workflowId, uint256 agentId, uint256 indexed agentIndex, uint256 amount);
    event WorkflowCompleted(uint256 indexed workflowId);

    error NoAgents();
    error InactiveAgent();
    error InsufficientDeposit();
    error BadIndex();
    error AlreadyPaid();
    error NotAuthorized();

    constructor(address registryAddr) {
        registry = IAgentRegistry(registryAddr);
        operator = msg.sender;
    }

    function setOperator(address newOperator) external {
        if (msg.sender != operator) revert NotAuthorized();
        operator = newOperator;
    }

    function startWorkflow(uint256[] memory agentIds) external payable returns (uint256) {
        if (agentIds.length == 0) revert NoAgents();

        uint256 totalCost = 0;
        for (uint i = 0; i < agentIds.length; i++) {
            IAgentRegistry.Agent memory a = registry.getAgent(agentIds[i]);
            if (!a.active) revert InactiveAgent();
            totalCost += a.pricePerTask;
        }
        if (msg.value < totalCost) revert InsufficientDeposit();

        uint256 wfId = workflowCount++;
        Workflow storage wf = workflows[wfId];
        wf.user = msg.sender;
        wf.agentIds = agentIds;
        wf.completed = new bool[](agentIds.length);
        wf.totalDeposit = msg.value;
        wf.remainingFunds = msg.value;
        wf.createdAt = block.timestamp;

        emit WorkflowStarted(wfId, msg.sender, msg.value, agentIds);
        return wfId;
    }

    /// @notice Operator marks an agent complete and triggers payment.
    /// @dev Can be called concurrently for different workflows → parallel execution flex.
    function completeAgent(uint256 workflowId, uint256 agentIndex) external {
        if (msg.sender != operator) revert NotAuthorized();

        Workflow storage wf = workflows[workflowId];
        if (agentIndex >= wf.agentIds.length) revert BadIndex();
        if (wf.completed[agentIndex]) revert AlreadyPaid();

        uint256 agentId = wf.agentIds[agentIndex];
        IAgentRegistry.Agent memory a = registry.getAgent(agentId);

        wf.completed[agentIndex] = true;
        wf.remainingFunds -= a.pricePerTask;
        a.wallet.transfer(a.pricePerTask);

        emit AgentPaid(workflowId, agentId, agentIndex, a.pricePerTask);

        bool allDone = true;
        for (uint i = 0; i < wf.completed.length; i++) {
            if (!wf.completed[i]) {
                allDone = false;
                break;
            }
        }
        if (allDone) {
            if (wf.remainingFunds > 0) {
                payable(wf.user).transfer(wf.remainingFunds);
            }
            emit WorkflowCompleted(workflowId);
        }
    }

    function getWorkflow(uint256 id) external view returns (Workflow memory) {
        return workflows[id];
    }
}
