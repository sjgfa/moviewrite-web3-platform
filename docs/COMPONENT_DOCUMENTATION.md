# 🧩 MovieWrite 组件文档

## 概述

MovieWrite 平台采用组件化架构，所有UI组件基于React和Tailwind CSS构建，支持响应式设计和现代化用户体验。

## 📁 组件目录结构

```
components/
├── Layout.js              # 全局布局组件
├── ArticleCard.js         # 文章卡片组件
├── CreateArticleModal.js  # 创建文章弹窗组件
└── [future components]    # 未来扩展组件
```

## 🏗️ Layout 组件

### 文件位置
`components/Layout.js`

### 组件描述
全局布局组件，为所有页面提供统一的导航栏、页脚和布局结构。

### Props 接口
```typescript
interface LayoutProps {
  children: React.ReactNode;  // 页面内容
}
```

### 组件结构
```jsx
<Layout>
  <Navbar />        // 顶部导航栏
  <main>            // 主要内容区域
    {children}      // 页面内容
  </main>
  <Footer />        // 页脚（如果需要）
</Layout>
```

### 核心功能
- **响应式导航**: 移动端汉堡菜单，桌面端水平导航
- **钱包连接**: 集成RainbowKit连接按钮
- **路由高亮**: 当前页面导航项高亮显示
- **用户状态**: 显示连接状态和用户地址

### 导航配置
```javascript
const navigation = [
  { name: '首页', href: '/', current: false },
  { name: '文章', href: '/articles', current: false },
  { name: '个人中心', href: '/profile', current: false },
];
```

### 使用示例
```jsx
import Layout from '@/components/Layout';

export default function HomePage() {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* 页面内容 */}
      </div>
    </Layout>
  );
}
```

### 样式特性
- **渐变背景**: 使用Tailwind渐变类
- **阴影效果**: 卡片阴影和悬停效果
- **动画过渡**: 平滑的悬停和点击动画
- **移动优先**: 响应式设计，适配所有设备

### 依赖项
```javascript
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
```

## 🎴 ArticleCard 组件

### 文件位置
`components/ArticleCard.js`

### 组件描述
文章展示卡片，用于在列表页面和首页展示文章信息，支持动画效果和交互反馈。

### Props 接口
```typescript
interface ArticleCardProps {
  id: string;                    // 文章ID
  title: string;                 // 文章标题
  movieTitle: string;            // 电影名称
  genre: string;                 // 电影类型
  creator: string;               // 创建者地址
  totalContributions?: number;   // 贡献数量
  maxContributors?: number;      // 最大贡献者数
  isCompleted: boolean;          // 是否完成
  createdAt?: string;            // 创建时间
  className?: string;            // 额外CSS类名
}
```

### 核心功能

#### 1. 信息展示
- **文章标题**: 最多2行，超出显示省略号
- **电影信息**: 电影名称和类型标签
- **状态指示**: 完成状态和进度显示
- **创建者信息**: 地址简化显示和头像
- **统计数据**: 贡献数量和时间信息

#### 2. 视觉效果
- **悬停动画**: Y轴向上移动5px
- **阴影变化**: 悬停时阴影加深
- **渐变头像**: 基于地址生成的渐变色头像
- **进度条**: 贡献进度的可视化展示

#### 3. 类型标签系统
```javascript
const genreColors = {
  '科幻': 'bg-blue-100 text-blue-800',
  '动作': 'bg-red-100 text-red-800',
  '动画': 'bg-purple-100 text-purple-800',
  '剧情': 'bg-green-100 text-green-800',
  '喜剧': 'bg-yellow-100 text-yellow-800',
  '恐怖': 'bg-gray-100 text-gray-800',
  '爱情': 'bg-pink-100 text-pink-800',
  '悬疑': 'bg-indigo-100 text-indigo-800',
  '战争': 'bg-orange-100 text-orange-800',
  '历史': 'bg-teal-100 text-teal-800',
};
```

