# Schema Platform

> **⚠️ 重要提示：项目目前处于开发阶段，尚未可用。**

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
├── docker-compose.yml        # Docker Compose 配置
├── docker-compose.external.yml  # 外部数据库配置
├── .env.example              # 环境变量模板
└── start.sh                  # 启动脚本
```

## 环境要求

- Docker >= 20.10
- Docker Compose >= 2.0

## 快速部署

### 1. 配置环境变量

```bash
cp .env.example .env
```

根据需要编辑 `.env` 文件：

| 配置项 | 说明 | 默认值 |
|-------|------|--------|
| `POSTGRES_HOST` | 数据库主机 | postgres |
| `POSTGRES_PASSWORD` | 数据库密码 | postgres |
| `GERMLINE_WEB_PORT` | Germline 前端端口 | 3001 |
| `SOMATIC_WEB_PORT` | Somatic 前端端口 | 3002 |

### 2. 启动服务

使用启动脚本：

```bash
# 启动所有服务（内置数据库）
./start.sh

# 只启动 Germline
./start.sh germline

# 只启动 Somatic
./start.sh somatic

# 使用外部数据库
./start.sh --external-db
```

访问地址：
- Germline: http://localhost:3001
- Somatic: http://localhost:3002

## 端口说明

所有后端服务和数据库仅通过内部网络通信，不对外暴露端口。

| 服务 | 端口 | 访问范围 |
|------|------|----------|
| web-germline | 3001 | 外部可访问 |
| web-somatic | 3002 | 外部可访问 |
| backend-germline | - | 内部网络 |
| backend-somatic | - | 内部网络 |
| postgres | - | 内部网络 |

## 使用的镜像

| 服务 | 镜像 |
|------|------|
| Germline 前端 | ghcr.io/schemabio/schema-germline |
| Somatic 前端 | ghcr.io/schemabio/schema-somatic |
| 后端 | ghcr.io/schemabio/schema-backend |
| 数据库 | postgres:18-alpine |

## License

Apache License 2.0

---

## 开发文档

以下文档仅供开发人员参考。

### 项目结构

```
apps/
├── web-germline/    # 遗传病分析前端 (Next.js)
├── web-somatic/     # 肿瘤分析前端 (Next.js)
└── backend-api/     # 后端 API (Go + Gin)
```

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动遗传病分析系统
pnpm dev:germline

# 启动肿瘤分析系统
pnpm dev:somatic
```

## 文档

- [后端 API 文档](./apps/backend-api/README.md)
- [Germline 前端文档](./apps/web-germline/README.md)
- [Somatic 前端文档](./apps/web-somatic/README.md)

## License

Apache License 2.0
