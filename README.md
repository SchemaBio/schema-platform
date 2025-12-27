# schema-platform

> 🧬 绳墨生物 - 基因组分析平台

## 项目概述

基于 pnpm workspace 的 Monorepo 架构，为遗传病和肿瘤科医生提供专业的基因组分析工具。

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 包管理 | pnpm (workspace) |
| 前端框架 | Next.js 14 (App Router) |
| UI 风格 | GitHub Primer Design System |
| 组件库 | Radix UI + Tailwind CSS |
| 数据分析 | DuckDB WASM |
| 后端 | Python (FastAPI) / Go |
| 部署 | Docker Compose |

## 项目结构

```
schema-platform/
├── apps/                          # 应用程序
│   ├── web-germline/              # [前端A] 遗传病医生专用系统 (Next.js)
│   │   ├── 通用：样本管理、用户管理、报告导出
│   │   └── 特色：ACMG打分器、家系图绘制、一代验证
│   │   
│   ├── web-somatic/               # [前端B] 肿瘤科医生专用系统 (Next.js)
│   │   ├── 通用：样本管理、用户管理、报告导出
│   │   └── 特色：药物匹配列表、生存曲线、TMB仪表盘
│   │   
│   └── backend-api/               # [后端] 统一 API 网关 (Python/Go)
│       └── 功能：Auth、数据库、Nextflow 任务调度
│
├── packages/                      # 共享代码库
│   ├── ui-kit/                    # [UI组件库] GitHub风格组件
│   │   └── Button、Avatar、Navigation、DataTable...
│   │   
│   ├── feature-sample/            # [样本管理] 共享业务模块
│   │   └── 样本列表、样本详情、样本上传、批次管理
│   │   
│   ├── feature-user/              # [用户管理] 共享业务模块
│   │   └── 登录注册、角色权限、用户设置、团队管理
│   │   
│   ├── duckdb-client/             # [分析核心] DuckDB WASM 封装
│   │   └── Parquet 文件分析，前端复用
│   │   
│   └── types/                     # [类型定义] 
│       └── 前后端共用的 API 接口定义
│
├── pnpm-workspace.yaml            # pnpm workspace 配置
├── package.json                   # 根目录配置
├── turbo.json                     # Turborepo 构建配置 (可选)
├── docker-compose.yml             # 容器编排
└── README.md
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有开发服务
pnpm dev

# 仅启动 germline 系统
pnpm dev --filter web-germline

# 仅启动 somatic 系统
pnpm dev --filter web-somatic

# 构建所有项目
pnpm build
```

## UI 设计规范

采用 GitHub Primer Design System 风格，打造专业、清晰、高效的医学数据分析界面。

### 设计理念

| 原则 | 说明 |
|------|------|
| 信息密度优先 | 医生需要同时查看大量变异数据，界面需紧凑但不拥挤 |
| 清晰的视觉层级 | 通过颜色、间距、字重区分主次信息 |
| 一致性 | 两套系统保持统一的视觉语言，降低学习成本 |
| 可访问性 | 符合 WCAG 2.1 AA 标准，支持键盘导航 |
| 专业感 | 避免花哨动效，保持克制、可信赖的医学软件气质 |

### 布局系统

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header (48px)：Logo + 主导航 + 搜索 + 用户菜单                          │
├────────────┬────────────────────────────────────────────────────────────┤
│            │                                                            │
│  Sidebar   │  Main Content                                              │
│  (240px)   │  - 面包屑导航                                               │
│            │  - 页面标题 + 操作按钮                                       │
│  可折叠     │  - 内容区域（表格/表单/详情）                                │
│            │                                                            │
│            │                                                            │
├────────────┴────────────────────────────────────────────────────────────┤
│ Footer (可选)：版本信息 + 帮助链接                                       │
└─────────────────────────────────────────────────────────────────────────┘