### 使用示例
```jsx
import ArticleCard from '@/components/ArticleCard';

// 在文章列表中使用
{articles.map((article) => (
  <Link key={article.id} href={`/article/${article.id}`}>
    <ArticleCard
      id={article.id}
      title={article.title}
      movieTitle={article.movieTitle}
      genre={article.genre}
      creator={article.creator}
      totalContributions={article.totalContributions}
      maxContributors={article.maxContributors}
      isCompleted={article.isCompleted}
      createdAt={article.createdAt}
    />
  </Link>
))}
```

### 组件布局
```
┌─────────────────────────────────────┐
│ 📽️ 电影名称           类型标签 ✅    │
│ 文章标题文章标题文章标题...           │
│                                     │
│ 👥 5 贡献  🕐 2023-12-01  状态标签  │
│                                     │
│ 👤 创建者信息              [参与] 按钮│
│                                     │
│ 进度条 ████████░░ 5/10              │
└─────────────────────────────────────┘
```

### 工具函数集成
```javascript
import { formatAddress, formatDate } from '@/lib/web3';

// 地址格式化: 0xf39F...2266
const shortAddress = formatAddress(creator);

// 日期格式化: 2023年12月1日
const displayDate = formatDate(createdAt);
```

### 依赖项
```javascript
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
```

## 🔄 CreateArticleModal 组件

### 文件位置
`components/CreateArticleModal.js`

### 组件描述
创建文章的模态弹窗组件，提供表单输入和Web3交互功能，支持用户创建新的电影文章项目。

### Props 接口
```typescript
interface CreateArticleModalProps {
  isOpen: boolean;              // 弹窗开启状态
  onClose: () => void;          // 关闭回调函数
}
```

### 表单字段
```typescript
interface FormData {
  title: string;                // 文章标题
  movieTitle: string;           // 电影名称
  genre: string;                // 电影类型
  minContributionLength: number; // 最小贡献字数
  maxContributors: number;      // 最大贡献者数
}
```

### 核心功能

#### 1. 表单管理
```javascript
const [formData, setFormData] = useState({
  title: '',
  movieTitle: '',
  genre: '',
  minContributionLength: 100,
  maxContributors: 10,
});
```

#### 2. Web3 集成
```javascript
// 准备合约调用
const { config } = usePrepareContractWrite({
  address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
  abi: MOVIE_ARTICLE_ABI,
  functionName: 'createArticle',
  args: [
    formData.title,
    formData.movieTitle,
    formData.genre,
    formData.minContributionLength,
    formData.maxContributors,
  ],
});

// 执行合约调用
const { write: createArticle, isLoading } = useContractWrite({
  ...config,
  onSuccess: () => {
    toast.success('文章创建成功！');
    handleClose();
  },
  onError: (error) => {
    toast.error('创建失败：' + error.message);
  },
});
```

