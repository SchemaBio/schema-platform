# Somatic 肿瘤分析数据模型设计

> 基于 `apps/web-somatic` 前端项目分析

## 1. 概述

### 1.1 项目定位
肿瘤样本体细胞突变分析平台，支持多种分析流程：
- 组织单样本分析
- 组织配对样本分析 (肿瘤 vs 正常)
- 血浆单样本分析 (ctDNA)
- 血浆配对分析 (ctDNA vs 白细胞)
- RNA融合分析

### 1.2 核心设计原则
- **分析结果存储**: 单个样本的分析结果不建表，生成 Parquet 文件，仅在数据库中存储路径
- **元数据管理**: 数据库仅存储任务元数据、状态、输入/输出路径引用

---

## 2. 系统共用表 (与 Germline 共用)

> 以下表由系统统一管理，两个项目共用

### 2.1 用户表 (users)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| email | VARCHAR(255) | 邮箱 (唯一) |
| name | VARCHAR(255) | 姓名 |
| password_hash | VARCHAR(255) | 密码哈希 |
| role | ENUM | 角色 (ADMIN/DOCTOR/ANALYST/VIEWER) |
| is_active | BOOLEAN | 是否激活 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 软删除时间 |

### 2.2 团队表 (teams)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(255) | 团队名称 |
| description | TEXT | 描述 |
| owner_id | UUID | 所有者ID (引用users) |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2.3 团队成员表 (team_members)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID |
| team_id | UUID | 团队ID |
| role | ENUM | 角色 |
| joined_at | TIMESTAMP | 加入时间 |

### 2.4 权限表 (permissions)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| code | VARCHAR(100) | 权限代码 (如 user:create) |
| name | VARCHAR(255) | 权限名称 |
| description | TEXT | 描述 |
| resource | VARCHAR(100) | 资源类型 |
| action | VARCHAR(50) | 操作类型 |

### 2.5 角色权限表 (role_permissions)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| role | VARCHAR(20) | 角色 |
| permission_id | UUID | 权限ID |

### 2.6 系统配置表 (system_config)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| key | VARCHAR(255) | 配置键 (唯一) |
| value | JSONB | 配置值 |
| version | INT | 版本号 (乐观锁) |
| updated_at | TIMESTAMP | 更新时间 |

### 2.7 用户设置表 (user_settings)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID (唯一) |
| display_settings | JSONB | 显示设置 |
| notification_settings | JSONB | 通知设置 |
| analysis_settings | JSONB | 分析设置 |
| updated_at | TIMESTAMP | 更新时间 |

### 2.8 测序平台表 (sequencers)

> 测序仪/测序平台配置

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 名称 |
| serial_number | VARCHAR(100) | 序列号 |
| platform | ENUM('illumina','bgi') | 平台类型 |
| model | VARCHAR(100) | 型号 |
| data_path | TEXT | 数据存储路径 |
| status | ENUM('online','offline','maintenance') | 状态 |
| last_sync_at | TIMESTAMP | 最后同步时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2.9 测序运行表 (sequencing_runs)

> 上机运行记录 (Run)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| run_id | VARCHAR(50) | 运行编号 (如 RUN-2024120001) |
| sequencer_id | UUID | 测序仪ID |
| flowcell_id | VARCHAR(100) | Flowcell 编号 |
| flowcell_type | VARCHAR(50) | Flowcell 类型 |
| sequencing_date | DATE | 测序日期 |
| read_length | VARCHAR(20) | 读长 (如 150PE) |
| total_yield_gb | DECIMAL | 总产量 (GB) |
| q30_rate | DECIMAL | Q30 比例 |
| passing_filter_clusters | BIGINT | 合格簇数 |
| status | ENUM('pending','running','completed','failed') | 状态 |
| notes | TEXT | 备注 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2.10 样本单表 (sample_sheets)

> 样本上机清单 (SampleSheet)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| file_name | VARCHAR(255) | 文件名 |
| run_id | UUID | 关联测序运行ID |
| sequencer_id | UUID | 关联测序仪ID |
| sample_count | INT | 样本数量 |
| matched_count | INT | 已匹配数量 |
| unmatched_count | INT | 未匹配数量 |
| status | ENUM('processing','completed','error') | 状态 |
| uploaded_by | UUID | 上传者 |
| uploaded_at | TIMESTAMP | 上传时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2.11 样本索引表 (sample_indices)

