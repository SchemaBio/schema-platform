# Schema Platform Backend API

后端 API 服务，提供样本管理、测序数据分析、团队协作等功能。

## 快速开始

### 1. 配置

复制配置文件并修改：
```bash
cp config.example.yaml config.yaml
# 编辑 config.yaml 设置数据库连接等信息
```

### 2. 构建

```bash
# 本地构建
make build

# Docker 构建
make docker-build
```

### 3. 运行

```bash
# 本地运行
./schema-platform-backend

# Docker 运行
docker-compose up -d
```

## 目录结构

```
backend-api/
├── cmd/server/          # 程序入口
├── internal/
│   ├── handler/         # HTTP 处理层
│   ├── service/         # 业务逻辑层
│   ├── repository/      # 数据访问层
│   ├── model/           # 数据模型
│   ├── dto/             # 数据传输对象
│   └── middleware/      # 中间件
├── migrations/          # 数据库迁移
├── config.yaml          # 配置文件
└── Dockerfile           # Docker 构建文件
```

## API 端口

- 默认端口：`8080`
- 健康检查：`GET /api/health`

## 命令

| 命令 | 说明 |
|------|------|
| `make build` | 构建二进制文件 |
| `make run` | 本地运行 |
| `make test` | 运行测试 |
| `make docker-up` | 启动 Docker 容器 |
| `make docker-down` | 停止 Docker 容器 |
| `make migrate-up` | 执行数据库迁移 |

