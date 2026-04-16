#!/bin/bash
# =================================================================
# SchemaBio 业务实例启动脚本 (V3.0 - 零快照、全自动化初始化方案)
# =================================================================

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
COSCLI_BIN="/usr/local/bin/coscli"
DATA_DEV="/dev/vdb"  # 腾讯云第二块盘默认通常是 /dev/vdb
MOUNT_PATH="/mnt/data"

exec >> /var/log/schemabio-start.log 2>&1
echo "--- [$(date)] Startup sequence V3.0 initiated ---"

# 1. 数据盘初始化 (格式化 + Label + 挂载)
# -----------------------------------------------------------------
echo "Step 1: Checking data disk $DATA_DEV..."

# 检查磁盘是否已经有文件系统 (防止重启时重复格式化导致数据丢失)
if ! blkid $DATA_DEV; then
    echo "Disk $DATA_DEV is empty. Formatting now..."
    # -L: 设置标签为 SCHEMABIO_DATA
    # -i 4096: 增加 Inode 密度以支撑 VEP 百万级碎文件
    # -F: 强制执行
    mkfs.ext4 -F -L SCHEMABIO_DATA -i 4096 $DATA_DEV
else
    echo "Disk $DATA_DEV already formatted."
fi

# 执行挂载
mkdir -p $MOUNT_PATH
mount -L SCHEMABIO_DATA $MOUNT_PATH || mount $DATA_DEV $MOUNT_PATH

if ! mountpoint -q $MOUNT_PATH; then
    echo "ERROR: Data disk mount failed. Exiting."
    exit 1
fi

# 建立预设目录结构
mkdir -p $MOUNT_PATH/database
mkdir -p $MOUNT_PATH/output
mkdir -p $MOUNT_PATH/temp_workspace

echo "Data disk initialized and mounted at $MOUNT_PATH."

# 2. 获取任务参数 (REF_GENOME)
# -----------------------------------------------------------------
RAW_USER_DATA=$(curl -s http://metadata.tencentyun.com/latest/meta-data/custom-data)
TARGET_REF=$(echo "$RAW_USER_DATA" | grep -oP 'REF_GENOME=\K\S+')

if [ -z "$TARGET_REF" ]; then
    echo "Warning: No REF_GENOME specified, defaulting to hg19."
    TARGET_REF="hg19"
fi

# 3. 按需从 COS 准备数据库 (同步 + 管道解压 VEP)
# -----------------------------------------------------------------
LOCAL_DIR="$MOUNT_PATH/database/$TARGET_REF"
mkdir -p "$LOCAL_DIR"

case $TARGET_REF in
    "hg19")
        VEP_PKG="homo_sapiens_merged_vep_115_GRCh37.tar.gz"
        echo "Syncing hg19: Decompressing VEP cache from COS..."
        $COSCLI_BIN cp cos://schemabio-1327430028/database/hg19/$VEP_PKG - | tar -xz -C "$LOCAL_DIR/"
        
        echo "Syncing hg19: Copying genomic indices..."
        $COSCLI_BIN sync cos://schemabio-1327430028/database/hg19/ "$LOCAL_DIR/" --routines 16 --exclude "$VEP_PKG"
        ;;

    "hg38")
        VEP_PKG="homo_sapiens_merged_vep_115_GRCh38.tar.gz"
        echo "Syncing hg38: Decompressing VEP cache from COS..."
        $COSCLI_BIN cp cos://schemabio-1327430028/database/hg38/$VEP_PKG - | tar -xz -C "$LOCAL_DIR/"
        
        echo "Syncing hg38: Copying genomic indices..."
        $COSCLI_BIN sync cos://schemabio-1327430028/database/hg38/ "$LOCAL_DIR/" --routines 16 --exclude "$VEP_PKG"
        ;;
esac

echo "--- [$(date)] Database sync finished ---"

# 4. Docker 配置 (使用系统盘存储镜像)
# -----------------------------------------------------------------
# 注意：这里去掉了 data-root，镜像将保存在系统盘自定义镜像中
if command -v nvidia-smi &> /dev/null && nvidia-smi &> /dev/null; then
    DOCKER_CONFIG='{"storage-driver": "overlay2", "registry-mirrors": ["https://mirror.ccs.tencentyun.com"], "default-runtime": "nvidia", "runtimes": {"nvidia": {"path": "nvidia-container-runtime", "runtimeArgs": []}}}'
else
    DOCKER_CONFIG='{"storage-driver": "overlay2", "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]}'
fi

mkdir -p /etc/docker
echo "$DOCKER_CONFIG" > /etc/docker/daemon.json
systemctl daemon-reload
systemctl restart docker

echo "--- [$(date)] All systems ready ---"