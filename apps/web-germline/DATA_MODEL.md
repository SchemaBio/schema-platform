# Germline 遗传分析数据模型设计

> 基于 `apps/web-germline` 前端项目分析

## 1. 概述

### 1.1 项目定位
遗传病胚系突变分析平台，专注于家系样本的全外显子组(WES)或基因Panel检测：
- 支持家系分析（三代家系）
- 先证者驱动的样本管理
- 遗传模式分析（AD/AR/XL等）

### 1.2 核心设计原则
- **分析结果存储**: 单个样本的分析结果不建表，生成 Parquet 文件，仅在数据库中存储路径
- **家系关系**: 家系作为核心组织单位，样本关联到家系

---

## 2. 系统共用表 (与 Somatic 共用)

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
| run_id | VARCHAR(50) | 运行编号 |
| sequencer_id | UUID | 测序仪ID |
| flowcell_id | VARCHAR(100) | Flowcell 编号 |
| flowcell_type | VARCHAR(50) | Flowcell 类型 |
| sequencing_date | DATE | 测序日期 |
| read_length | VARCHAR(20) | 读长 |
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

> 样本的 Index 序列信息

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

### 2.14 基因列表表 (gene_lists)

> 分析基因列表配置

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 列表名称 |
| description | TEXT | 描述 |
| genes | TEXT[] | 基因符号数组 |
| category | ENUM('core','important','optional') | 分类 |
| disease_category | VARCHAR(100) | 疾病分类 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

---

## 3. Germline 业务表

### 3.1 核心实体关系图

```
┌─────────────┐     ┌──────────────┐
│  Pedigree   │────▶│ PedigreeMember│
└─────────────┘     └──────────────┘
      │                   │
      │                   ▼
      │            ┌──────────────┐
      │            │    Sample    │
      └────────────┼──────────────┘
                   │
                   ▼
            ┌──────────────┐
            │ AnalysisTask │
            └──────────────┘
                   │
                   ▼
            ┌──────────────┐
            │ ResultFile   │
            └──────────────┘
```

### 3.2 家系表 (pedigrees)

> 家系基本信息

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 家系名称 |
| disease | VARCHAR(255) | 主要疾病/临床诊断 |
| proband_member_id | UUID | 先证者成员ID |
| note | TEXT | 备注 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 3.3 家系成员表 (pedigree_members)

> 家系成员（不限于有样本的成员）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| pedigree_id | UUID | 关联家系ID |
| sample_id | UUID | 关联样本ID (可选，未采样成员为空) |
| name | VARCHAR(100) | 成员姓名 |
| gender | ENUM('male','female','unknown') | 性别 |
| birth_year | INT | 出生年份 |
| is_deceased | BOOLEAN | 是否已故 |
| deceased_year | INT | 去世年份 (可选) |
| relation | ENUM | 与先证者关系 |
| affected_status | ENUM | 患病状态 |
| phenotypes | TEXT[] | 表型描述 |
| father_id | UUID | 父亲成员ID |
| mother_id | UUID | 母亲成员ID |
| generation | INT | 代数 (0为先证者代) |
| position | INT | 同代位置 |

**relation 类型:**
- `proband`: 先证者
- `father`: 父亲
- `mother`: 母亲
- `sibling`: 兄弟姐妹
- `child`: 子女
- `spouse`: 配偶
- `grandfather_paternal`: 祖父
- `grandmother_paternal`: 祖母
- `grandfather_maternal`: 外祖父
- `grandmother_maternal`: 外祖母
- `uncle`: 叔伯/舅舅
- `aunt`: 姑姑/阿姨
- `cousin`: 堂/表兄弟姐妹
- `other`: 其他

**affected_status 类型:**
- `affected`: 患病
- `unaffected`: 未患病
- `unknown`: 未知
- `carrier`: 携带者 (AR病)

### 3.4 样本表 (samples)

