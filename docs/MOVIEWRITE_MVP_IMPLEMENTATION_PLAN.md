# 🚀 MovieWrite MVP实施计划 - 快速验证核心价值

## 📋 MVP范围定义

基于完整的转型计划，我们提取最核心的功能，在8-10周内实现一个可验证市场的最小可行产品。

### MVP核心功能
1. **个人创作模式** - 支持Mirror风格的个人文章发布
2. **基础IPFS存储** - 内容去中心化存储
3. **简化版富文本编辑器** - 基本的编辑功能
4. **Publication基础功能** - 个人主页和文章管理
5. **保留协作创作** - 现有功能继续运行

### MVP暂时排除
- ❌ 众筹系统（Phase 2）
- ❌ 高级社交功能（Phase 2）
- ❌ 自定义域名（Phase 2）
- ❌ 高级数据分析（Phase 2）
- ❌ 复杂的主题系统（Phase 2）

## 🎯 第一个可交付功能：个人文章发布（2周）

### Week 1: 后端基础搭建
**目标**: 实现个人文章的创建、存储和检索

#### Day 1-2: 数据模型扩展
```sql
-- 最小化的数据库改动
ALTER TABLE articles 
ADD COLUMN content_type VARCHAR(50) DEFAULT 'collaborative',
ADD COLUMN is_individual BOOLEAN DEFAULT FALSE,
ADD COLUMN ipfs_hash VARCHAR(64);

-- 简化的用户profile
CREATE TABLE user_profiles (
    address VARCHAR(42) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Day 3-4: IPFS集成（简化版）
```javascript
// services/ipfs-simple.js
const axios = require('axios');

class SimpleIPFSService {
    constructor() {
        this.pinataApiKey = process.env.PINATA_API_KEY;
        this.pinataSecret = process.env.PINATA_SECRET;
    }
    
    async uploadJSON(data) {
        try {
            const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
            const response = await axios.post(url, data, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecret
                }
            });
            return response.data.IpfsHash;
        } catch (error) {
            console.error('IPFS upload error:', error);
            throw error;
        }
    }
    
    getIPFSUrl(hash) {
        return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
}

module.exports = new SimpleIPFSService();
```

#### Day 5: API端点实现
```javascript
// routes/individual-articles.js
router.post('/api/articles/individual', async (req, res) => {
    const { title, content, author } = req.body;
    
    // 1. 上传到IPFS
    const ipfsHash = await ipfsService.uploadJSON({
        title,
        content,
        author,
        timestamp: Date.now()
    });
    
    // 2. 保存到数据库
    const article = await db.articles.create({
        title,
        author,
        content_type: 'individual',
        is_individual: true,
        ipfs_hash: ipfsHash
    });
    
    res.json({ success: true, article });
});

router.get('/api/articles/individual/:id', async (req, res) => {
    const article = await db.articles.findOne({
        where: { id: req.params.id, is_individual: true }
    });
    
    if (article.ipfs_hash) {
        const ipfsData = await ipfsService.fetchFromIPFS(article.ipfs_hash);
        article.content = ipfsData.content;
    }
    
    res.json(article);
});
```

### Week 2: 前端基础界面
**目标**: 创建简单但功能完整的发布界面

#### Day 6-7: 基础编辑器集成
```javascript
// components/SimpleEditor.js
import { useState } from 'react';
import dynamic from 'next/dynamic';

// 动态导入避免SSR问题
const ReactQuill = dynamic(() => import('react-quill'), { 
    ssr: false,
    loading: () => <p>Loading editor...</p>
});

export default function SimpleEditor({ onPublish }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [publishing, setPublishing] = useState(false);
    
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'header': [1, 2, 3, false] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ]
    };
    
    const handlePublish = async () => {
        setPublishing(true);
        try {
            await onPublish({ title, content });
            // 成功后跳转到文章页面
        } catch (error) {
            console.error('Publishing failed:', error);
        } finally {
            setPublishing(false);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            <input
                type="text"
                placeholder="Article title..."
                className="w-full text-3xl font-bold mb-4 p-2 border-b"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            
            <ReactQuill 
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                className="mb-6 min-h-[400px]"
            />
            
            <button
                onClick={handlePublish}
                disabled={!title || !content || publishing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
                {publishing ? 'Publishing...' : 'Publish to IPFS'}
            </button>
        </div>
    );
}
```

#### Day 8-9: 个人主页（简化版Publication）
```javascript
// pages/[username].js
export default function UserProfile({ user, articles }) {
    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* 用户信息 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{user.username}</h1>
                <p className="text-gray-600 mt-2">{user.bio}</p>
                <div className="mt-4 text-sm text-gray-500">
                    {user.address}
                </div>
            </div>
            
            {/* 文章列表 */}
            <div className="grid gap-6">
                <h2 className="text-2xl font-semibold">Articles</h2>
                {articles.map(article => (
                    <ArticleCard 
                        key={article.id}
                        article={article}
                        showAuthor={false}
                    />
                ))}
            </div>
            
            {/* 如果是文章作者，显示创建按钮 */}
            {isOwner && (
                <Link href="/write">
                    <a className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full">
                        <PlusIcon />
                    </a>
                </Link>
            )}
        </div>
    );
}
```

#### Day 10: 集成和测试
- 前后端联调
- 基础功能测试
- 修复关键bug

## 📈 渐进式功能增强计划（Week 3-8）

### Week 3-4: 编辑器增强
```javascript
// 任务清单
const week3_4_tasks = [
    "升级到Tiptap编辑器",
    "添加图片上传到IPFS",
    "实现自动保存草稿",
    "添加Markdown支持",
    "实现预览功能"
];
```

### Week 5-6: Publication系统
```javascript
// 任务清单
const week5_6_tasks = [
    "创建Publication管理页面",
    "实现基础主题切换",
    "添加文章分类功能",
    "实现简单的统计分析",
    "优化SEO和分享功能"
];
```

### Week 7-8: 社交功能基础
```javascript
// 任务清单
const week7_8_tasks = [
    "实现关注系统",
    "添加点赞功能升级",
    "创建简单的发现页面",
    "实现基础搜索功能",
    "添加RSS订阅"
];
```

## 🔄 快速迭代策略

### 两周冲刺计划
```yaml
Sprint 1 (Week 1-2):
  目标: 实现个人文章发布的完整流程
  交付: 
    - 用户可以创建和发布个人文章
    - 文章存储在IPFS上
    - 基础的个人主页展示
  
