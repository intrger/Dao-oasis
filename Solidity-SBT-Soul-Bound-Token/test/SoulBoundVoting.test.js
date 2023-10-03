const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SoulboundVoting", function () {
    let owner, voter, sbtToken, votingContract;

    before(async () => {
        [owner, voter] = await ethers.getSigners();

        // Deploy SBT Token
        const SBT = await ethers.getContractFactory("SBT");
        sbtToken = await SBT.deploy("SBT", "SBT");

        // Deploy Voting Contract
        const SoulboundVoting = await ethers.getContractFactory("SoulboundVoting");
        votingContract = await SoulboundVoting.deploy(sbtToken.address);

        // Mint SBT for the voter
        await sbtToken.mint(voter.address, { identity: "Voter", url: "example.com", score: 100, timestamp: Math.floor(Date.now() / 1000) });
    });

    it("Should propose a voting option", async function () {
        let description = "Proposal 1";
        const timestamp = (await ethers.provider.getBlock('latest')).timestamp;
        const startTime = Math.floor(Date.now() / 1000);
        const endTime = startTime + 3600; // 1 hour

        await expect(votingContract.proposeVotingOption(description, startTime, endTime))
        .to.emit(votingContract, "VotingOptionAdded")
        .withArgs(description, startTime, endTime);

        description = "Proposal 2";
    
        await expect(votingContract.proposeVotingOption(description, startTime, endTime))
            .to.emit(votingContract, "VotingOptionAdded")
            .withArgs(description, startTime, endTime);
    });

    it("Should update voting times", async function () {
        const optionId = 0;
        const newStartTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour later
        const newEndTime = newStartTime + 3600;

        await expect(votingContract.updateVotingTimes(optionId, newStartTime, newEndTime))
        .to.emit(votingContract, "VotingUpdated")
        .withArgs(optionId, newStartTime, newEndTime);
    });

    it("Should fail to cast a vote from a non-SBT holder", async function () {
        const optionId = 0;
        const voteType = 1; // AGREE
        const secret = ethers.utils.formatBytes32String("secret");

        await expect(votingContract.connect(owner).castVote(optionId, voteType, secret)).to.be.revertedWith("You don't have an SBT");
    });

    it("Should fail to cast a vote with an invalid optionId", async function () {
        const invalidOptionId = 2;
        const voteType = 1; // AGREE
        const secret = ethers.utils.formatBytes32String("secret");

        await expect(votingContract.connect(voter).castVote(invalidOptionId, voteType, secret)).to.be.revertedWith("Invalid voting option");
    });

    it("Should fail to cast a vote before the voting period starts", async function () {
        const optionId = 0;
        const voteType = 1; // AGREE
        const secret = ethers.utils.formatBytes32String("secret");

        // Assuming the current time is set to before the voting period starts
        await expect(votingContract.connect(voter).castVote(optionId, voteType, secret)).to.be.revertedWith("Voting is not open for this option");
    });

    it("Should cast a vote", async function () {
        const optionId = 0;
        const voteType = 1; // AGREE
        const secret = ethers.utils.formatBytes32String("secret");
        await ethers.provider.send("evm_increaseTime", [3600]);
        await ethers.provider.send("evm_mine", []);

        // kkk = await votingContract.connect(voter).reveal(optionId, voteType, "secret");
        await expect(votingContract.connect(voter).castVote(optionId, voteType, secret))
        .to.emit(votingContract, "Voted")
        .withArgs(voter.address, optionId, voteType);
    });

    it("Should fail to cast a second vote for the same proposal", async function () {
        const optionId = 0;
        const voteType = 1; // AGREE
        const secret = ethers.utils.formatBytes32String("secret");

        await expect(votingContract.connect(voter).castVote(optionId, voteType, secret)).to.be.revertedWith("Already voted on this proposal");
    });

    it("Should deactivate a proposal", async function () {
        const optionId = 1;

        await expect(votingContract.deactivateProposal(optionId)).to.not.be.reverted;
    });

    it("Should fail to cast a vote for a deactivated proposal", async function () {
        const optionId = 1;
        const voteType = 2; // DISAGREE
        const secret = ethers.utils.formatBytes32String("secret");

        await expect(votingContract.connect(voter).castVote(optionId, voteType, secret)).to.be.revertedWith("Voting is not open for this optio");
    });

    it("Should reactivate a proposal", async function () {
        const optionId = 1;

        await expect(votingContract.reactivateProposal(optionId)).to.not.be.reverted;
    });

    it("Should reveal a vote", async function () {
        const optionId = 0;
        const voteType = 1; // AGREE
        const secret = ethers.utils.formatBytes32String("secret");

        await expect(votingContract.connect(voter).revealVote(optionId, voteType, secret)).to.not.be.reverted;

        // Check if the vote was revealed correctly
        const revealedVote = await votingContract.voterRecords(optionId, voter.address);
        expect(revealedVote.voteType).to.equal(voteType);
    });

    it("Should fail to reveal an incorrect vote", async function () {
        const optionId = 0;
        const voteType = 1; // AGREE
        const secret = "wrong_secret";

        await expect(votingContract.connect(voter).revealVote(optionId, voteType, secret)).to.be.reverted;
    });

    it("Should process a proposal", async function () {
        await ethers.provider.send("evm_increaseTime", [3600]);
        await ethers.provider.send("evm_mine", []);
        const optionId = 0;

        await expect(votingContract.processProposal(optionId)).to.not.be.reverted;
    });

    it("Should reveal a vote after process a proposal", async function () {
        const optionId = 0;
        const voteType = 1; // AGREE
        const secret = ethers.utils.formatBytes32String("secret");;

        await expect(votingContract.connect(voter).revealVote(optionId, voteType, secret)).to.not.be.reverted;

        // Check if the vote was revealed correctly
        const revealedVote = await votingContract.voterRecords(optionId, voter.address);
        expect(revealedVote.voteType).to.equal(voteType);
    });

    it("Should get proposal status", async function () {
        const optionId = 0;

        const status = await votingContract.getProposalStatus(optionId);
        expect(status).to.equal(1); // ProposalStatus.ACCEPTED
    });
});
