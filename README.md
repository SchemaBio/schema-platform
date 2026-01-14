# Schema Platform

绳墨生物 - 基因组分析平台

## 项目介绍

一个支持**遗传病分析**和**肿瘤分析**的基因组分析平台，采用 Monorepo 架构设计。

### 核心特性

- **双模式支持**：同一个后端支持 Germline（遗传病）和 Somatic（肿瘤）两种分析模式
- **独立部署**：两个前端团队可以独立部署自己的服务
- **共享代码**：UI 组件、类型定义等代码在 packages 中共享
- **容器化部署**：完整的 Docker 镜像构建和 CI/CD 支持

## 项目结构

```
schema-platform/
├── .github/workflows/
│   └── build-images.yml      # CI/CD 流水线
├── apps/
│   ├── web-germline/         # 遗传病分析前端 (Next.js)
│   ├── web-somatic/          # 肿瘤分析前端 (Next.js)
│   └── backend-api/          # 后端 API (Go + Gin)
├── packages/                  # 共享包
│   ├── ui-kit/              # UI 组件库
│   ├── types/               # TypeScript 类型定义
│   ├── duckdb-client/       # DuckDB WASM 封装
│   ├── feature-sample/      # 样本功能模块
│   └── feature-user/        # 用户功能模块
├── docker-compose.yml        # 本地整体部署
├── docker-compose.independent.yml  # 独立团队部署
└── pnpm-workspace.yaml       # Monorepo 配置
```

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Go >= 1.21 (后端开发)
- Docker (部署)

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动遗传病分析系统 (端口 3001)
pnpm dev:germline

# 启动肿瘤分析系统 (端口 3002)
pnpm dev:somatic
```

## Docker 部署

### 0. 环境配置

部署前请先配置环境变量：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
nano .env
```

主要配置项说明：

| 配置项 | 说明 | 默认值 |
|-------|------|--------|
| `TEAMS` | 启动团队: germline/somatic/all | germline |
| `POSTGRES_PASSWORD` | 数据库密码 | postgres |
| `GERMLINE_WEB_PORT` | Germline 前端端口 | 3001 |
| `SOMATIC_WEB_PORT` | Somatic 前端端口 | 3002 |

### 方式一：整体部署（本地演示）

同时部署 Germline + Somatic + 两个后端 + 数据库：

```bash
docker-compose up -d
```

访问地址：
- Germline: http://localhost:3001
- Somatic: http://localhost:3002

> 注：所有后端和数据库端口仅内部网络使用，不对外暴露。

### 方式二：独立部署（生产环境，推荐）

Germline 团队只部署自己的服务（只暴露前端端口 3001）：

```bash
docker-compose -f docker-compose.independent.yml --profile germline up -d
```

Somatic 团队只部署自己的服务（只暴露前端端口 3002）：

```bash
docker-compose -f docker-compose.independent.yml --profile somatic up -d
```

> 独立部署模式下，后端和数据库端口仅内部网络使用，外部无法直接访问，安全性更高。

## 手动构建镜像

### 构建 Germline 前端

```bash
cd apps/web-germline
docker build -t schema-web-germline:latest .
```

### 构建 Somatic 前端

```bash
cd apps/web-somatic
docker build -t schema-web-somatic:latest .
```

### 构建后端（Germline 模式）

```bash
cd apps/backend-api
docker build --build-arg ANALYSIS_TYPE=germline -t schema-backend-germline:latest .
```

### 构建后端（Somatic 模式）

```bash
cd apps/backend-api
docker build --build-arg ANALYSIS_TYPE=somatic -t schema-backend-somatic:latest .
```

## CI/CD

GitHub Actions 配置文件：`.github/workflows/build-images.yml`

自动构建：
- 推送到 main/develop 分支时自动构建
- 支持手动触发，可选择构建哪些镜像
- 镜像推送到 GitHub Container Registry

## 端口说明

所有服务（后端、数据库）均仅通过内部网络通信，不对外暴露端口。

| 服务 | 端口 | 访问范围 |
|------|------|----------|
| web-germline | 3001 | 外部可访问 |
| web-somatic | 3002 | 外部可访问 |
| backend-germline | - | 内部网络 |
| backend-somatic | - | 内部网络 |
| postgres | - | 内部网络 |

## 文档

- [后端 API 文档](./apps/backend-api/README.md)
- [Germline 前端文档](./apps/web-germline/README.md)
- [Somatic 前端文档](./apps/web-somatic/README.md)

## License

Apache License 2.0
