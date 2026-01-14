# Schema Platform - Germline Frontend

遗传病分析前端，基于 Next.js 构建。

## 功能特性

- 家系管理（三代家系支持）
- 样本管理
- 变异分析（SNV/InDel/CNV/STR/UPD）
- 家系分离分析
- ACMG 分类评估
- Sanger 验证管理

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
pnpm dev:germline

# 或直接进入目录
cd apps/web-germline
pnpm install
pnpm dev
```

开发服务器运行在 http://localhost:3001

## 构建

```bash
# 本地构建
pnpm build

# 或从根目录
pnpm build:germline
```

## Docker 部署

### 方式一：使用独立部署配置（推荐）

Germline 团队独立部署：

```bash
cd schema-platform
docker-compose -f docker-compose.independent.yml --profile germline up -d
```

服务地址：http://localhost:3001

> 端口说明：只暴露前端端口 3001，后端（8080）和数据库（5432）仅内部网络使用。

### 方式二：手动构建镜像

```bash
cd apps/web-germline

# 构建镜像
docker build -t schema-web-germline:latest .

# 运行容器
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:8080 \
  schema-web-germline:latest
```

### 方式三：整体部署

与后端一起部署：

```bash
cd schema-platform
docker-compose up -d web-germline backend-germline postgres
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | `http://localhost:8080` |
| `NODE_ENV` | 运行环境 | `production` |

## 与后端对接

独立部署时，后端服务通过 Docker 内部网络与前端通信，无需暴露端口。

确保后端 API 启动时配置正确的数据库连接：

```bash
# 后端 (Germline 模式)
cd apps/backend-api
docker build --build-arg ANALYSIS_TYPE=germline -t schema-backend-germline:latest .
docker run schema-backend-germline:latest
```

> 注意：后端不需要暴露端口（-p 参数），它会通过 Docker Compose 的内部网络与前端通信。

## 项目结构

```
apps/web-germline/
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
- [Somatic 前端文档](../web-somatic/README.md)

## License

Apache License 2.0