> 遗传样本信息

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| internal_id | VARCHAR(50) | 内部编号 |
| name | VARCHAR(255) | 样本名称 (脱敏) |
| gender | ENUM('male','female','unknown') | 性别 |
| age | INT | 年龄 |
| birth_date | DATE | 出生日期 |
| sample_type | ENUM | 样本类型 |
| pedigree_id | UUID | 关联家系ID |
| hospital | VARCHAR(255) | 送检单位 |
| test_project | VARCHAR(255) | 送检项目 |
| data_count | INT | 关联数据文件数 |
| status | ENUM | 状态 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**sample_type:**
- `全血`
- `唾液`
- `DNA`
- `组织`
- `其他`

#### 扩展信息 (JSONB 字段)

```json
{
  "clinical_diagnosis": {
    "main_diagnosis": "肥厚型心肌病",
    "symptoms": ["呼吸困难", "胸痛", "晕厥"],
    "hpo_terms": [
      { "id": "HP:0001638", "name": "心肌病" },
      { "id": "HP:0001644", "name": "心力衰竭" }
    ],
    "onset_age": "青年期",
    "disease_history": "无特殊病史"
  },
  "submission_info": {
    "hospital": "XX医院心内科",
    "department": "心血管内科",
    "doctor": "张医生",
    "submission_date": "2024-12-20",
    "sample_collection_date": "2024-12-18",
    "sample_receive_date": "2024-12-19",
    "sample_quality": "good"
  },
  "project_info": {
    "project_id": "UUID",
    "project_name": "遗传性心肌病基因检测",
    "test_items": ["SNV", "InDel", "CNV"],
    "panel": "遗传性心肌病Panel (120基因)",
    "turnaround_days": 21,
    "priority": "normal|urgent"
  },
  "family_history": {
    "has_history": true,
    "affected_members": [
      { "relation": "father", "condition": "肥厚型心肌病", "onset_age": "45岁" },
      { "relation": "uncle_paternal", "condition": "猝死", "onset_age": "38岁" }
    ],
    "pedigree_note": "家系中多代有心肌病和猝死病史"
  }
}
```

### 3.5 分析任务表 (analysis_tasks)

> 分析任务元数据

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(255) | 任务名称 |
| sample_id | UUID | 关联样本ID |
| pipeline_id | UUID | 使用的分析流程ID |
| pipeline_version | VARCHAR(50) | 流程版本 |
| status | ENUM | 状态 |
| input_data_path | TEXT | 输入数据路径 (JSON数组) |
| output_parquet_path | TEXT | 输出Parquet文件路径 |
| created_by | UUID | 创建者 |
| created_at | TIMESTAMP | 创建时间 |
| started_at | TIMESTAMP | 开始时间 |
| completed_at | TIMESTAMP | 完成时间 |
| error_message | TEXT | 错误信息 |

### 3.6 分析流程表 (pipelines)

> 分析流程配置

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 流程名称 |
| base_pipeline | ENUM('wes','panel') | 基础流程类型 |
| version | VARCHAR(20) | 版本号 |
| description | TEXT | 描述 |
| bed_file | VARCHAR(255) | BED文件路径 |
| reference_genome | VARCHAR(20) | 参考基因组 |
| gene_list_id | UUID | 关联基因列表ID |
| status | ENUM('active','inactive') | 状态 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 3.7 结果文件表 (result_files)

> 分析结果Parquet文件引用

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| task_id | UUID | 关联分析任务ID |
| result_type | ENUM | 结果类型 |
| file_path | TEXT | Parquet文件路径 |
| file_size | BIGINT | 文件大小 |
| record_count | INT | 记录数 |
| created_at | TIMESTAMP | 创建时间 |

**result_type 类型:**
- `snv_indel`: SNV/InDel变异
- `cnv_segment`: CNV片段级别
- `cnv_exon`: CNV外显子级别
- `str`: 动态突变
- `mitochondrial`: 线粒体变异
- `upd`: UPD区域
- `sanger`: Sanger验证
- `qc`: 质控结果

