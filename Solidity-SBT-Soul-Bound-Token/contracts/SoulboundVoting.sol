// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./SBT.sol";
import "hardhat/console.sol";

contract SoulboundVoting {

    // Enum to represent different types of votes
    enum VoteType { NONE, AGREE, DISAGREE, VOTED }

    // Enum to represent different states of a proposal
    enum ProposalStatus { ACTIVE, ACCEPTED, REJECTED, COMPLETED, DISABLED }

    // Struct to represent a voting option
    struct VotingOption {
        string description;
        uint256 agreeCount;
        uint256 disagreeCount;
        uint256 startTime;
        uint256 endTime;
        ProposalStatus status;
    }

    // Struct to represent a voter
    struct Voter {
        VoteType voteType;
        bytes32 voteHash;
    }

    // Contract owner
    address public owner;

    // Array to store all voting options
    VotingOption[] public votingOptions;

    // Mapping to store voter records for each proposal
    mapping(uint256 => mapping(address => Voter)) public voterRecords; // proposalId -> voterAddress -> Voter

    // Reference to the SBT token contract
    SBT public sbtToken;

    // Event emitted when a new voting option is proposed
    event VotingOptionAdded(string description, uint256 startTime, uint256 endTime);

    // Event emitted when a voter casts a vote
    event Voted(address indexed voter, uint256 optionId, VoteType voteType);

    // Event emitted when voting times are updated
    event VotingUpdated(uint256 optionId, uint256 startTime, uint256 endTime);

    // Modifier to ensure that only the contract owner can execute certain functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    // Modifier to ensure that the caller has the required SBT tokens
    modifier hasSBT() {
        require(sbtToken.hasSoul(msg.sender), "You don't have an SBT");
        _;
    }

    // Contract constructor
    constructor(address _sbtTokenAddress) {
        owner = msg.sender;
        require(_sbtTokenAddress != address(0), "SBT cannot be zero address");
        sbtToken = SBT(_sbtTokenAddress);
    }

    // Function to propose a new voting option
    function proposeVotingOption(string memory _description, uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(_startTime < _endTime, "Invalid time range");
        VotingOption memory option = VotingOption({
            description: _description,
            agreeCount: 0,
            disagreeCount: 0,
            startTime: _startTime,
            endTime: _endTime,
            status: ProposalStatus.ACTIVE
        });

        votingOptions.push(option);
        emit VotingOptionAdded(_description, _startTime, _endTime);
    }

    // Function to update the start and end times of a voting option
    function updateVotingTimes(uint256 optionId, uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(optionId < votingOptions.length, "Invalid voting option");
        require(_startTime < _endTime, "Invalid time range");
        
        VotingOption storage option = votingOptions[optionId];
        option.startTime = _startTime;
        option.endTime = _endTime;

        emit VotingUpdated(optionId, _startTime, _endTime);
    }

    // Function for a voter to cast a vote
    function castVote(uint256 optionId, VoteType _voteType, bytes32 secret) external hasSBT {
        require(optionId < votingOptions.length, "Invalid voting option");
        require(voterRecords[optionId][msg.sender].voteType == VoteType.NONE, "Already voted on this proposal");
        
        VotingOption storage option = votingOptions[optionId];
        require(block.timestamp >= option.startTime && block.timestamp <= option.endTime, "Voting is not open for this option");
        require(option.status == ProposalStatus.ACTIVE, "Voting option is not active");

        bytes32 voteHash = keccak256(abi.encodePacked(optionId, _voteType, secret));
        
        if (_voteType == VoteType.AGREE) {
            option.agreeCount++;
        } else if (_voteType == VoteType.DISAGREE) {
            option.disagreeCount++;
        }

        voterRecords[optionId][msg.sender] = Voter({
            voteType: VoteType.VOTED,
            voteHash: voteHash
        });

        emit Voted(msg.sender, optionId, _voteType);
    }

    // Function to deactivate a proposal
    function deactivateProposal(uint256 optionId) external onlyOwner {
        require(optionId < votingOptions.length, "Invalid voting option");
        VotingOption storage option = votingOptions[optionId];
        require(option.status == ProposalStatus.ACTIVE);
        option.status = ProposalStatus.DISABLED;
    }

    // Function to reactivate a proposal
    function reactivateProposal(uint256 optionId) external onlyOwner {
        require(optionId < votingOptions.length, "Invalid voting option");
        VotingOption storage option = votingOptions[optionId];
        require(option.status == ProposalStatus.DISABLED);
        option.status = ProposalStatus.ACTIVE;
    }

    // Function for a voter to reveal their vote
    function revealVote(uint256 optionId, VoteType _voteType, bytes32 secret) external {
        bytes32 voteHash = keccak256(abi.encodePacked(optionId, _voteType, secret));
        require(voterRecords[optionId][msg.sender].voteHash == voteHash);
        voterRecords[optionId][msg.sender].voteType = _voteType;
    }

    // Function to calculate the vote hash (for testing purposes)
    function reveal(uint256 optionId, VoteType _voteType, string memory secret) external pure returns(bytes32) {
        bytes32 voteHash = keccak256(abi.encodePacked(optionId, _voteType, secret));
        return voteHash;
    }

    // Function to process the outcome of a proposal
    function processProposal(uint256 optionId) external onlyOwner {
        require(optionId < votingOptions.length, "Invalid voting option");
        
        VotingOption storage option = votingOptions[optionId];
        require(option.status == ProposalStatus.ACTIVE, "Proposal is not active or already processed");
        require(block.timestamp > option.endTime, "Voting period for this option is still open");
        
        if (option.agreeCount > option.disagreeCount) {
            option.status = ProposalStatus.ACCEPTED;
        } else if (option.agreeCount < option.disagreeCount) {
            option.status = ProposalStatus.REJECTED;
        } else {
            option.status = ProposalStatus.COMPLETED;  // Neither accepted nor rejected if tie.
        }
    }

    // Function to get the status of a proposal
    function getProposalStatus(uint256 optionId) external view returns(ProposalStatus) {
        require(optionId < votingOptions.length, "Invalid voting option");
        return votingOptions[optionId].status;
    }
}