> 样本的 Index 序列信息 (可多 lane)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| sample_sheet_id | UUID | 样本单ID |
| sample_id | UUID | 样本ID |
| lane | VARCHAR(10) | 泳道号 |
| index_5 | VARCHAR(20) | 5' Index 序列 |
| index_7 | VARCHAR(20) | 7' Index 序列 (BGI) |
| project_name | VARCHAR(100) | 项目名称 |
| description | VARCHAR(255) | 描述 |
| matched | BOOLEAN | 是否已匹配样本 |
| created_at | TIMESTAMP | 创建时间 |

### 2.12 数据文件表 (data_files)

> 原始测序数据文件记录

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| sample_id | UUID | 关联样本ID |
| run_id | UUID | 关联测序运行ID |
| lane | VARCHAR(10) | 泳道号 |
| file_name | VARCHAR(255) | 文件名 |
| file_path | TEXT | 文件路径 |
| file_size | BIGINT | 文件大小 (字节) |
| file_type | ENUM('fastq','fastq.gz','bam','ubam','cram') | 文件类型 |
| read_type | ENUM('R1','R2','SE') | 读类型 |
| md5_hash | VARCHAR(32) | MD5 校验码 |
| status | ENUM('pending','imported','archived','deleted') | 状态 |
| imported_at | TIMESTAMP | 导入时间 |
| created_at | TIMESTAMP | 创建时间 |

### 2.13 BED 文件表 (bed_files)

> 靶向测序区域文件

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 名称 |
| description | TEXT | 描述 |
| file_path | VARCHAR(255) | 文件路径 |
| target_size_bp | BIGINT | 目标区域大小 (bp) |
| panel_version | VARCHAR(50) | Panel 版本 |
| gene_count | INT | 包含基因数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2.14 基线文件表 (baseline_files)

> CNV/MSI 分析基线文件

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 名称 |
| baseline_type | ENUM('cnv','msi','other') | 基线类型 |
| file_path | VARCHAR(255) | 文件路径 |
| version | VARCHAR(20) | 版本 |
| description | TEXT | 描述 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

---

## 3. Somatic 业务表

### 3.1 核心实体关系图

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Sample    │────▶│ AnalysisTask │────▶│ ResultFile  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌──────────────┐
       └───────────▶│  Pipeline    │
                    └──────────────┘
