# Schema Platform 部署指南 (4C4G 服务器)

> **目标服务器**: 4核4G内存 Linux x86_64  
> **容器运行时**: Docker + Docker Compose  
> **目录约定**: 所有 schema 项目克隆到 `/opt/schema/` 下

---

## 架构图

```
┌────────────────────────────────────────────────────┐
│                    4C4G 服务器                       │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ germline │  │ somatic  │  │  PostgreSQL │        │
│  │ :3001    │  │ :3002    │  │  :5432     │        │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘        │
│       │             │              │               │
│  ┌────▼─────────────▼──────────────▼──────┐        │
│  │            Octopus :8080               │        │
│  │    (用户API + 任务调度 + 结果查询)       │        │
│  └───────────────────┬───────────────────┘        │
│                      │                            │
│  ┌───────────────────▼───────────────────────┐    │
│  │        Sepiida Server :9090               │    │
│  │    (任务状态管理, 接收Agent推送)            │    │
│  └───────────────────┬───────────────────────┘    │
│                      │                            │
│  ┌───────────────────▼───────────────────────┐    │
│  │        Sepiida Agent                      │    │
│  │  (监控 /mnt/data/output, 60s轮询)         │    │
│  │  (自动归档到 /mnt/data/archive)            │    │
│  └───────────────────┬───────────────────────┘    │
│                      │                            │
│              ┌───────▼────────┐                    │
│              │  /mnt/data/    │  ← 挂载物理磁盘    │
│              │  output/       │    (miniWDL输出)   │
│              │  archive/      │    (归档结果)      │
│              │  templates/    │    (WDL模板)      │
│              └────────────────┘                    │
└────────────────────────────────────────────────────┘
```

---

## 第一步：环境准备

```bash
# 1. 安装 Docker (如果未安装)
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# 2. 创建项目目录
sudo mkdir -p /opt/schema /mnt/data/output /mnt/data/archive /mnt/data/templates
sudo chown -R $USER:$USER /opt/schema /mnt/data

# 3. 克隆三个仓库
cd /opt/schema
git clone https://github.com/your-org/schema-platform.git
git clone https://github.com/your-org/Octopus.git
git clone https://github.com/your-org/Sepiida.git
```

---

## 第二步：配置环境变量

```bash
cd /opt/schema/schema-platform
cp .env.example .env
nano .env
```

**必须修改的值：**

| 变量 | 说明 |
|------|------|
| `POSTGRES_PASSWORD` | 改为强密码 |
| `JWT_SECRET` | 改为 64 字符随机串：`openssl rand -hex 32` |
| `CORS_ALLOWED_ORIGINS` | 改为实际服务器 IP，如 `http://192.168.1.100:3001,http://192.168.1.100:3002` |
| `SEPIIDA_AGENT_KEY` | Agent 推送密钥 |
| `SEPIIDA_QUERY_KEY` | Octopus 查询密钥 |

---

## 第三步：创建 Sepiida 密钥文件

```bash
# 创建密钥目录并写入密钥
mkdir -p /opt/schema/sepiida-keys

# Agent 密钥 (用于 Agent → Server 推送)
echo "agent-dev-key" > /opt/schema/sepiida-keys/agent-keys.txt

# Query 密钥 (用于 Octopus → Server 查询)
echo "query-dev-key" > /opt/schema/sepiida-keys/query-keys.txt

# 设置权限
chmod 600 /opt/schema/sepiida-keys/*.txt
```

> **注意**: 密钥值必须与 `.env` 中的 `SEPIIDA_AGENT_KEY` / `SEPIIDA_QUERY_KEY` 一致。

---

## 第四步：准备 WDL 模板

```bash
# 将 WDL 模板文件放到模板目录
cp /path/to/your/*.wdl /mnt/data/templates/
cp /path/to/your/conf/*.cfg /mnt/data/templates/conf/
```

目录结构应为：
```
/mnt/data/templates/
├── SingleWES.wdl
├── FamilyWES.wdl
├── Panel.wdl
├── conf/
│   ├── local.cfg
│   ├── slurm.cfg       (如果使用 Slurm)
│   └── lsf.cfg         (如果使用 LSF)
└── ...
```

---

## 第五步：构建镜像

```bash
cd /opt/schema/schema-platform

# 构建后端镜像
docker compose build octopus sepiida-server sepiida-agent

# (可选) 构建前端镜像 (或使用 ghcr.io 预构建镜像)
# cd apps/web-germline && docker build -t ghcr.io/schemabio/schema-germline:latest .
# cd apps/web-somatic && docker build -t ghcr.io/schemabio/schema-somatic:latest .
```

---

## 第六步：启动服务

```bash
# 全部启动
docker compose --profile all up -d

# 或只启动特定模块
docker compose --profile germline up -d
docker compose --profile somatic up -d
```

---

## 第七步：验证

```bash
# 检查所有容器运行状态
docker compose ps

# 测试 Octopus 健康检查
curl http://localhost:8080/health
# → {"status":"healthy","service":"schema-platform"}

# 测试 Sepiida 健康检查
curl http://localhost:9090/health

# 测试登录 API
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schema.bio","password":"admin123"}'

# 访问前端 (用服务器 IP)
# 浏览器打开: http://<服务器IP>:3001  (Germline)
# 浏览器打开: http://<服务器IP>:3002  (Somatic)
```

---

## 第八步：配置 Nginx 反向代理 (可选，推荐)

```nginx
# /etc/nginx/sites-available/schema-platform
server {
    listen 80;
    server_name schema.your-domain.com;

    # Germline
    location /germline/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Somatic
    location /somatic/ {
        proxy_pass http://127.0.0.1:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API (内部访问)
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/schema-platform /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 常见问题

**Q: Sepiida Server 和 Octopus 是否应放在同一镜像？**  
A: **不建议。** 它们是独立的 Go 二进制文件，不同端口，不同生命周期。分开的容器可以独立重启、健康检查、日志收集。Docker Compose 自动管理依赖和网络。

**Q: 4C4G 够用吗？**  
A: 可以。估算：PostgreSQL ~300MB + Octopus ~150MB + Sepiida Server ~100MB + Agent ~50MB + 两个前端 ~400MB = 约 1GB/4GB。剩余内存用于 miniWDL 分析进程（不在容器内）。建议给宿主机预留 1-2GB 空闲。

**Q: PostgreSQL 数据如何备份？**  
A: 定时 `pg_dump`：
```bash
docker compose exec postgres pg_dump -U postgres schema_platform > backup.sql
# 添加到 crontab: 0 3 * * * docker compose exec ... > /backup/$(date +%Y%m%d).sql
```

**Q: 如何升级？**  
A: `git pull` 各仓库 → 重新 build → `docker compose up -d`。PostgreSQL 数据在 volume 中，不受影响。