响应式断点：
- Desktop: ≥1280px（完整侧边栏）
- Tablet: 768-1279px（折叠侧边栏）
- Mobile: <768px（底部导航，仅查看模式）
```

### 色彩系统

```css
:root {
  /* ========== 基础色板 ========== */
  
  /* 背景色 */
  --color-canvas-default: #ffffff;        /* 主背景 */
  --color-canvas-subtle: #f6f8fa;         /* 次级背景（侧边栏、卡片） */
  --color-canvas-inset: #eff2f5;          /* 内嵌区域背景 */
  
  /* 前景/文字色 */
  --color-fg-default: #1f2328;            /* 主文字 */
  --color-fg-muted: #656d76;              /* 次级文字 */
  --color-fg-subtle: #6e7781;             /* 辅助文字 */
  --color-fg-on-emphasis: #ffffff;        /* 强调背景上的文字 */
  
  /* 边框色 */
  --color-border-default: #d0d7de;        /* 默认边框 */
  --color-border-muted: #d8dee4;          /* 弱边框 */
  --color-border-subtle: #eaeef2;         /* 分隔线 */
  
  /* ========== 功能色 ========== */
  
  /* 主色调 - 蓝色（链接、主按钮、选中态） */
  --color-accent-fg: #0969da;
  --color-accent-emphasis: #0969da;
  --color-accent-muted: rgba(9, 105, 218, 0.4);
  --color-accent-subtle: #ddf4ff;
  
  /* 成功 - 绿色 */
  --color-success-fg: #1a7f37;
  --color-success-emphasis: #1f883d;
  --color-success-subtle: #dafbe1;
  
  /* 警告 - 黄色 */
  --color-warning-fg: #9a6700;
  --color-warning-emphasis: #bf8700;
  --color-warning-subtle: #fff8c5;
  
  /* 危险 - 红色 */
  --color-danger-fg: #d1242f;
  --color-danger-emphasis: #cf222e;
  --color-danger-subtle: #ffebe9;
  
  /* ========== 业务语义色 ========== */
  
  /* ACMG 分类 (Germline) */
  --color-pathogenic: #cf222e;            /* 致病 P */
  --color-likely-pathogenic: #e16f24;     /* 可能致病 LP */
  --color-vus: #bf8700;                   /* 意义未明 VUS */
  --color-likely-benign: #57ab5a;         /* 可能良性 LB */
  --color-benign: #1a7f37;                /* 良性 B */
  
  /* AMP/ASCO/CAP 分级 (Somatic) */
  --color-tier-1: #cf222e;                /* Tier I 强临床意义 */
  --color-tier-2: #e16f24;                /* Tier II 潜在临床意义 */
  --color-tier-3: #bf8700;                /* Tier III 意义未明 */
  --color-tier-4: #656d76;                /* Tier IV 良性/可能良性 */
  
  /* 变异类型 */
  --color-snv: #0969da;                   /* SNV */
  --color-indel: #8250df;                 /* InDel */
  --color-cnv-gain: #cf222e;              /* CNV 扩增 */
  --color-cnv-loss: #0969da;              /* CNV 缺失 */
  --color-fusion: #bf3989;                /* 融合 */
}
```

### 字体规范

```css
:root {
  /* 字体族 */
  --font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", 
                      "Noto Sans", Helvetica, Arial, sans-serif,
                      "Apple Color Emoji", "Segoe UI Emoji";
  --font-family-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, 
                      Consolas, "Liberation Mono", monospace;
  
  /* 字号 */
  --text-title-size-large: 32px;          /* 页面大标题 */
  --text-title-size-medium: 20px;         /* 区块标题 */
  --text-title-size-small: 16px;          /* 卡片标题 */
  --text-body-size-large: 16px;           /* 正文大 */
  --text-body-size-medium: 14px;          /* 正文默认 */
  --text-body-size-small: 12px;           /* 辅助文字、表格内容 */
  --text-caption-size: 12px;              /* 标签、时间戳 */
  
  /* 行高 */
  --text-title-line-height: 1.25;
  --text-body-line-height: 1.5;
  
  /* 字重 */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### 间距系统

基于 4px 基准网格：

```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-9: 40px;
  --space-10: 48px;
  --space-11: 64px;
  --space-12: 80px;
}

/* 常用间距场景 */
--spacing-card-padding: var(--space-4);           /* 16px */
--spacing-section-gap: var(--space-6);            /* 24px */
--spacing-form-gap: var(--space-4);               /* 16px */
--spacing-table-cell-padding: var(--space-2) var(--space-3);  /* 8px 12px */
```

### 圆角与阴影

```css
:root {
  /* 圆角 */
  --border-radius-small: 4px;             /* 小元素：Tag、Badge */
  --border-radius-medium: 6px;            /* 默认：Button、Input、Card */
  --border-radius-large: 12px;            /* 大容器：Modal、Popover */
  --border-radius-full: 9999px;           /* 圆形：Avatar */
  
  /* 阴影 - 保持克制 */
  --shadow-small: 0 1px 0 rgba(31, 35, 40, 0.04);
  --shadow-medium: 0 3px 6px rgba(140, 149, 159, 0.15);
  --shadow-large: 0 8px 24px rgba(140, 149, 159, 0.2);
  --shadow-extra-large: 0 12px 28px rgba(140, 149, 159, 0.3);
}
```

### 核心组件规范

#### Button 按钮

| 类型 | 用途 | 样式 |
|------|------|------|
| Primary | 主要操作（保存、提交） | 蓝底白字 |
| Secondary | 次要操作（取消、返回） | 灰底黑字 |
| Danger | 危险操作（删除） | 红底白字 |
| Ghost | 轻量操作（更多、筛选） | 透明底 + 边框 |
| Link | 文字链接 | 无边框蓝字 |

```
尺寸：
- Small: height 28px, padding 0 12px, font-size 12px
- Medium: height 32px, padding 0 16px, font-size 14px (默认)
- Large: height 40px, padding 0 20px, font-size 16px
```

#### DataTable 数据表格

```
特性：
- 固定表头，内容区滚动
- 列宽可拖拽调整
- 支持列固定（左/右）
- 行选择（单选/多选）
- 行展开（嵌套详情）
- 虚拟滚动（支持万级数据）

样式：
- 表头背景：var(--color-canvas-subtle)
- 行高：40px（紧凑）/ 48px（默认）/ 56px（宽松）
- 斑马纹：可选
- 悬停高亮：var(--color-canvas-subtle)
- 选中高亮：var(--color-accent-subtle)
```

#### Form 表单

```
布局：
- 标签位置：顶部对齐（默认）/ 左侧对齐
- 标签宽度：左对齐时 120px
- 必填标记：红色星号 *

输入框：
- 高度：32px（默认）
- 边框：1px solid var(--color-border-default)
- 聚焦：2px solid var(--color-accent-emphasis)
- 错误：边框变红 + 底部错误提示

间距：
- 表单项间距：16px
- 标签与输入框间距：8px
```

#### Tag/Badge 标签

```
用于变异分类、状态标识：

ACMG 分类标签：
- P:  背景 #ffebe9, 文字 #cf222e
- LP: 背景 #fff1e5, 文字 #e16f24
- VUS: 背景 #fff8c5, 文字 #bf8700
- LB: 背景 #dafbe1, 文字 #57ab5a
- B:  背景 #dafbe1, 文字 #1a7f37

尺寸：
- 高度 20px, padding 0 8px, font-size 12px, border-radius 4px
```

### 图标规范

使用 Lucide Icons（与 Radix UI 配合良好）：

```
尺寸：
- Small: 16px（表格内、按钮内）
- Medium: 20px（导航、标题旁）
- Large: 24px（空状态、大按钮）

颜色：
- 默认跟随文字颜色
- 可单独设置语义色
```

### 动效规范

```css
:root {
  /* 时长 */
  --duration-fast: 100ms;                 /* 微交互：hover、focus */
  --duration-normal: 200ms;               /* 常规过渡：展开、切换 */
  --duration-slow: 300ms;                 /* 复杂动画：Modal、Drawer */
  
  /* 缓动函数 */
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
}

/* 原则：克制使用动效，避免干扰数据分析工作 */
```

### 暗色模式（可选）

```css
[data-theme="dark"] {
  --color-canvas-default: #0d1117;
  --color-canvas-subtle: #161b22;
  --color-fg-default: #e6edf3;
  --color-fg-muted: #8b949e;
  --color-border-default: #30363d;
  --color-accent-fg: #58a6ff;
  /* ... 其他变量覆盖 */
}
```

### Tailwind CSS 配置参考

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: {
          default: 'var(--color-canvas-default)',
          subtle: 'var(--color-canvas-subtle)',
          inset: 'var(--color-canvas-inset)',
        },
        fg: {
          default: 'var(--color-fg-default)',
          muted: 'var(--color-fg-muted)',
        },
        border: {
          default: 'var(--color-border-default)',
          muted: 'var(--color-border-muted)',
        },
        accent: {
          fg: 'var(--color-accent-fg)',
          emphasis: 'var(--color-accent-emphasis)',
          subtle: 'var(--color-accent-subtle)',
        },
        // ACMG 分类
        pathogenic: 'var(--color-pathogenic)',
        'likely-pathogenic': 'var(--color-likely-pathogenic)',
        vus: 'var(--color-vus)',
        'likely-benign': 'var(--color-likely-benign)',
        benign: 'var(--color-benign)',
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },
      borderRadius: {
        sm: 'var(--border-radius-small)',
        DEFAULT: 'var(--border-radius-medium)',
        lg: 'var(--border-radius-large)',
      },
      boxShadow: {
        sm: 'var(--shadow-small)',
        DEFAULT: 'var(--shadow-medium)',
        lg: 'var(--shadow-large)',
      },
    },
  },
}
```

## 功能模块设计

### 🧬 web-germline 全外显子遗传病分析平台

```
┌─────────────────────────────────────────────────────────────────────────┐
│  顶部导航栏：Logo | 样本管理 | 变异分析 | 报告中心 | 知识库 | 设置     │
└─────────────────────────────────────────────────────────────────────────┘

