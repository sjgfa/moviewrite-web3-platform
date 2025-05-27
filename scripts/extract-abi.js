const fs = require('fs');
const path = require('path');

async function extractABI() {
  console.log('🔧 提取合约 ABI...\n');

  try {
    // 读取编译后的合约文件
    const movieArticleArtifact = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../artifacts/contracts/MovieArticle.sol/MovieArticle.json'), 'utf8')
    );
    
    const rewardTokenArtifact = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../artifacts/contracts/RewardToken.sol/RewardToken.json'), 'utf8')
    );

    // 提取ABI
    const movieArticleABI = movieArticleArtifact.abi;
    const rewardTokenABI = rewardTokenArtifact.abi;

    // 读取当前的web3配置
    const web3ConfigPath = path.join(__dirname, '../lib/web3.js');
    let web3Config = fs.readFileSync(web3ConfigPath, 'utf8');

    // 创建新的ABI导出
    const newABIExports = `
// 从编译后的合约中提取的真实ABI
export const MOVIE_ARTICLE_ABI = ${JSON.stringify(movieArticleABI, null, 2)};

export const REWARD_TOKEN_ABI = ${JSON.stringify(rewardTokenABI, null, 2)};
`;

    // 替换现有的ABI定义
    const abiStartPattern = /\/\/ 正确的JSON格式ABI\nexport const MOVIE_ARTICLE_ABI = \[/;
    const abiEndPattern = /\];\s*\/\/ 工具函数/;
    
    const startMatch = web3Config.match(abiStartPattern);
    const endMatch = web3Config.match(abiEndPattern);
    
    if (startMatch && endMatch) {
      const beforeABI = web3Config.substring(0, startMatch.index);
      const afterABI = web3Config.substring(endMatch.index + endMatch[0].length - 13); // 保留 "// 工具函数"
      
      web3Config = beforeABI + newABIExports + '\n// 工具函数' + afterABI;
    } else {
      console.error('❌ 无法找到ABI定义位置');
      return;
    }

    // 写入更新后的配置
    fs.writeFileSync(web3ConfigPath, web3Config);

    console.log('✅ ABI 提取完成！');
    console.log(`📄 MovieArticle ABI: ${movieArticleABI.length} 个项目`);
    console.log(`📄 RewardToken ABI: ${rewardTokenABI.length} 个项目`);
    console.log('📝 已更新 lib/web3.js');

  } catch (error) {
    console.error('❌ 提取 ABI 失败:', error.message);
  }
}

extractABI(); 