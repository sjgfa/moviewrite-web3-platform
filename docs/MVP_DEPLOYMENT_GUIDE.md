# 🚀 MovieWrite MVP 部署指南

本指南将帮助你快速部署和测试MovieWrite的Mirror风格MVP功能。

## 📋 前置要求

1. **Node.js** (v16+)
2. **Hardhat** 本地节点运行中
3. **Pinata账户** (用于IPFS存储)
4. **MetaMask** 或其他Web3钱包

## 🔧 第一步：配置环境

### 1.1 安装新依赖

```bash
# 安装新增的依赖包
npm install axios react-quill form-data

# 或使用yarn
yarn add axios react-quill form-data
```

### 1.2 配置Pinata API

1. 访问 [Pinata](https://app.pinata.cloud/developers/api-keys) 创建API密钥
2. 复制 `.env.example` 为 `.env.local`
3. 填入你的Pinata API密钥：

```bash
PINATA_API_KEY=your_actual_api_key_here
PINATA_SECRET_API_KEY=your_actual_secret_key_here
```

## 🚀 第二步：启动应用

### 2.1 启动Hardhat节点（如果还没启动）

```bash
# 在一个终端窗口中
npm run node
```

### 2.2 部署合约（如果还没部署）

```bash
# 在另一个终端窗口中
npm run deploy:local
```

### 2.3 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 🧪 第三步：测试MVP功能

### 3.1 创建用户资料

1. 连接你的MetaMask钱包
2. 访问你的个人主页 `/u/[your-address]`
3. 点击 "Edit Profile" 设置用户名和个人信息

### 3.2 发布个人文章

1. 点击导航栏的 "Write" 或访问 `/write`
2. 输入文章标题和内容
3. 选择文章分类（最多3个）
4. 点击 "Publish to IPFS" 发布文章

### 3.3 浏览文章

1. 访问 `/discover` 查看所有已发布的文章
2. 点击文章卡片查看详情
3. 测试点赞和分享功能

### 3.4 查看个人主页

1. 访问 `/u/[username]` 查看用户主页
2. 查看用户发布的所有文章
3. 测试关注功能（需要登录）

## 📝 功能清单

### ✅ 已实现的功能

- [x] IPFS存储集成（Pinata）
- [x] 个人文章发布
- [x] 富文本编辑器（React Quill）
- [x] 用户资料系统
- [x] 文章分类系统
- [x] 文章浏览和发现
- [x] 草稿自动保存
- [x] 个人主页
- [x] 文章详情页
- [x] 基础社交功能框架

### 🚧 待实现的功能

- [ ] 真实的点赞功能（需要合约支持）
- [ ] 关注系统（需要合约支持）
- [ ] 评论功能
- [ ] 搜索功能
- [ ] NFT铸造
- [ ] 众筹系统
- [ ] Publication高级功能

## 🔍 测试检查清单

### 基础功能测试

- [ ] 钱包连接正常
- [ ] 用户资料创建和编辑
- [ ] 文章发布到IPFS
- [ ] 文章列表加载
- [ ] 文章详情页显示
- [ ] 分类筛选功能
- [ ] 草稿保存功能

### IPFS集成测试

- [ ] 文章成功上传到IPFS
- [ ] IPFS哈希正确保存
- [ ] 通过IPFS网关可以访问内容
- [ ] 错误处理（API密钥错误等）

### 用户体验测试

- [ ] 页面加载速度
- [ ] 移动端响应式
- [ ] 错误提示友好
- [ ] 加载状态显示
- [ ] 表单验证

## 🐛 常见问题

### 1. IPFS上传失败

**问题**: 提示 "IPFS service not configured"
**解决**: 检查 `.env.local` 中的Pinata API密钥是否正确配置

### 2. 文章发布失败

**问题**: 发布按钮点击无反应
**解决**: 
- 确保已连接钱包
- 检查浏览器控制台错误
- 确保标题和内容不为空

### 3. 页面样式错乱

**问题**: React Quill编辑器样式不正常
**解决**: 确保在 `_app.js` 中正确导入了样式文件

### 4. 数据丢失

**问题**: 刷新后数据消失
**解决**: 当前使用的是mock数据库，数据存储在 `data/db.json` 文件中

## 📊 性能优化建议

1. **图片优化**: 上传图片前进行压缩
2. **懒加载**: 对文章列表实现无限滚动
3. **缓存策略**: 利用IPFS网关的缓存
4. **代码分割**: 对编辑器组件进行动态导入

## 🚀 生产环境部署

### 使用Vercel部署

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署

### 环境变量配置

```
PINATA_API_KEY=your_production_api_key
PINATA_SECRET_API_KEY=your_production_secret_key
NEXT_PUBLIC_CHAIN_ID=1  # 主网
```

## 📚 下一步开发计划

1. **智能合约升级**: 添加个人文章NFT支持
2. **真实数据库**: 集成PostgreSQL替代mock数据库
3. **社交功能**: 实现真实的关注和点赞系统
4. **搜索功能**: 集成全文搜索
5. **性能优化**: 实现服务端渲染(SSR)

## 🎉 总结

恭喜！你已经成功部署了MovieWrite的MVP版本。这个版本展示了核心的个人文章发布功能，并集成了IPFS去中心化存储。

如有问题，请查看项目文档或提交issue。