📁 /samples                        样本管理
├── 样本列表（搜索、筛选、批量操作）
├── 新建样本（单样本/家系样本）
├── 样本详情
│   ├── 基本信息（患者、送检信息、临床表型 HPO）
│   ├── 质控报告（测序深度、覆盖度、Q30）
│   └── 分析状态（流程进度追踪）
└── 家系管理（Trio/Quartet 关联）

🔬 /analysis                       变异分析（核心）
├── 变异列表
│   ├── 高级筛选器（基因、频率、功能、遗传模式）
│   ├── 列自定义（拖拽排序、显示/隐藏）
│   └── 批量标记（候选/排除/待定）
├── 变异详情页
│   ├── 基本注释（位置、转录本、氨基酸变化）
│   ├── 人群频率（gnomAD、千人基因组、本地数据库）
│   ├── 功能预测（SIFT、PolyPhen、CADD、REVEL）
│   ├── 保守性（PhyloP、GERP++）
│   ├── 剪接预测（SpliceAI、MaxEntScan）
│   └── 文献/数据库（ClinVar、HGMD、PubMed 链接）
├── ACMG 打分器 ⭐
│   ├── 28条证据项交互式勾选
│   ├── 自动预填充（基于注释数据）
│   ├── 证据强度调整
│   ├── 分类结果计算（P/LP/VUS/LB/B）
│   └── 打分历史记录
├── 家系共分离分析
│   ├── 家系图绘制/编辑器 ⭐
│   ├── 遗传模式验证（AD/AR/XL/MT）
│   └── de novo 检测结果
└── IGV 基因组浏览器（嵌入式）

