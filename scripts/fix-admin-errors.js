const fs = require('fs');
const path = require('path');

console.log("🔧 修复管理员系统错误...");

// 1. 确保contract-addresses.json存在
const contractAddressesPath = path.join(__dirname, '../contract-addresses.json');
if (!fs.existsSync(contractAddressesPath)) {
  console.log("❌ contract-addresses.json 不存在，创建默认文件...");
  const defaultAddresses = {
    movieArticle: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    rewardToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  };
  fs.writeFileSync(contractAddressesPath, JSON.stringify(defaultAddresses, null, 2));
  console.log("✅ 创建默认合约地址文件");
} else {
  console.log("✅ contract-addresses.json 存在");
}

// 2. 检查ABI文件
const movieArticleAbiPath = path.join(__dirname, '../artifacts/contracts/MovieArticle.sol/MovieArticle.json');
const rewardTokenAbiPath = path.join(__dirname, '../artifacts/contracts/RewardToken.sol/RewardToken.json');

if (!fs.existsSync(movieArticleAbiPath) || !fs.existsSync(rewardTokenAbiPath)) {
  console.log("❌ ABI文件缺失，需要编译合约...");
  try {
    const { execSync } = require('child_process');
    execSync('npx hardhat compile', { stdio: 'inherit' });
    console.log("✅ 合约编译完成");
  } catch (error) {
    console.error("❌ 编译失败:", error.message);
  }
} else {
  console.log("✅ ABI文件存在");
}

// 3. 验证图标导入修复
const layoutPath = path.join(__dirname, '../components/Layout.js');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('CrownIcon')) {
    console.log("❌ Layout.js 仍然包含 CrownIcon 引用");
    // 自动修复
    const fixedContent = layoutContent
      .replace(/CrownIcon/g, 'CommandLineIcon')
      .replace('CommandLineIcon,\n  CommandLineIcon', 'CommandLineIcon');
    fs.writeFileSync(layoutPath, fixedContent);
    console.log("✅ 自动修复 Layout.js 中的图标引用");
  } else {
    console.log("✅ Layout.js 图标引用正确");
  }
}

// 4. 验证admin页面图标修复
const adminPath = path.join(__dirname, '../pages/admin.js');
if (fs.existsSync(adminPath)) {
  const adminContent = fs.readFileSync(adminPath, 'utf8');
  if (adminContent.includes('CrownIcon')) {
    console.log("❌ admin.js 仍然包含 CrownIcon 引用");
    // 自动修复
    const fixedContent = adminContent
      .replace(/CrownIcon/g, 'CommandLineIcon')
      .replace('CommandLineIcon,\n  CommandLineIcon', 'CommandLineIcon');
    fs.writeFileSync(adminPath, fixedContent);
    console.log("✅ 自动修复 admin.js 中的图标引用");
  } else {
    console.log("✅ admin.js 图标引用正确");
  }
}

// 5. 清理.next缓存
const nextPath = path.join(__dirname, '../.next');
if (fs.existsSync(nextPath)) {
  try {
    fs.rmSync(nextPath, { recursive: true, force: true });
    console.log("✅ 清理 .next 缓存");
  } catch (error) {
    console.log("ℹ️  缓存清理可能不完整，建议手动删除 .next 目录");
  }
}

console.log("\n🎉 错误修复完成！");
console.log("🚀 建议执行:");
console.log("   npm run admin  # 重新启动管理员面板");
console.log("   http://localhost:3000/admin  # 访问管理员界面"); 