#### 3. 表单验证
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  // 基础验证
  if (!formData.title || !formData.movieTitle || !formData.genre) {
    toast.error('请填写所有必填字段');
    return;
  }
  
  // 调用智能合约
  createArticle?.();
};
```

### 类型选项
```javascript
const genres = [
  '科幻', '动作', '动画', '剧情', '喜剧',
  '恐怖', '爱情', '悬疑', '战争', '历史'
];
```

### UI组件结构
```jsx
<Dialog>
  <Dialog.Panel>
    <Dialog.Title>创建新文章</Dialog.Title>
    
    <form onSubmit={handleSubmit}>
      {/* 文章标题输入 */}
      <input name="title" />
      
      {/* 电影名称输入 */}
      <input name="movieTitle" />
      
      {/* 类型选择下拉框 */}
      <select name="genre">
        {genres.map(genre => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </select>
      
      {/* 最小字数设置 */}
      <input type="number" name="minContributionLength" />
      
      {/* 最大贡献者设置 */}
      <input type="number" name="maxContributors" />
      
      {/* 提交按钮 */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? '创建中...' : '创建文章'}
      </button>
    </form>
  </Dialog.Panel>
</Dialog>
```

### 使用示例
```jsx
import { useState } from 'react';
import CreateArticleModal from '@/components/CreateArticleModal';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        创建新文章
      </button>
      
      <CreateArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
```

### 依赖项
```javascript
import { useState, Fragment } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { XMarkIcon, ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import toast from 'react-hot-toast';
```

## 🎨 样式系统

### Tailwind CSS 配置
项目使用Tailwind CSS进行样式管理，配置文件：`tailwind.config.js`

### 通用样式类

#### 渐变文本
```css
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

#### 网格背景
```css
.bg-grid-pattern {
  background-image: radial-gradient(circle, #00000010 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### 响应式断点
```javascript
// tailwind.config.js
theme: {
  screens: {
    'sm': '640px',
    'md': '768px', 
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  }
}
```

### 组件样式规范

#### 按钮样式
```jsx
// 主要按钮
className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"

// 次要按钮  
className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors"

// 危险按钮
className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
```

#### 卡片样式
```jsx
className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
```

#### 输入框样式
```jsx
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

## 🔧 组件开发指南

### 创建新组件

#### 1. 文件结构
```
components/
└── NewComponent/
    ├── index.js          // 组件入口
    ├── NewComponent.js   // 主组件文件
    └── styles.module.css // 组件样式（如需要）
```

#### 2. 组件模板
```jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * NewComponent - 组件描述
 * @param {Object} props - 组件属性
 * @param {string} props.title - 标题
 * @param {Function} props.onClick - 点击回调
 */
const NewComponent = ({ title, onClick, ...props }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // 初始化逻辑
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg p-4"
      {...props}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {/* 组件内容 */}
    </motion.div>
  );
};

export default NewComponent;
```

#### 3. 组件规范
- **命名**: 使用PascalCase，描述性命名
- **Props**: 定义清晰的接口，使用TypeScript类型注释
- **样式**: 优先使用Tailwind CSS类名
- **动画**: 适当使用Framer Motion动画
- **可访问性**: 添加ARIA标签和键盘导航支持

### 性能优化

#### 1. React.memo 使用
```jsx
import { memo } from 'react';

const ExpensiveComponent = memo(({ data, onClick }) => {
  // 组件逻辑
});

export default ExpensiveComponent;
```

#### 2. useCallback 优化
```jsx
const handleClick = useCallback((id) => {
  // 处理点击事件
}, [dependency]);
```

#### 3. 懒加载
```jsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

## 🧪 组件测试

### 测试文件结构
```
__tests__/
└── components/
    ├── Layout.test.js
    ├── ArticleCard.test.js
    └── CreateArticleModal.test.js
```

### 测试示例
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ArticleCard from '@/components/ArticleCard';

describe('ArticleCard', () => {
  const mockProps = {
    id: '1',
    title: 'Test Article',
    movieTitle: 'Test Movie',
    genre: '科幻',
    creator: '0x123...',
    isCompleted: false
  };

  it('renders article information correctly', () => {
    render(<ArticleCard {...mockProps} />);
    
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('科幻')).toBeInTheDocument();
  });

  it('shows completion status', () => {
    render(<ArticleCard {...mockProps} isCompleted={true} />);
    
    expect(screen.getByText('已完成')).toBeInTheDocument();
  });
});
```

## 📚 扩展计划

### 计划添加的组件

#### 1. ContributionCard
```jsx
// 贡献展示卡片
<ContributionCard
  id="1"
  content="贡献内容..."
  contributor="0x123..."
  likes={5}
  rewards="100"
  isApproved={true}
/>
```

#### 2. UserProfile
```jsx
// 用户信息展示
<UserProfile
  address="0x123..."
  articles={[]}
  contributions={[]}
  totalRewards="1000"
/>
```

#### 3. SearchFilter
```jsx
// 搜索和筛选组件
<SearchFilter
  onSearch={handleSearch}
  onFilter={handleFilter}
  genres={genres}
  statuses={['all', 'active', 'completed']}
/>
```

#### 4. LoadingSpinner
```jsx
// 加载动画组件
<LoadingSpinner size="large" />
```

### 未来功能增强
- **主题切换**: 深色/浅色模式
- **国际化**: 多语言支持
- **可访问性**: WCAG 2.1 AA标准
- **离线支持**: PWA功能
- **组件库**: Storybook集成

---

💡 **提示**: 在开发新组件时，请保持与现有组件的样式一致性，并确保在不同设备和浏览器上的兼容性。建议使用React Developer Tools和浏览器开发工具进行调试和优化。