📋 /reports                        报告中心
├── 报告列表
├── 报告编辑器
│   ├── 选择阳性变异
│   ├── 临床解读撰写
│   ├── 模板选择
│   └── 一代验证引物设计 ⭐
├── 报告预览
├── 报告审核流程（初审→复审→签发）
└── 报告导出（PDF/Word）

📚 /knowledge                      知识库
├── 基因-疾病关联（OMIM、GeneReviews）
├── 本地变异库（历史解读记录）
├── 表型词库（HPO 树形浏览）
└── 解读模板库

⚙️ /settings                       系统设置
├── 个人设置
├── 团队管理
├── 筛选策略配置
├── 报告模板管理
└── 审计日志
```

### 🎯 web-somatic 实体瘤泛癌分析平台

```
┌─────────────────────────────────────────────────────────────────────────┐
│  顶部导航栏：Logo | 样本管理 | 变异分析 | 用药指导 | 报告中心 | 设置   │
└─────────────────────────────────────────────────────────────────────────┘

📁 /samples                        样本管理
├── 样本列表（搜索、筛选、批量操作）
├── 新建样本
│   ├── 肿瘤类型选择（ICD-O-3 编码）
│   ├── 配对样本关联（Tumor-Normal Pair）
│   └── 临床分期（TNM）
├── 样本详情
│   ├── 患者信息、病理信息
│   ├── 质控报告（肿瘤纯度、测序深度）
│   └── 分析状态
└── 队列管理（批量样本分组）

