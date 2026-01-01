# Schema Platform

绳墨生物 - 基因组分析平台

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker (可选，用于容器化部署)

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动遗传病分析系统 (端口 3001)
pnpm dev:germline

# 启动肿瘤分析系统 (端口 3002)
pnpm dev:somatic
```

## 构建

```bash
# 构建所有项目
pnpm build

# 单独构建
pnpm build:germline
pnpm build:somatic
```

## Docker 部署

### 快速启动

```bash
# 同时部署两个应用
docker-compose --profile all-in-one up -d

# 仅部署遗传病系统
docker-compose --profile germline up -d

# 仅部署肿瘤系统
docker-compose --profile somatic up -d

# 停止服务
docker-compose down
```

### Demo 模式（离线演示）

```bash
# 启动 Demo 模式（禁止出站网络，使用 mock 数据）
docker-compose --profile demo up -d

# Demo 模式 - 仅 germline
docker-compose --profile demo-germline up -d

# Demo 模式 - 仅 somatic
docker-compose --profile demo-somatic up -d
```

### 手动构建镜像

```bash
# 构建完整镜像
docker build -t schema-platform .

# 仅构建 germline
docker build --build-arg BUILD_SOMATIC=false -t schema-germline .

# 仅构建 somatic
docker build --build-arg BUILD_GERMLINE=false -t schema-somatic .
```

## 端口说明

| 应用 | 端口 | 说明 |
|------|------|------|
| web-germline | 3001 | 遗传病分析系统 |
| web-somatic | 3002 | 肿瘤分析系统 |

## 项目结构

```
schema-platform/
├── apps/
│   ├── web-germline/      # 遗传病分析系统
│   └── web-somatic/       # 肿瘤分析系统
├── packages/
│   ├── ui-kit/            # UI 组件库
│   ├── duckdb-client/     # DuckDB WASM 封装
│   └── types/             # TypeScript 类型定义
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## License

Apache License 2.0
