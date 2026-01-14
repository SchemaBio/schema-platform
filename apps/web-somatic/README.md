# Schema Platform - Somatic Frontend

肿瘤分析前端，基于 Next.js 构建。

## 功能特性

- 样本管理
- 体细胞变异分析（SNV/InDel/CNV/Fusion）
- 肿瘤标志物检测
- 靶向药物推荐
- 免疫治疗评估
- 报告生成

## 技术栈

- Next.js 14
- React 18
- Tailwind CSS
- Radix UI
- IGV.js (基因组浏览器)

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 本地开发

```bash
# 安装依赖（从项目根目录）
pnpm install

# 启动开发服务器
pnpm dev:somatic

# 或直接进入目录
cd apps/web-somatic
pnpm install
pnpm dev
```

开发服务器运行在 http://localhost:3002

## 构建

```bash
# 本地构建
pnpm build

# 或从根目录
pnpm build:somatic
```

## Docker 部署

### 方式一：使用独立部署配置（推荐）

Somatic 团队独立部署：

```bash
cd schema-platform
docker-compose -f docker-compose.independent.yml --profile somatic up -d
```

服务地址：http://localhost:3002

> 端口说明：只暴露前端端口 3002，后端（8080）和数据库（5432）仅内部网络使用。

### 方式二：手动构建镜像

```bash
cd apps/web-somatic

# 构建镜像
docker build -t schema-web-somatic:latest .

# 运行容器
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:8080 \
  schema-web-somatic:latest
```

### 方式三：整体部署

与后端一起部署：

```bash
cd schema-platform
docker-compose up -d web-somatic backend-somatic postgres
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | `http://localhost:8080` |
| `NODE_ENV` | 运行环境 | `production` |

## 与后端对接

确保后端 API 已启动并配置正确的 `NEXT_PUBLIC_API_URL`：

```bash
# 后端 (Somatic 模式)
cd apps/backend-api
docker build --build-arg ANALYSIS_TYPE=somatic -t schema-backend-somatic:latest .
docker run -p 8080:8080 schema-backend-somatic:latest
```

## 项目结构

```
apps/web-somatic/
├── src/
│   ├── app/                  # Next.js App Router 页面
│   │   ├── (main)/           # 主布局
│   │   │   ├── analysis/     # 分析页面
│   │   │   ├── samples/      # 样本管理
│   │   │   ├── data/         # 数据管理
│   │   │   ├── knowledge/    # 知识库
│   │   │   ├── pipeline/     # 流程配置
│   │   │   ├── settings/     # 设置
│   │   │   └── lab/          # 实验室
│   │   ├── login/            # 登录页
│   │   └── error.tsx         # 错误边界
│   ├── components/           # 共享组件
│   ├── hooks/                # 自定义 Hooks
│   ├── config/               # 配置文件
│   ├── types/                # 类型定义
│   └── utils/                # 工具函数
├── public/                   # 静态资源
├── Dockerfile                # Docker 构建文件
└── package.json
```

## 相关文档

- [项目主文档](../../README.md)
- [后端 API 文档](../backend-api/README.md)
- [Germline 前端文档](../web-germline/README.md)

## License

Apache License 2.0
