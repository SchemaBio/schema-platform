#!/bin/bash
# Schema Platform 启动脚本
#
# 使用方法:
#   ./start.sh                    # 使用内置数据库启动
#   ./start.sh --external-db      # 使用外部数据库启动

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 加载环境变量
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# 检查是否使用外部数据库
USE_EXTERNAL_DB=false
for arg in "$@"; do
    if [ "$arg" = "--external-db" ]; then
        USE_EXTERNAL_DB=true
        break
    fi
done

echo "=========================================="
echo "Schema Platform 启动"
echo "=========================================="
echo "使用外部数据库: $USE_EXTERNAL_DB"
echo "=========================================="

# 启动服务
if [ "$USE_EXTERNAL_DB" = "true" ]; then
    echo "使用外部数据库，跳过 PostgreSQL 容器..."
    # 只启动前端和后端，跳过 postgres
    docker compose up -d web-germline web-somatic backend-germline backend-somatic
else
    echo "使用内置数据库..."
    docker compose up -d
fi

echo ""
echo "启动完成!"
echo "访问地址:"
echo "  - Germline: http://localhost:${GERMLINE_WEB_PORT:-3001}"
echo "  - Somatic:  http://localhost:${SOMATIC_WEB_PORT:-3002}"
