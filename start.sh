#!/bin/bash
# Schema Platform 启动脚本
#
# 使用方法:
#   ./start.sh                    # 使用内置数据库启动
#   ./start.sh --external-db      # 使用外部数据库启动
#   ./start.sh germline           # 只启动 Germline 团队
#   ./start.sh somatic            # 只启动 Somatic 团队

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 加载环境变量
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# 解析参数
TEAM="${1:-}"
USE_EXTERNAL_DB=false

for arg in "$@"; do
    if [ "$arg" = "--external-db" ]; then
        USE_EXTERNAL_DB=true
    fi
done

# 确定使用的 compose 文件
if [ "$USE_EXTERNAL_DB" = "true" ]; then
    COMPOSE_FILE="-f docker-compose.external.yml"
else
    COMPOSE_FILE="-f docker-compose.yml"
fi

# 确定 profile
case "$TEAM" in
    germline)
        PROFILE="--profile germline"
        ;;
    somatic)
        PROFILE="--profile somatic"
        ;;
    all|"")
        PROFILE="--profile all"
        ;;
    *)
        echo "未知参数: $TEAM"
        echo "可用参数: germline, somatic, all"
        exit 1
        ;;
esac

echo "=========================================="
echo "Schema Platform 启动"
echo "=========================================="
echo "部署模式: ${TEAM:-all}"
echo "使用外部数据库: $USE_EXTERNAL_DB"
echo "=========================================="

# 启动服务
docker compose $COMPOSE_FILE $PROFILE up -d

echo ""
echo "启动完成!"
echo "访问地址:"
echo "  - Germline: http://localhost:${GERMLINE_WEB_PORT:-3001}"
echo "  - Somatic:  http://localhost:${SOMATIC_WEB_PORT:-3002}"
