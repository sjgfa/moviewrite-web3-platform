const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MovieArticle", function () {
  let movieArticle;
  let rewardToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy RewardToken with new constructor parameters
    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy(
      "MovieReward",
      "MRT", 
      ethers.parseEther("1000000"), // 1 million tokens
      owner.address
    );

    // Deploy MovieArticle
    const MovieArticle = await ethers.getContractFactory("MovieArticle");
    movieArticle = await MovieArticle.deploy(await rewardToken.getAddress());

    // Transfer some tokens to the MovieArticle contract for rewards
    await rewardToken.transfer(await movieArticle.getAddress(), ethers.parseEther("100000"));
  });

  describe("Article Creation", function () {
    it("Should create a new article", async function () {
      const title = "The Dark Knight Analysis";
      const movieTitle = "The Dark Knight";
      const genre = "Action";
      const minLength = 100;
      const maxContributors = 5;

      await expect(
        movieArticle.createArticle(title, movieTitle, genre, minLength, maxContributors)
      ).to.emit(movieArticle, "ArticleCreated");

      const article = await movieArticle.articles(1);
      expect(article.title).to.equal(title);
      expect(article.movieTitle).to.equal(movieTitle);
      expect(article.creator).to.equal(owner.address);
      expect(article.isCompleted).to.be.false;
    });

    it("Should return correct total articles count", async function () {
      await movieArticle.createArticle("Test Article", "Test Movie", "Drama", 50, 3);
      expect(await movieArticle.getTotalArticles()).to.equal(1);
    });
  });

  describe("Contributions", function () {
    beforeEach(async function () {
      await movieArticle.createArticle("Test Article", "Test Movie", "Drama", 50, 3);
    });

    it("Should add a contribution", async function () {
      const content = "This is a great analysis of the movie's cinematography and storytelling techniques.";
      
      await expect(
        movieArticle.connect(addr1).addContribution(1, content)
      ).to.emit(movieArticle, "ContributionAdded");

      const contribution = await movieArticle.contributions(1);
      expect(contribution.content).to.equal(content);
      expect(contribution.contributor).to.equal(addr1.address);
      expect(contribution.isApproved).to.be.false;
    });

    it("Should not allow duplicate contributions from same user", async function () {
      const content = "This is a great analysis of the movie's cinematography.";
      
      await movieArticle.connect(addr1).addContribution(1, content);
      
      await expect(
        movieArticle.connect(addr1).addContribution(1, "Another contribution")
      ).to.be.revertedWith("You have already contributed to this article");
    });

    it("Should not allow contributions that are too short", async function () {
      const shortContent = "Too short";
      
      await expect(
        movieArticle.connect(addr1).addContribution(1, shortContent)
      ).to.be.revertedWith("Content too short");
    });
  });

  describe("Likes", function () {
    beforeEach(async function () {
      await movieArticle.createArticle("Test Article", "Test Movie", "Drama", 50, 3);
      await movieArticle.connect(addr1).addContribution(1, "This is a great analysis of the movie's cinematography and storytelling techniques.");
    });

    it("Should allow liking a contribution", async function () {
      await expect(
        movieArticle.connect(addr2).likeContribution(1)
      ).to.emit(movieArticle, "ContributionLiked");

      const contribution = await movieArticle.contributions(1);
      expect(contribution.likes).to.equal(1);
    });

    it("Should not allow liking own contribution", async function () {
      await expect(
        movieArticle.connect(addr1).likeContribution(1)
      ).to.be.revertedWith("Cannot like your own contribution");
    });

    it("Should not allow duplicate likes", async function () {
      await movieArticle.connect(addr2).likeContribution(1);
      
      await expect(
        movieArticle.connect(addr2).likeContribution(1)
      ).to.be.revertedWith("You have already liked this");
    });
  });

  describe("Rewards and Approval", function () {
    beforeEach(async function () {
      await movieArticle.createArticle("Test Article", "Test Movie", "Drama", 50, 3);
      await movieArticle.connect(addr1).addContribution(1, "This is a great analysis of the movie's cinematography and storytelling techniques.");
    });

    it("Should approve contribution and distribute rewards", async function () {
      const rewardAmount = ethers.parseEther("100");
      
      await expect(
        movieArticle.approveContribution(1, rewardAmount)
      ).to.emit(movieArticle, "ContributionApproved");

      const contribution = await movieArticle.contributions(1);
      expect(contribution.isApproved).to.be.true;
      expect(contribution.rewards).to.equal(rewardAmount);

      const balance = await rewardToken.balanceOf(addr1.address);
      expect(balance).to.equal(rewardAmount);
    });

    it("Should not allow non-owner to approve contributions", async function () {
      const rewardAmount = ethers.parseEther("100");
      
      await expect(
        movieArticle.connect(addr1).approveContribution(1, rewardAmount)
      ).to.be.revertedWithCustomError(movieArticle, "OwnableUnauthorizedAccount");
    });
  });

  describe("Article Completion", function () {
    beforeEach(async function () {
      await movieArticle.createArticle("Test Article", "Test Movie", "Drama", 50, 3);
      await movieArticle.connect(addr1).addContribution(1, "This is a great analysis of the movie's cinematography and storytelling techniques.");
    });

    it("Should complete article and mint NFT", async function () {
      await expect(
        movieArticle.completeArticle(1)
      ).to.emit(movieArticle, "ArticleCompleted");

      const article = await movieArticle.articles(1);
      expect(article.isCompleted).to.be.true;

      // Check if NFT was minted to the creator
      expect(await movieArticle.ownerOf(1)).to.equal(owner.address);
    });

    it("Should not allow completing article without contributions", async function () {
      await movieArticle.createArticle("Empty Article", "Test Movie", "Drama", 50, 3);
      
      await expect(
        movieArticle.completeArticle(2)
      ).to.be.revertedWith("Article has no contributions");
    });
  });
}); 