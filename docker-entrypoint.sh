#!/bin/sh
set -e

echo "=========================================="
echo "  Schema Platform - Starting Services"
echo "=========================================="
echo ""

# 检查是否跳过了构建
check_build_skipped() {
    if [ -f "$1/.next/BUILD_SKIPPED" ]; then
        return 0
    fi
    return 1
}

# 启动 web-germline
start_germline() {
    if [ "$DEPLOY_GERMLINE" = "true" ]; then
        if check_build_skipped "/app/apps/web-germline"; then
            echo "[WARN] web-germline was not built, skipping..."
        else
            echo "[INFO] Starting web-germline on port $GERMLINE_PORT..."
            cd /app/apps/web-germline
            PORT=$GERMLINE_PORT node_modules/.bin/next start &
            GERMLINE_PID=$!
            echo "[INFO] web-germline started (PID: $GERMLINE_PID)"
        fi
    else
        echo "[INFO] web-germline deployment disabled"
    fi
}

# 启动 web-somatic
start_somatic() {
    if [ "$DEPLOY_SOMATIC" = "true" ]; then
        if check_build_skipped "/app/apps/web-somatic"; then
            echo "[WARN] web-somatic was not built, skipping..."
        else
            echo "[INFO] Starting web-somatic on port $SOMATIC_PORT..."
            cd /app/apps/web-somatic
            PORT=$SOMATIC_PORT node_modules/.bin/next start &
            SOMATIC_PID=$!
            echo "[INFO] web-somatic started (PID: $SOMATIC_PID)"
        fi
    else
        echo "[INFO] web-somatic deployment disabled"
    fi
}

# 启动服务
start_germline
start_somatic

echo ""
echo "=========================================="
echo "  Services Status:"
if [ "$DEPLOY_GERMLINE" = "true" ] && ! check_build_skipped "/app/apps/web-germline"; then
    echo "  - web-germline: http://localhost:$GERMLINE_PORT"
fi
if [ "$DEPLOY_SOMATIC" = "true" ] && ! check_build_skipped "/app/apps/web-somatic"; then
    echo "  - web-somatic:  http://localhost:$SOMATIC_PORT"
fi
echo "=========================================="
echo ""

# 等待所有后台进程
wait
