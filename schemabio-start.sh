#!/bin/bash
# =================================================================
# SchemaBio 业务实例启动脚本 (V2.0 - 按需拉取 + 镜像固化方案)
# =================================================================

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
COSCLI_BIN="/usr/local/bin/coscli"

# 所有的操作日志记录在 /var/log/schemabio-start.log
exec >> /var/log/schemabio-start.log 2>&1

echo "--- [$(date)] Startup sequence initiated ---"

# 1. 挂载数据盘 (由空快照创建，假设 Label 为 SCHEMABIO_DATA)
# -----------------------------------------------------------------
mkdir -p /mnt/data
mount -L SCHEMABIO_DATA /mnt/data || mount /dev/vdb /mnt/data

if ! mountpoint -q /mnt/data; then
    echo "ERROR: Data disk mount failed. Critical failure."
    exit 1
fi
echo "Data disk mounted successfully."

# 2. 获取任务参数 (通过腾讯云元数据获取 REF_GENOME 变量)
# -----------------------------------------------------------------
# 启动时在自定义数据输入 REF_GENOME=hg19 或 REF_GENOME=hg38
RAW_USER_DATA=$(curl -s http://metadata.tencentyun.com/latest/meta-data/custom-data)
TARGET_REF=$(echo "$RAW_USER_DATA" | grep -oP 'REF_GENOME=\K\S+')

# 如果没有获取到参数，默认设为 hg19 (或根据业务需求设为报错退出)
if [ -z "$TARGET_REF" ]; then
    echo "Warning: No REF_GENOME specified in UserData, defaulting to hg19."
    TARGET_REF="hg19"
fi
echo "Task target detected: $TARGET_REF"

# 3. 按需从 COS 准备数据库 (边下载边解压 VEP + 同步索引)
# -----------------------------------------------------------------
DB_LOCAL_PATH="/mnt/data/database"
LOCAL_DIR="$DB_LOCAL_PATH/$TARGET_REF"
mkdir -p "$LOCAL_DIR"

case $TARGET_REF in
    "hg19")
        VEP_PKG="homo_sapiens_merged_vep_115_GRCh37.tar.gz"
        echo "Step 3a: Streaming decompression for VEP hg19 (GRCh37)..."
        # 管道操作：边下载压缩包边解压，- 代表输出到 stdout，解压到 $LOCAL_DIR 下
        $COSCLI_BIN cp cos://schemabio-1327430028/database/hg19/$VEP_PKG - | tar -xz -C "$LOCAL_DIR/"
        
        echo "Step 3b: Syncing remaining hg19 indices (excluding tar.gz)..."
        $COSCLI_BIN sync cos://schemabio-1327430028/database/hg19/ "$LOCAL_DIR/" --routines 16 --exclude "$VEP_PKG"
        ;;

    "hg38")
        VEP_PKG="homo_sapiens_merged_vep_115_GRCh38.tar.gz"
        echo "Step 3a: Streaming decompression for VEP hg38 (GRCh38)..."
        $COSCLI_BIN cp cos://schemabio-1327430028/database/hg38/$VEP_PKG - | tar -xz -C "$LOCAL_DIR/"
        
        echo "Step 3b: Syncing remaining hg38 indices (excluding tar.gz)..."
        $COSCLI_BIN sync cos://schemabio-1327430028/database/hg38/ "$LOCAL_DIR/" --routines 16 --exclude "$VEP_PKG"
        ;;
    *)
        echo "ERROR: Unsupported REF_GENOME: $TARGET_REF. Skipping data sync."
        ;;
esac

echo "--- [$(date)] Database preparation finished ---"

# 4. 配置 Docker 运行环境 (镜像已在系统盘中)
# -----------------------------------------------------------------
# 探测 GPU 驱动环境，动态生成 daemon.json
if command -v nvidia-smi &> /dev/null && nvidia-smi &> /dev/null; then
    echo "GPU detected: Setting NVIDIA as default runtime."
    DOCKER_CONFIG=$(cat <<EOT
{
  "storage-driver": "overlay2",
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"],
  "default-runtime": "nvidia",
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}
EOT
)
else
    echo "No GPU detected: Configuring standard CPU Docker."
    DOCKER_CONFIG=$(cat <<EOT
{
  "storage-driver": "overlay2",
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
}
EOT
)
fi

mkdir -p /etc/docker
echo "$DOCKER_CONFIG" > /etc/docker/daemon.json

# 重启 Docker 使配置生效
systemctl daemon-reload
systemctl restart docker

# 检查 40GB 核心分析镜像是否就绪 (替换为你实际的镜像名)
echo "Verifying local Docker images..."
docker images

echo "--- [$(date)] Startup sequence completed successfully ---"