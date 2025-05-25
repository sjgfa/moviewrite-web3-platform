// 🎓 Web3学习练习脚本
// 这个脚本将帮助您通过实际操作来理解Web3开发

const { ethers } = require("hardhat");

async function main() {
    console.log("🎬 欢迎来到MovieWrite Web3学习练习！");
    console.log("=".repeat(50));
    
    // 获取部署的合约
    const [owner, user1, user2] = await ethers.getSigners();
    console.log("👥 获取测试账户:");
    console.log(`   管理员: ${owner.address}`);
    console.log(`   用户1: ${user1.address}`);
    console.log(`   用户2: ${user2.address}`);
    
    // 连接到已部署的合约
    const rewardTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const movieArticleAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    
    const RewardToken = await ethers.getContractFactory("RewardToken");
    const MovieArticle = await ethers.getContractFactory("MovieArticle");
    
    const rewardToken = RewardToken.attach(rewardTokenAddress);
    const movieArticle = MovieArticle.attach(movieArticleAddress);
    
    console.log("\n📄 连接到智能合约:");
    console.log(`   RewardToken: ${rewardTokenAddress}`);
    console.log(`   MovieArticle: ${movieArticleAddress}`);
    
    // 获取当前文章总数，创建新文章
    const currentTotal = await movieArticle.getTotalArticles();
    const newArticleId = currentTotal + 1n;
    
    // 练习1: 创建文章
    console.log("\n🎯 练习1: 创建电影文章");
    console.log("-".repeat(30));
    
    const tx1 = await movieArticle.connect(user1).createArticle(
        `《阿凡达：水之道》深度解析 #${newArticleId}`,
        "阿凡达：水之道",
        "科幻",
        100, // 最小贡献长度
        5    // 最大贡献者数量
    );
    
    console.log("📝 用户1创建文章...");
    await tx1.wait();
    console.log(`✅ 交易哈希: ${tx1.hash}`);
    
    // 查看创建的文章
    const article1 = await movieArticle.articles(newArticleId);
    console.log("📖 文章信息:");
    console.log(`   ID: ${article1.id}`);
    console.log(`   标题: ${article1.title}`);
    console.log(`   电影: ${article1.movieTitle}`);
    console.log(`   类型: ${article1.genre}`);
    console.log(`   创建者: ${article1.creator}`);
    console.log(`   是否完成: ${article1.isCompleted}`);
    
    // 练习2: 添加贡献
    console.log("\n🎯 练习2: 添加文章贡献");
    console.log("-".repeat(30));
    
    const contribution1 = "《阿凡达：水之道》作为詹姆斯·卡梅隆的又一力作，在视觉效果上达到了前所未有的高度。影片中的潘多拉星球海洋世界构建得极其精细，每一个细节都展现了导演对于世界观构建的执着追求。";
    
    const tx2 = await movieArticle.connect(user2).addContribution(newArticleId, contribution1);
    console.log("✍️ 用户2添加贡献...");
    await tx2.wait();
    console.log(`✅ 交易哈希: ${tx2.hash}`);
    
    // 查看贡献
    const contributionIds = await movieArticle.getArticleContributions(newArticleId);
    console.log("📝 文章贡献:");
    console.log(`   贡献数量: ${contributionIds.length}`);
    if (contributionIds.length > 0) {
        const firstContribution = await movieArticle.contributions(contributionIds[0]);
        console.log(`   第一个贡献: ${firstContribution.content.substring(0, 50)}...`);
        console.log(`   贡献者: ${firstContribution.contributor}`);
        console.log(`   点赞数: ${firstContribution.likes}`);
    }
    
    // 练习3: 点赞贡献
    console.log("\n🎯 练习3: 点赞优质贡献");
    console.log("-".repeat(30));
    
    const tx3 = await movieArticle.connect(owner).likeContribution(contributionIds[0]);
    console.log("👍 管理员点赞贡献...");
    await tx3.wait();
    console.log(`✅ 交易哈希: ${tx3.hash}`);
    
    // 再次查看贡献，确认点赞数增加
    const updatedContribution = await movieArticle.contributions(contributionIds[0]);
    console.log(`📈 点赞后的点赞数: ${updatedContribution.likes}`);
    
    // 练习4: 批准贡献并发放奖励
    console.log("\n🎯 练习4: 批准贡献并发放奖励");
    console.log("-".repeat(30));
    
    // 首先给合约一些代币用于奖励
    const rewardAmount = ethers.parseEther("100");
    await rewardToken.transfer(movieArticleAddress, rewardAmount);
    console.log("💰 向合约转入奖励代币...");
    
    // 批准贡献
    const tx4 = await movieArticle.connect(owner).approveContribution(contributionIds[0], ethers.parseEther("10"));
    console.log("✅ 管理员批准贡献并发放奖励...");
    await tx4.wait();
    console.log(`✅ 交易哈希: ${tx4.hash}`);
    
    // 查看用户2的代币余额
    const user2Balance = await rewardToken.balanceOf(user2.address);
    console.log(`💎 用户2获得奖励: ${ethers.formatEther(user2Balance)} MRT`);
    
    // 练习5: 查看合约状态
    console.log("\n🎯 练习5: 查看合约整体状态");
    console.log("-".repeat(30));
    
    const totalArticles = await movieArticle.getTotalArticles();
    const articleInfo = await movieArticle.articles(newArticleId);
    
    console.log("📊 合约状态统计:");
    console.log(`   总文章数: ${totalArticles}`);
    console.log(`   当前文章总贡献数: ${articleInfo.totalContributions}`);
    console.log(`   当前文章总奖励: ${ethers.formatEther(articleInfo.totalRewards)} MRT`);
    
    // 练习6: 事件监听示例
    console.log("\n🎯 练习6: 理解事件和日志");
    console.log("-".repeat(30));
    
    console.log("📡 监听ArticleCreated事件...");
    
    // 创建另一篇文章来触发事件
    const tx5 = await movieArticle.connect(user1).createArticle(
        "《流浪地球2》科幻电影的中国表达",
        "流浪地球2",
        "科幻",
        80,
        3
    );
    
    // 等待交易完成并获取事件
    const receipt = await tx5.wait();
    
    // 解析事件
    const events = receipt.logs.map(log => {
        try {
            return movieArticle.interface.parseLog(log);
        } catch (e) {
            return null;
        }
    }).filter(event => event !== null);
    
    console.log("🎉 捕获到的事件:");
    events.forEach((event, index) => {
        if (event.name === "ArticleCreated") {
            console.log(`   事件${index + 1}: ${event.name}`);
            console.log(`   文章ID: ${event.args.articleId}`);
            console.log(`   创建者: ${event.args.creator}`);
            console.log(`   标题: ${event.args.title}`);
        }
    });
    
    // 练习7: Gas费用分析
    console.log("\n🎯 练习7: Gas费用分析");
    console.log("-".repeat(30));
    
    console.log("⛽ 各操作的Gas消耗:");
    console.log(`   创建文章: ${tx1.gasLimit} gas`);
    console.log(`   添加贡献: ${tx2.gasLimit} gas`);
    console.log(`   点赞贡献: ${tx3.gasLimit} gas`);
    console.log(`   批准奖励: ${tx4.gasLimit} gas`);
    
    // 练习8: 错误处理示例
    console.log("\n🎯 练习8: 错误处理和边界条件");
    console.log("-".repeat(30));
    
    try {
        // 尝试用非管理员账户批准贡献
        await movieArticle.connect(user1).approveContribution(contributionIds[0], ethers.parseEther("5"));
    } catch (error) {
        console.log("❌ 预期错误 - 非管理员无法批准贡献:");
        console.log(`   错误信息: ${error.message.split('(')[0]}`);
    }
    
    try {
        // 尝试创建空标题的文章
        await movieArticle.connect(user1).createArticle("", "测试电影", "剧情", 50, 3);
    } catch (error) {
        console.log("❌ 预期错误 - 标题不能为空:");
        console.log(`   错误信息: ${error.message.split('(')[0]}`);
    }
    
    // 总结
    console.log("\n🎉 恭喜！您已完成所有Web3学习练习！");
    console.log("=".repeat(50));
    console.log("📚 您学到了:");
    console.log("   ✅ 智能合约函数调用");
    console.log("   ✅ 交易确认和哈希");
    console.log("   ✅ 事件监听和解析");
    console.log("   ✅ Gas费用概念");
    console.log("   ✅ 错误处理机制");
    console.log("   ✅ 代币转账和余额查询");
    console.log("   ✅ 权限控制验证");
    
    console.log("\n🚀 下一步建议:");
    console.log("   1. 尝试修改合约添加新功能");
    console.log("   2. 在前端界面中实现这些操作");
    console.log("   3. 学习更多DeFi协议原理");
    console.log("   4. 探索Layer2解决方案");
    
    console.log("\n💡 记住: Web3开发的核心是理解去中心化思维！");
}

// 错误处理
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 练习过程中出现错误:", error);
        process.exit(1);
    }); 