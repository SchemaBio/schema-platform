#!/bin/bash
# =================================================================
# SchemaBio 业务实例启动脚本 (V3.1 - 修复元数据获取 + 状态锁机制)
# =================================================================

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
COSCLI_BIN="/usr/bin/coscli"
DATA_DEV="/dev/vdb"
MOUNT_PATH="/mnt/data"
LOCK_FILE="/var/run/schemabio_init.lock"

# 日志记录
exec >> /var/log/schemabio-start.log 2>&1
echo "--- [$(date)] Startup sequence V3.1 initiated ---"

# 0. 状态锁：开始初始化
# -----------------------------------------------------------------
if [ -f "$LOCK_FILE" ]; then
    echo "Warning: Lock file $LOCK_FILE exists. Process already running or interrupted."
fi
touch "$LOCK_FILE"

# 1. 数据盘初始化
# -----------------------------------------------------------------
echo "Step 1: Checking data disk $DATA_DEV..."
if ! blkid $DATA_DEV; then
    echo "Disk $DATA_DEV is empty. Formatting now..."
    mkfs.ext4 -F -L SCHEMABIO_DATA -i 4096 $DATA_DEV
else
    echo "Disk $DATA_DEV already formatted."
fi

mkdir -p $MOUNT_PATH
mount -L SCHEMABIO_DATA $MOUNT_PATH || mount $DATA_DEV $MOUNT_PATH

if ! mountpoint -q $MOUNT_PATH; then
    echo "ERROR: Data disk mount failed. Exiting."
    rm -f "$LOCK_FILE"
    exit 1
fi

mkdir -p $MOUNT_PATH/database $MOUNT_PATH/output $MOUNT_PATH/temp_workspace

# 2. 获取任务参数 (修复 Base64 解码问题)
# -----------------------------------------------------------------
echo "Step 2: Fetching user data from metadata..."
# 腾讯云 custom-data 默认返回 Base64 编码字符串，需要解码
RAW_METADATA=$(curl -s http://metadata.tencentyun.com/latest/meta-data/custom-data)
TARGET_REF=$(echo "$RAW_METADATA" | base64 -d 2>/dev/null | grep -oP 'REF_GENOME=\K\S+')

if [ -z "$TARGET_REF" ]; then
    echo "Warning: Failed to parse REF_GENOME from metadata (decoded), trying raw grep..."
    TARGET_REF=$(echo "$RAW_METADATA" | grep -oP 'REF_GENOME=\K\S+')
fi

if [ -z "$TARGET_REF" ]; then
    echo "Decision: No REF_GENOME found, defaulting to hg19."
    TARGET_REF="hg19"
else
    echo "Target Reference set to: $TARGET_REF"
fi

# 3. 从 COS 准备数据库
# -----------------------------------------------------------------
LOCAL_DIR="$MOUNT_PATH/database/$TARGET_REF"
mkdir -p "$LOCAL_DIR"

echo "Step 3: Preparing database for $TARGET_REF..."
case $TARGET_REF in
    "hg19")
        VEP_PKG="homo_sapiens_merged_vep_115_GRCh37.tar.gz"
        $COSCLI_BIN cp -r cos://schemabio-1327430028/database/hg19/ "$LOCAL_DIR/" --routines 16
        echo "Decompressing VEP cache (this may take a while)..."
        mkdir -p "$LOCAL_DIR/vep"
        tar -zxf "$LOCAL_DIR/$VEP_PKG" -C "$LOCAL_DIR/vep" # 去掉 v 减少日志压力
        rm "$LOCAL_DIR/$VEP_PKG"
        ;;
    "hg38")
        VEP_PKG="homo_sapiens_merged_vep_115_GRCh38.tar.gz"
        $COSCLI_BIN cp -r cos://schemabio-1327430028/database/hg38/ "$LOCAL_DIR/" --routines 16
        echo "Decompressing VEP cache..."
        mkdir -p "$LOCAL_DIR/vep"
        tar -zxf "$LOCAL_DIR/$VEP_PKG" -C "$LOCAL_DIR/vep"
        rm "$LOCAL_DIR/$VEP_PKG"
        ;;
esac

# 4. 权限修复
# -----------------------------------------------------------------
echo "Step 4: Fixing permissions for ubuntu user..."
chown -R ubuntu:ubuntu "$MOUNT_PATH"
find "$MOUNT_PATH" -type d -exec chmod 755 {} +
find "$MOUNT_PATH" -type f -exec chmod 644 {} +

# 5. Docker 配置
# -----------------------------------------------------------------
echo "Step 5: Configuring Docker..."
if command -v nvidia-smi &> /dev/null; then
    DOCKER_CONFIG='{"registry-mirrors": ["https://mirror.ccs.tencentyun.com"], "default-runtime": "nvidia", "runtimes": {"nvidia": {"path": "nvidia-container-runtime", "runtimeArgs": []}}}'
else
    DOCKER_CONFIG='{"registry-mirrors": ["https://mirror.ccs.tencentyun.com"]}'
fi

mkdir -p /etc/docker
echo "$DOCKER_CONFIG" > /etc/docker/daemon.json
systemctl daemon-reload
systemctl restart docker

# 6. 释放状态锁
# -----------------------------------------------------------------
rm -f "$LOCK_FILE"
echo "--- [$(date)] All systems ready. Lock released. ---"