Sprint 2 (Week 3-4):
  目标: 提升编辑体验
  交付:
    - 更好的编辑器
    - 媒体上传支持
    - 草稿和预览功能

Sprint 3 (Week 5-6):
  目标: Publication基础功能
  交付:
    - Publication创建和管理
    - 基础定制功能
    - 简单的数据统计

Sprint 4 (Week 7-8):
  目标: 社区功能雏形
  交付:
    - 关注系统
    - 内容发现
    - 基础社交互动
```

### 每日站会议题
1. 昨天完成了什么？
2. 今天计划做什么？
3. 有什么阻碍？
4. 需要什么支持？

## 🚀 第一周详细执行计划

### Monday (Day 1)
**上午 (4h)**
- [ ] 项目kickoff会议 (1h)
- [ ] 环境搭建和配置 (1h)
- [ ] 数据库设计评审 (1h)
- [ ] 创建基础项目结构 (1h)

**下午 (4h)**
- [ ] 实现数据库migration脚本 (2h)
- [ ] 配置IPFS开发环境 (1h)
- [ ] 编写基础数据模型 (1h)

### Tuesday (Day 2)
**上午 (4h)**
- [ ] 完成用户profile模型 (2h)
- [ ] 实现用户认证中间件 (2h)

**下午 (4h)**
- [ ] 创建个人文章数据模型 (2h)
- [ ] 编写基础CRUD操作 (2h)

### Wednesday (Day 3)
**上午 (4h)**
- [ ] 研究Pinata API文档 (1h)
- [ ] 实现IPFS上传功能 (3h)

**下午 (4h)**
- [ ] 实现IPFS内容获取 (2h)
- [ ] 编写IPFS服务测试 (2h)

### Thursday (Day 4)
**上午 (4h)**
- [ ] 继续完善IPFS集成 (2h)
- [ ] 处理错误和重试机制 (2h)

**下午 (4h)**
- [ ] 集成IPFS到文章发布流程 (2h)
- [ ] 性能优化和缓存策略 (2h)

### Friday (Day 5)
**上午 (4h)**
- [ ] 创建文章发布API (2h)
- [ ] 创建文章获取API (1h)
- [ ] 创建用户文章列表API (1h)

**下午 (4h)**
- [ ] API测试和文档 (2h)
- [ ] 周回顾和下周计划 (1h)
- [ ] 代码整理和提交 (1h)

## 📊 MVP成功指标

### 技术指标
- **发布成功率**: >95%
- **IPFS上传时间**: <3秒
- **页面加载时间**: <2秒
- **编辑器响应**: <100ms

### 用户指标（2周后）
- **早期用户**: 50-100人
- **发布文章数**: 100+篇
- **日活用户**: 20+
- **用户反馈收集**: 20+条

### 业务验证
- 用户愿意使用个人发布功能 ✓
- IPFS存储可行性验证 ✓
- 基础变现模式验证 ✓
- 技术架构可扩展性 ✓

## 🛠️ 技术栈（MVP简化版）

```json
{
  "frontend": {
    "framework": "Next.js (现有)",
    "editor": "React-Quill → Tiptap (渐进)",
    "styling": "Tailwind CSS (现有)",
    "web3": "ethers.js (现有)"
  },
  "backend": {
    "api": "Next.js API Routes",
    "database": "PostgreSQL (现有)",
    "storage": "Pinata (IPFS)",
    "cache": "Memory Cache → Redis"
  },
  "contracts": {
    "current": "保持现有合约",
    "future": "V2合约开发"
  }
}
```

## 🎯 立即行动清单

### 今天必须完成
1. [ ] 确认团队成员和分工
2. [ ] 申请Pinata API密钥
3. [ ] 创建MVP专用分支
4. [ ] 搭建开发环境
5. [ ] 制定第一周详细计划

### 本周必须完成
1. [ ] 完成个人文章发布后端
2. [ ] 实现IPFS存储集成
3. [ ] 创建基础发布界面
4. [ ] 部署到测试环境
5. [ ] 邀请5个内测用户

### 下周重点
1. [ ] 收集用户反馈
2. [ ] 优化编辑体验
3. [ ] 修复关键问题
4. [ ] 规划下一阶段
5. [ ] 准备正式发布

## 💡 快速决策原则

1. **功能优先级**: 核心功能 > 用户体验 > 附加功能
2. **技术选择**: 成熟稳定 > 最新最炫
3. **问题解决**: 快速修复 > 完美方案
4. **用户反馈**: 立即响应 > 延后处理
5. **代码质量**: 可工作 > 可优化 > 可扩展

通过这个MVP计划，我们可以在2周内验证核心概念，8周内构建一个功能完整的产品原型，为后续的完整转型奠定基础。