> 注：基因列表表 (gene_lists) 详见 [Section 2.14](./README.md#214-基因列表表-gene_lists)

### 3.8 Sanger验证表 (sanger_validations)

> Sanger测序验证记录

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| task_id | UUID | 关联分析任务ID |
| variant_id | STRING | 关联变异ID |
| variant_type | ENUM('SNV','Indel','CNV') | 变异类型 |
| gene | VARCHAR(50) | 基因名 |
| chromosome | VARCHAR(10) | 染色体 |
| position | INT64 | 位置 |
| hgvsc | VARCHAR(50) | cDNA变化 |
| hgvsp | VARCHAR(50) | 蛋白质变化 |
| zygosity | ENUM | 纯合/杂合状态 |
| status | ENUM('Pending','InProgress','Completed','Failed') | 状态 |
| result | ENUM('Confirmed','NotConfirmed','Inconclusive') | 结果 |
| primer_forward | VARCHAR(100) | 正向引物 |
| primer_reverse | VARCHAR(100) | 反向引物 |
| product_size | INT | 产物大小 |
| requested_by | UUID | 申请人 |
| requested_at | TIMESTAMP | 申请时间 |
| completed_by | UUID | 完成人 |
| completed_at | TIMESTAMP | 完成时间 |
| notes | TEXT | 备注 |

---

## 4. Parquet 文件格式设计

### 4.1 SNV/InDel 结果 Parquet

| 列名 | 类型 | 说明 |
|------|------|------|
| id | STRING | 变异唯一ID |
| gene | STRING | 基因名 |
| chromosome | STRING | 染色体 |
| position | INT64 | 位置 |
| ref | STRING | 参考碱基 |
| alt | STRING | 变异碱基 |
| variant_type | STRING | SNV/Insertion/Deletion |
| zygosity | STRING | 纯合/杂合状态 |
| allele_frequency | FLOAT64 | 等位基因频率 |
| depth | INT32 | 覆盖深度 |
| acmg_classification | STRING | ACMG分类 |
| transcript | STRING | 转录本 |
| hgvsc | STRING | cDNA变化 |
| hgvsp | STRING | 蛋白质变化 |
| consequence | STRING | 变异后果 |
| rs_id | STRING | dbSNP ID |
| clinvar_id | STRING | ClinVar ID |
| clinvar_significance | STRING | ClinVar临床意义 |
| gnomad_af | FLOAT64 | gnomAD频率 |
| cadd_score | FLOAT64 | CADD评分 |
| revel_score | FLOAT64 | REVEL评分 |
| splice_ai | FLOAT64 | SpliceAI评分 |
| acmg_criteria | ARRAY<STRING> | ACMG证据项 |
| omim_id | STRING | OMIM ID |
| disease_association | STRING | 疾病关联 |
| inheritance_mode | STRING | 遗传模式 |
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

### 4.3 线粒体变异 Parquet

| 列名 | 类型 | 说明 |
|------|------|------|
| id | STRING | 变异唯一ID |
| position | INT64 | 位置 |
| ref | STRING | 参考碱基 |
| alt | STRING | 变异碱基 |
| gene | STRING | 基因名 |
| heteroplasmy | FLOAT64 | 异质性比例 |
| pathogenicity | STRING | 致病性分类 |
| associated_disease | STRING | 关联疾病 |
| haplogroup | STRING | 单倍群 |

### 4.4 STR 动态突变 Parquet

| 列名 | 类型 | 说明 |
|------|------|------|
| id | STRING | 变异唯一ID |
| gene | STRING | 基因名 |
| transcript | STRING | 转录本 |
| locus | STRING | 位点名称 |
| repeat_unit | STRING | 重复单元 |
| repeat_count | INT32 | 重复次数 |
| normal_range_min | INT32 | 正常范围下限 |
| normal_range_max | INT32 | 正常范围上限 |
| status | STRING | Normal/Premutation/FullMutation |

### 4.5 UPD 区域 Parquet

| 列名 | 类型 | 说明 |
|------|------|------|
| id | STRING | 区域唯一ID |
| chromosome | STRING | 染色体 |
| start_position | INT64 | 起始位置 |
| end_position | INT64 | 终止位置 |
| length | INT64 | 长度 |
| type | STRING | Isodisomy/Heterodisomy |
| genes | ARRAY<STRING> | 涉及基因 |
| parent_of_origin | STRING | 亲本来源 |

### 4.6 QC 结果 Parquet

| 列名 | 类型 | 说明 |
|------|------|------|
| metric | STRING | 指标名称 |
| value | FLOAT64 | 指标值 |
| status | STRING | success/warning/danger |

---

## 5. 家系分析特殊设计

### 5.1 变异遗传模式标注

在 Parquet 结果中增加家系分析字段：

```json
{
  "family_analysis": {
    "segregation_status": "cosegregation|non_segregation|unknown",
    "de_novo_evidence": {
      "is_de_novo": true,
      "confirmed_by_sequencing": false
    },
    "carrier_status_in_family": {
      "father": "carrier",
      "mother": "carrier",
      "sibling": "affected"
    },
    "recessive_homozygous": false,
    "compound_heterozygous": false,
    "linked_variants": ["variant_id_1", "variant_id_2"]
  }
}
```

### 5.2 家系成员样本关联

| 样本ID | 家系成员 | 关系 | 患病状态 | 变异携带 |
|--------|----------|------|----------|----------|
| sample_001 | 先证者 | proband | affected | 携带 |
| sample_002 | 父亲 | father | unaffected | 携带 |
| sample_003 | 母亲 | mother | unaffected | 携带 |

---

## 6. 索引策略

### 6.1 数据库索引
```sql
-- 家系表索引
CREATE INDEX idx_pedigrees_name ON pedigrees(name);

-- 成员表索引
CREATE INDEX idx_pedigree_members_pedigree_id ON pedigree_members(pedigree_id);
CREATE INDEX idx_pedigree_members_relation ON pedigree_members(relation);
CREATE INDEX idx_pedigree_members_affected ON pedigree_members(affected_status);

-- 样本表索引
CREATE INDEX idx_samples_pedigree_id ON samples(pedigree_id);
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_hospital ON samples(hospital);

-- 任务表索引
CREATE INDEX idx_tasks_sample_id ON analysis_tasks(sample_id);
CREATE INDEX idx_tasks_status ON analysis_tasks(status);

-- 基因列表索引
CREATE INDEX idx_gene_lists_name ON gene_lists(name);
CREATE INDEX idx_gene_lists_category ON gene_lists(category);
```

---

## 7. 数据流

```
┌─────────────────────────────────────────────────────────────┐
│                    家系管理流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   创建家系 ──▶ 添加家系成员 ──▶ 关联样本 ──▶ 数据匹配      │
│       │                                              │      │
│       ▼                                              ▼      │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                  分析任务执行                        │  │
│   │   (单样本/家系模式)                                  │  │
│   └─────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              Parquet 结果存储                        │  │
│   │   (SNV/CNV/MT/STR/UPD/Sanger)                       │  │
│   └─────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              家系变异分析展示                        │  │
│   │   (共分离分析、ACMG评估)                             │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 与 Somatic 的对比

| 特性 | Somatic | Germline |
|------|---------|----------|
| 核心单位 | 样本 | 家系 |
| 分析模式 | 单样本/配对 | 单样本/家系模式 |
| 特殊功能 | 肿瘤标志物、靶向药物 | Sanger验证、家系分离分析 |
| 结果类型 | Fusion、Hotspot、Neoantigen | STR、UPD、线粒体 |
| 临床分类 | Tier I-IV | ACMG分类、ClinGen |
| 配对分析 | 肿瘤-正常配对 | 家系成员比较 |
| Parquet 扩展 | 肿瘤纯度、配对VAF | 分离状态、遗传模式 |

---

## 9. 总结

| 存储位置 | 内容 | 说明 |
|----------|------|------|
| PostgreSQL | 家系、成员、样本、任务、流程、基因列表等元数据 | 结构化查询、家系关系管理 |
| Parquet Files | 分析结果数据 | SNV/CNV/STR/MT/UPD/Sanger，列式存储优化 |
| Object Storage | 原始文件 (FASTQ/BAM) | 大文件存储 |