🔬 /analysis                       变异分析
├── 变异列表
│   ├── 变异类型筛选（SNV/InDel/CNV/Fusion/MSI/TMB）
│   ├── 临床意义筛选（Tier I/II/III/IV）
│   ├── 可药物靶点筛选
│   └── 驱动基因突变高亮
├── 变异详情页
│   ├── 基本注释
│   ├── 肿瘤特异性数据库（COSMIC、cBioPortal、TCGA）
│   ├── 变异等位基因频率（VAF）趋势
│   └── 克隆结构推断
├── AMP/ASCO/CAP 分级 ⭐
│   ├── 四级分类系统
│   ├── 证据等级标注（A/B/C/D）
│   └── 分级依据记录
├── 基因组特征面板 ⭐
│   ├── TMB 计算与展示（突变数/Mb）
│   ├── MSI 状态（MSS/MSI-L/MSI-H）
│   ├── HRD 评分
│   ├── 染色体不稳定性（CIN）
│   └── 肿瘤突变特征（Mutational Signatures）
├── CNV 可视化
│   ├── 全基因组 CNV 图谱
│   ├── 基因水平拷贝数
│   └── LOH 区域标注
└── 融合基因检测
    ├── 融合列表
    ├── 融合结构图
    └── 断点序列

💊 /therapy                        用药指导（核心）
├── 药物匹配引擎 ⭐
│   ├── 靶向药物匹配（基于变异）
│   ├── 免疫治疗预测（PD-L1、TMB、MSI）
│   ├── 化疗敏感性/耐药性
│   └── 证据等级排序（FDA/NCCN/临床试验）
├── 药物数据库浏览
│   ├── 按癌种浏览
│   ├── 按靶点浏览
│   ├── 按药物浏览
│   └── 临床试验检索
├── 耐药机制分析
│   ├── 已知耐药突变标注
│   └── 潜在耐药风险提示
└── 治疗方案对比

📊 /dashboard                      数据看板
├── 样本统计概览
├── 癌种分布
├── 高频突变基因 Top N
├── 用药统计
└── 生存分析（Kaplan-Meier 曲线）⭐

📋 /reports                        报告中心
├── 报告列表
├── 报告编辑器
│   ├── 变异选择与分级
│   ├── 用药建议撰写
│   ├── 临床解读
│   └── 模板选择（泛癌/单癌种）
├── 报告审核流程
└── 报告导出

