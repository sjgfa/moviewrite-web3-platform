const { ethers } = require("hardhat");

async function main() {
  console.log("🏆 自动奖励分配系统启动...\n");

  // 获取合约实例
  const contractAddresses = require('../contract-addresses.json');
  const MovieArticleArtifact = require('../artifacts/contracts/MovieArticle.sol/MovieArticle.json');
  const RewardTokenArtifact = require('../artifacts/contracts/RewardToken.sol/RewardToken.json');

  const [owner] = await ethers.getSigners();
  
  const movieArticle = new ethers.Contract(
    contractAddresses.movieArticle,
    MovieArticleArtifact.abi,
    owner
  );

  const rewardToken = new ethers.Contract(
    contractAddresses.rewardToken,
    RewardTokenArtifact.abi,
    owner
  );

  // 获取总文章数
  const totalArticles = await movieArticle.getTotalArticles();
  console.log(`📚 总文章数: ${totalArticles}`);

  if (totalArticles.toString() === '0') {
    console.log("❌ 暂无文章，无需分配奖励");
    return;
  }

  // 奖励配置
  const REWARD_CONFIG = {
    BASE_REWARD: ethers.parseEther("10"), // 基础奖励 10 MWT
    LIKE_BONUS: ethers.parseEther("2"),   // 每个点赞 2 MWT
    CREATOR_BONUS: ethers.parseEther("20"), // 创建者奖励 20 MWT
    COMPLETION_BONUS: ethers.parseEther("50") // 完成文章奖励 50 MWT
  };

  let totalRewardsDistributed = ethers.parseEther("0");
  let approvedContributions = 0;

  // 遍历所有文章
  for (let articleId = 1; articleId <= Number(totalArticles); articleId++) {
    console.log(`\n📖 处理文章 #${articleId}...`);
    
    try {
      const article = await movieArticle.articles(articleId);
      console.log(`   标题: ${article.title}`);
      console.log(`   创建者: ${article.creator}`);
      console.log(`   贡献数: ${article.totalContributions}`);
      console.log(`   是否完成: ${article.isCompleted}`);

      // 获取文章的所有贡献
      const contributionIds = await movieArticle.getArticleContributions(articleId);
      
      if (contributionIds.length === 0) {
        console.log("   ℹ️  无贡献，跳过");
        continue;
      }

      console.log(`   📝 处理 ${contributionIds.length} 个贡献...`);

      // 处理每个贡献
      for (const contributionId of contributionIds) {
        const contribution = await movieArticle.contributions(contributionId);
        
        // 跳过已经审批的贡献
        if (contribution.isApproved) {
          console.log(`     贡献 #${contributionId}: 已审批，跳过`);
          continue;
        }

        // 计算奖励
        let reward = REWARD_CONFIG.BASE_REWARD;
        
        // 基于点赞数的奖励
        const likesBonus = REWARD_CONFIG.LIKE_BONUS * BigInt(contribution.likes);
        reward += likesBonus;

        // 基于内容长度的奖励（可选）
        const contentLength = contribution.content.length;
        if (contentLength > 500) {
          reward += ethers.parseEther("5"); // 长内容奖励
        }

        console.log(`     贡献 #${contributionId}:`);
        console.log(`       贡献者: ${contribution.contributor}`);
        console.log(`       点赞数: ${contribution.likes}`);
        console.log(`       内容长度: ${contentLength} 字符`);
        console.log(`       奖励金额: ${ethers.formatEther(reward)} MWT`);

        // 检查合约余额
        const contractBalance = await rewardToken.balanceOf(contractAddresses.movieArticle);
        if (contractBalance < reward) {
          console.log(`     ❌ 合约余额不足，需要 ${ethers.formatEther(reward)} MWT`);
          continue;
        }

        // 审批贡献并分配奖励
        try {
          const tx = await movieArticle.approveContribution(contributionId, reward);
          await tx.wait();
          
          totalRewardsDistributed += reward;
          approvedContributions++;
          
          console.log(`     ✅ 奖励已分配: ${ethers.formatEther(reward)} MWT`);
        } catch (error) {
          console.log(`     ❌ 分配失败: ${error.message}`);
        }
      }

      // 如果文章有足够贡献且未完成，考虑完成它
      if (!article.isCompleted && contributionIds.length >= 3) {
        try {
          console.log(`   🏁 完成文章并铸造NFT...`);
          const tx = await movieArticle.completeArticle(articleId);
          await tx.wait();
          
          // 给创建者额外奖励
          const creatorReward = REWARD_CONFIG.CREATOR_BONUS + REWARD_CONFIG.COMPLETION_BONUS;
          const contractBalance = await rewardToken.balanceOf(contractAddresses.movieArticle);
          
          if (contractBalance >= creatorReward) {
            const transferTx = await rewardToken.transfer(article.creator, creatorReward);
            await transferTx.wait();
            totalRewardsDistributed += creatorReward;
            console.log(`   🎉 创建者获得完成奖励: ${ethers.formatEther(creatorReward)} MWT`);
          }
          
          console.log(`   ✅ 文章已完成，NFT已铸造给创建者`);
        } catch (error) {
          console.log(`   ❌ 完成文章失败: ${error.message}`);
        }
      }

    } catch (error) {
      console.log(`   ❌ 处理文章 #${articleId} 时出错: ${error.message}`);
    }
  }

  // 总结
  console.log("\n🎊 奖励分配完成！");
  console.log("============================");
  console.log(`📊 统计信息:`);
  console.log(`   已审批贡献: ${approvedContributions} 个`);
  console.log(`   总奖励分配: ${ethers.formatEther(totalRewardsDistributed)} MWT`);
  
  // 显示合约余额
  const finalBalance = await rewardToken.balanceOf(contractAddresses.movieArticle);
  console.log(`   合约剩余余额: ${ethers.formatEther(finalBalance)} MWT`);
  
  console.log("\n💡 提示:");
  console.log("- 贡献者根据内容质量和点赞数获得奖励");
  console.log("- 文章创建者在文章完成时获得额外奖励");
  console.log("- 完成的文章会自动铸造NFT证书");
}

// 导出函数以供其他脚本使用
async function distributeRewards() {
  return main();
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ 奖励分配失败:", error);
      process.exit(1);
    });
}

module.exports = { distributeRewards }; 