```

### 3.2 样本表 (samples)

> 肿瘤样本基本信息

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| internal_id | VARCHAR(50) | 内部编号 (用户自定义) |
| name | VARCHAR(255) | 样本名称 (脱敏) |
| gender | ENUM('male','female','unknown') | 性别 |
| age | INT | 年龄 |
| birth_date | DATE | 出生日期 |
| sample_type | ENUM | 样本类型 (FFPE/新鲜组织/全血/cfDNA/胸腹水/骨髓/其他) |
| nucleic_acid_type | ENUM('DNA','RNA') | 核酸类型 |
| tumor_type | VARCHAR(100) | 肿瘤类型/原发部位 |
| paired_sample_id | UUID | 配对样本ID (可选) |
| status | ENUM | 状态 (pending/matched/analyzing/completed) |
| hospital | VARCHAR(255) | 送检单位 |
| test_items | TEXT | 检测项目 |
| data_count | INT | 关联数据文件数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 扩展信息 (JSONB 字段)

```json
{
  "tumor_info": {
    "pathology_type": "string",
    "clinical_stage": "I|II|III|IV|unknown",
    "tnm_stage": { "t": "string", "n": "string", "m": "string" },
    "tumor_purity": 0.85
  },
  "source_info": {
    "sample_source": "primary|metastasis|ctDNA|other",
    "sampling_method": "surgery|biopsy|liquid|other",
    "is_paired": true,
    "sampling_date": "2024-01-15",
    "sampling_location": "肺部"
  },
  "treatment_info": {
    "has_prior_treatment": true,
    "prior_treatments": [
      { "type": "chemotherapy", "detail": "顺铂+培美曲塞", "date": "2023-06" }
    ],
    "current_medication": "奥希替尼",
    "is_resistant": false,
    "is_recurrent": false
  },
  "test_requirement": {
    "test_purpose": "initial|resistance|recurrence|mrd|other",
    "focus_genes": ["EGFR", "ALK", "ROS1"],
    "clinical_question": "寻求靶向治疗方案"
  },
  "project_info": {
    "project_id": "UUID",
    "project_name": "实体瘤150基因检测",
    "test_items": ["SNV", "InDel", "CNV", "Fusion"],
    "panel": "实体瘤150基因Panel V2",
    "turnaround_days": 14,
    "priority": "normal|urgent"
  }
}
```

### 3.3 分析任务表 (analysis_tasks)

> 分析任务元数据

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(255) | 任务名称 |
| sample_id | UUID | 关联样本ID |
| pipeline_id | UUID | 使用的分析流程ID |
| pipeline_version | VARCHAR(50) | 流程版本 |
| status | ENUM | 状态 (queued/running/completed/failed/pending_interpretation) |
| input_data_path | TEXT | 输入数据路径 (JSON数组) |
| output_parquet_path | TEXT | 输出Parquet文件路径 |
| created_by | UUID | 创建者 |
| created_at | TIMESTAMP | 创建时间 |
| started_at | TIMESTAMP | 开始时间 |
| completed_at | TIMESTAMP | 完成时间 |
| error_message | TEXT | 错误信息 |

### 3.4 分析流程表 (pipelines)

> 分析流程配置

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 流程名称 |
| base_pipeline | ENUM | 基础流程类型 |
| version | VARCHAR(20) | 版本号 |
| description | TEXT | 描述 |
| bed_file | VARCHAR(255) | BED文件路径 |
| reference_genome | VARCHAR(20) | 参考基因组 (hg19/hg38) |
| cnv_baseline | VARCHAR(255) | CNV基线文件 (可选) |
| msi_baseline | VARCHAR(255) | MSI基线文件 (可选) |
| status | ENUM('active','inactive') | 状态 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**base_pipeline 类型:**
- `tissue_single`: 组织单样本分析
- `tissue_paired`: 组织配对样本分析
- `plasma_single`: 血浆单样本分析
- `plasma_paired`: 血浆配对分析
- `rna_fusion`: RNA融合分析

### 3.5 结果文件表 (result_files)

> 分析结果Parquet文件引用

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| task_id | UUID | 关联分析任务ID |
| result_type | ENUM | 结果类型 |
| file_path | TEXT | Parquet文件路径 |
| file_size | BIGINT | 文件大小 (字节) |
| record_count | INT | 记录数 |
| created_at | TIMESTAMP | 创建时间 |

**result_type 类型:**
- `snv_indel`: SNV/InDel变异
- `cnv_segment`: CNV片段级别
- `cnv_exon`: CNV外显子级别
- `cnv_chrom`: CNV染色体级别
- `fusion`: 融合基因
- `hotspot`: Hotspot位点
- `germline`: 胚系位点
- `chemotherapy`: 化疗位点
- `mitochondrial`: 线粒体变异
- `str`: 动态突变
- `upd`: UPD区域
- `neoantigen`: 新抗原
- `biomarker`: 生物标志物
- `qc`: 质控结果

### 3.6 存储源配置表 (storage_sources)

> 文件存储后端配置

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 名称 |
| protocol | ENUM('webdav','s3','smb') | 存储协议 |
| endpoint | VARCHAR(500) | 连接地址 |
| base_path | TEXT | 基础路径 |
| credentials | JSONB | 加密凭证 |
| is_default | BOOLEAN | 是否默认 |
| created_at | TIMESTAMP | 创建时间 |

---

## 4. Parquet 文件格式设计

### 4.1 SNV/InDel 结果 Parquet

| 列名 | 类型 | 说明 |
|------|------|------|
| id | STRING | 变异唯一ID |
| gene | STRING | 基因名 (HGNC) |
| chromosome | STRING | 染色体 (无chr前缀) |
| position | INT64 | 位置 |
| ref | STRING | 参考碱基 |
| alt | STRING | 变异碱基 |
| variant_type | STRING | SNV/Insertion/Deletion/Complex |
| zygosity | STRING | Heterozygous/Homozygous/Hemizygous |
| allele_frequency | FLOAT64 | VAF |
| depth | INT32 | 覆盖深度 |
| acmg_classification | STRING | ACMG分类 |
| tier | STRING | Tier I-IV |
| transcript | STRING | 转录本 |
| hgvsc | STRING | cDNA变化 |
| hgvsp | STRING | 蛋白质变化 |
| consequence | STRING | 变异后果 |
| rs_id | STRING | dbSNP ID |
| clinvar_id | STRING | ClinVar ID |
| clinvar_significance | STRING | ClinVar临床意义 |
| gnomad_af | FLOAT64 | gnomAD频率 |
| cadd_score | FLOAT64 | CADD评分 |
| splice_ai | FLOAT64 | SpliceAI评分 |
| disease_association | STRING | 疾病关联 |
| reviewed | BOOLEAN | 已审核 |
| reported | BOOLEAN | 已回报 |

### 4.2 CNV 结果 Parquet

| 列名 | 类型 | 说明 |
|------|------|------|
| id | STRING | CNV唯一ID |
| chromosome | STRING | 染色体 |
| start_position | INT64 | 起始位置 |
| end_position | INT64 | 终止位置 |
| length | INT64 | 长度 |
| type | STRING | Amplification/Deletion |
| copy_number | FLOAT64 | 拷贝数 |
| genes | ARRAY<STRING> | 涉及基因列表 |
| confidence | FLOAT64 | 可信度 |
| clingen_classification | STRING | ClinGen分类 |
| tier | STRING | Tier I-IV |

### 4.3 Fusion 结果 Parquet

| 列名 | 类型 | 说明 |
|------|------|------|
| id | STRING | 融合唯一ID |
| gene5 | STRING | 5'基因 |
| gene3 | STRING | 3'基因 |
| transcript5 | STRING | 5'转录本 |
| transcript3 | STRING | 3'转录本 |
| fusion_type | STRING | Inversion/Translocation |
| breakpoint5 | STRING | 5'断裂点 |
| breakpoint3 | STRING | 3'断裂点 |
| break_region5 | STRING | 5'断裂区域 |
| break_region3 | STRING | 3'断裂区域 |
| predicted_frame | STRING | In-frame/Out-of-frame/Unknown |
| domain_status | STRING | Retained/Lost/Partial/Unknown |
| vaf | FLOAT64 | 变异等位基因频率 |
| depth | INT32 | 覆盖深度 |
| split_reads | INT32 | 分读数 |
| spanning_reads | INT32 | 跨越读数 |
| clinical_significance | STRING | Tier I-IV |
| related_cancers | ARRAY<STRING> | 相关癌症 |
| targeted_drugs | ARRAY<STRING> | 靶向药物 |

### 4.4 QC 结果 Parquet

| 列名 | 类型 | 说明 |
|------|------|------|
| metric | STRING | 指标名称 |
| value | FLOAT64 | 指标值 |
| status | STRING | success/warning/danger |

**QC 指标:**
- total_reads: 总读数
- mapped_reads: 比对读数
- mapping_rate: 比对率
- average_depth: 平均深度
- dedup_depth: 去重深度
- target_coverage: 目标区域覆盖率
- duplicate_rate: 重复率
- q30_rate: Q30比例
- insert_size: 插入片段大小
- gc_ratio: GC比例
- uniformity: 均一性
- capture_efficiency: 捕获效率
- contamination_rate: 污染比例
- tumor_purity: 肿瘤细胞含量 (配对分析)

---

## 5. 数据库索引策略

### 5.1 数据库索引
```sql
-- 样本表索引
CREATE INDEX idx_samples_tumor_type ON samples(tumor_type);
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_hospital ON samples(hospital);

