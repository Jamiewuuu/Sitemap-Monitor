# Sitemap Monitor

一款竞品网站监控工具，通过 Google Custom Search API 定期搜索目标网站的新页面，帮助用户及时掌握竞品动态。

## 功能特性

- **网站管理**：动态添加/编辑/删除监控的网站
- **自动抓取**：支持定时自动抓取（每12小时/每天/每周）
- **手动抓取**：可选时间范围（1天/1周/2周/1个月）
- **页面列表**：展示所有发现的页面，支持搜索和筛选
- **未读管理**：新页面自动标记为未读，支持标记已读
- **数据永久保留**：历史数据可追溯

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **数据库**: SQLite + Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **定时任务**: node-cron

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，或直接编辑 `.env`：

```bash
# Database
DATABASE_URL="file:./dev.db"

# Google Custom Search API
GOOGLE_API_KEY="your-api-key"
GOOGLE_CX="your-search-engine-id"
```

### 3. 初始化数据库

```bash
npx prisma db push
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 获取 Google API 配置

### API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建或选择项目
3. 启用 "Custom Search API"
4. 在「凭据」页面创建 API Key

### Search Engine ID (cx)

1. 访问 [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. 创建搜索引擎
3. 选择「搜索整个网络」
4. 复制 Search Engine ID

## API 配额

- 免费版：100 次/天
- 付费版：$5/1000 次查询
- 单次查询最多 10 条结果
- 最多翻页到第 100 条结果

## 项目结构

```
src/
├── app/
│   ├── api/           # API 路由
│   │   ├── sites/     # 网站管理 API
│   │   ├── pages/     # 页面管理 API
│   │   ├── crawl/     # 抓取 API
│   │   └── settings/  # 设置 API
│   ├── sites/         # 网站管理页面
│   ├── settings/      # 设置页面
│   └── page.tsx       # 首页（页面列表）
├── components/
│   ├── ui/            # shadcn/ui 组件
│   ├── Header.tsx     # 顶部导航
│   ├── PageList.tsx   # 页面列表
│   ├── SiteCard.tsx   # 网站卡片
│   └── CrawlDialog.tsx # 抓取弹窗
├── lib/
│   ├── db.ts          # Prisma 客户端
│   ├── google-search.ts # Google API 封装
│   ├── scheduler.ts   # 定时任务
│   └── utils.ts       # 工具函数
└── types/
    └── index.ts       # 类型定义
```

## 部署

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

注意：SQLite 在 Vercel 上不持久化，生产环境建议：
- 使用 Vercel Postgres
- 或使用 PlanetScale (MySQL)
- 或使用 Turso (SQLite on Edge)

## License

MIT