⚙️ /settings                       系统设置
├── 个人设置
├── 团队管理
├── 药物数据库更新
├── 报告模板管理
└── 审计日志
```

### 📦 共享模块划分

| 模块 | 说明 | 使用方 |
|------|------|--------|
| `@schema/ui-kit` | 基础 UI 组件 | 两端共用 |
| `@schema/feature-sample` | 样本 CRUD、列表、详情 | 两端共用 |
| `@schema/feature-user` | 用户、团队、权限 | 两端共用 |
| `@schema/feature-report` | 报告编辑、审核、导出 | 两端共用 |
| `@schema/feature-variant-table` | 变异列表、筛选器、列配置 | 两端共用 |
| `@schema/feature-igv` | IGV 浏览器封装 | 两端共用 |
| `@schema/duckdb-client` | DuckDB WASM 查询 | 两端共用 |
| `@schema/types` | TypeScript 类型定义 | 全部 |

## 包依赖关系

```
web-germline ──┬── @schema/ui-kit
               ├── @schema/feature-sample
               ├── @schema/feature-user
               ├── @schema/feature-report
               ├── @schema/feature-variant-table
               ├── @schema/feature-igv
               ├── @schema/duckdb-client
               └── @schema/types

web-somatic ───┬── @schema/ui-kit
               ├── @schema/feature-sample
               ├── @schema/feature-user
               ├── @schema/feature-report
               ├── @schema/feature-variant-table
               ├── @schema/feature-igv
               ├── @schema/duckdb-client
               └── @schema/types

backend-api ───└── @schema/types
```

## 开发规范

- 使用 TypeScript 严格模式
- ESLint + Prettier 统一代码风格
- Conventional Commits 提交规范
- 组件使用 Storybook 文档化

## License

Apache License 2.0

## 资源许可证兼容性

本项目采用 Apache 2.0 许可证，以下是所有依赖资源的许可证兼容性说明：

### 字体

项目使用系统字体栈，无需额外字体文件：

```css
/* 无衬线字体 - 系统原生 */
--font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", 
                    "Noto Sans", Helvetica, Arial, sans-serif;

/* 等宽字体 - 系统原生 */
--font-family-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, 
                    Consolas, "Liberation Mono", monospace;
```

如需自定义字体，推荐以下 Apache 2.0 / OFL 兼容字体：

| 字体 | 许可证 | 用途 |
|------|--------|------|
| Inter | OFL 1.1 | 界面文字 |
| Noto Sans SC | OFL 1.1 | 中文界面 |
| JetBrains Mono | OFL 1.1 | 代码/序列展示 |
| Source Code Pro | OFL 1.1 | 等宽文字 |

> OFL (SIL Open Font License) 与 Apache 2.0 兼容，可自由使用和分发。

### 图标

| 资源 | 许可证 | 兼容性 |
|------|--------|--------|
| Lucide Icons | ISC | ✅ 兼容 |
| Heroicons | MIT | ✅ 兼容 |
| Radix Icons | MIT | ✅ 兼容 |

### UI 组件库

| 资源 | 许可证 | 兼容性 |
|------|--------|--------|
| Radix UI | MIT | ✅ 兼容 |
| Tailwind CSS | MIT | ✅ 兼容 |
| Next.js | MIT | ✅ 兼容 |

### 数据分析

| 资源 | 许可证 | 兼容性 |
|------|--------|--------|
| DuckDB | MIT | ✅ 兼容 |
| IGV.js | MIT | ✅ 兼容 |
| Apache Arrow | Apache 2.0 | ✅ 兼容 |

### 避免使用

以下资源与 Apache 2.0 不兼容或存在限制：

| 资源 | 许可证 | 问题 |
|------|--------|------|
| Font Awesome Pro | 商业许可 | ❌ 需付费 |
| San Francisco 字体 | Apple 专有 | ❌ 仅限 Apple 平台 |
| Segoe UI 字体 | Microsoft 专有 | ❌ 仅限 Windows |

> 注：系统字体栈中的专有字体仅作为 fallback，不随项目分发，因此不存在许可证问题。