-- 任务表索引
CREATE INDEX idx_tasks_sample_id ON analysis_tasks(sample_id);
CREATE INDEX idx_tasks_status ON analysis_tasks(status);
CREATE INDEX idx_tasks_pipeline_id ON analysis_tasks(pipeline_id);
CREATE INDEX idx_tasks_created_at ON analysis_tasks(created_at DESC);

-- 结果文件索引
CREATE INDEX idx_result_files_task_id ON result_files(task_id);
CREATE INDEX idx_result_files_type ON result_files(result_type);
```

### 5.2 Parquet 索引
使用 Parquet 的列式存储特性，按以下列排序优化查询：
- SNV: gene, chromosome, position, acmg_classification
- CNV: chromosome, type, clingen_classification
- Fusion: gene5, gene3, clinical_significance

---

## 6. 数据流

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  文件上传    │────▶│  任务创建    │────▶│  流程执行    │
└──────────────┘     └──────────────┘     └──────────────┘
                                              │
                                              ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  结果展示    │◀────│  Parquet存储 │◀────│  结果生成    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 7. 预留扩展字段

### 7.1 基因列表 (gene_lists)
```sql
CREATE TABLE gene_lists (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    genes TEXT[],  -- 基因列表
    category VARCHAR(50),  -- 核心基因/重要基因/可选基因
    created_at TIMESTAMP
);
```

### 7.2 知识库 (knowledge_base)
```sql
CREATE TABLE knowledge_entries (
    id UUID PRIMARY KEY,
    type ENUM('gene','variant','drug'),
    content JSONB,
    source VARCHAR(100),
    created_at TIMESTAMP
);
```

---

## 8. 总结

| 存储位置 | 内容 | 说明 |
|----------|------|------|
| PostgreSQL | 样本、任务、流程、存储配置等元数据 | 结构化查询、关联分析 |
| Parquet Files | 分析结果数据 | SNV/CNV/Fusion等，列式存储优化分析 |
| Object Storage | 原始文件 (FASTQ/BAM) | 大文件存储 |
