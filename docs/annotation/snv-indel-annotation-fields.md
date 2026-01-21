# SNV/InDel 现代化注释字段规范

> 版本：v1.2.0
> 更新日期：2026-01-21
> 适用平台：Schema Platform（肿瘤分析平台 & 遗传病分析平台）

---

## 一、设计原则

本设计方案遵循以下核心原则：

### 1.1 采用新一代注释工具

淘汰基于传统算法的注释工具，全面采用基于深度学习的现代化注释方法：

| 淘汰的工具 | 采用的新工具 | 理由 |
|-----------|-------------|------|
| SIFT | AlphaMissense | Google DeepMind 2023年发布，基于 AlphaFold 蛋白质结构预测 |
| PolyPhen-2 | AlphaMissense | 基于深度学习，预测精度显著提升 |
| 1000 Genomes | gnomAD v4 | 样本量更大（~73万外显子 + 15万基因组），数据更新 |

### 1.2 平台差异化设计

- **肿瘤平台**：侧重靶向用药指导、体细胞突变特征、肿瘤数据库整合
- **遗传病平台**：侧重致病性评估、家系分析、遗传模式验证

### 1.3 字段模块化组织

注释字段按功能模块化组织，便于扩展、维护和文档查询。

---

## 二、通用注释字段

以下字段为两个分析平台共用，是所有 SNV/InDel 变异的基础信息和核心注释数据。

### 2.1 变异基本信息

| 字段名称 | 数据类型 | 必填 | 说明 |
|---------|---------|:----:|------|
| `id` | string | 是 | 变异唯一标识符，采用 chr:pos:ref:alt 格式 |
| `gene` | string | 是 | 基因符号，采用 HGNC 官方命名 |
| `chromosome` | string | 是 | 染色体编号，不带 chr 前缀 |
| `position` | int64 | 是 | 基因组位置，1-based 坐标系统 |
| `ref` | string | 是 | 参考等位基因序列 |
| `alt` | string | 是 | 替代等位基因序列 |
| `variant_type` | enum | 是 | 变异类型 |
| `consequence` | string | 是 | 变异后果，采用 SO 术语标准 |

**variant_type 可选值：**
- `SNV` - 单核苷酸变异
- `Insertion` - 插入
- `Deletion` - 缺失
- `Complex` - 复杂变异

### 2.2 转录本与蛋白注释

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `transcript` | string | 转录本 ID，包含版本号如 NM_005228.5 |
| `hgvsc` | string | cDNA 水平 HGVS 描述，如 c.2573T>G |
| `hgvsp` | string | 蛋白水平 HGVS 描述，如 p.L858R |
| `affected_exon` | string | 受影响外显子编号，如 19/27 |
| `cds_length` | int32 | CDS 长度 |
| `protein_length` | int32 | 蛋白长度 |

### 2.3 样本检测信息

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `zygosity` | enum | 遗传方式 |
| `allele_frequency` | float64 | 等位基因频率（VAF 值） |
| `depth` | int32 | 总覆盖深度 |
| `alt_reads` | int32 | 变异碱基支持 reads 数 |
| `dedup_depth` | int32 | 去重后覆盖深度 |
| `dedup_alt_reads` | int32 | 去重后变异 reads 数 |

**zygosity 可选值：**
- `Heterozygous` - 杂合
- `Homozygous` - 纯合
- `Hemizygous` - 半合子
- `Unknown` - 未知

---

## 三、现代化人群频率数据库

本方案摒弃 1000G 等传统数据库，全面采用 gnomAD v4 作为核心人群频率数据源。

### 3.1 gnomAD v4 数据库注释

gnomAD v4（Genome Aggregation Database v4）发布于2024年，是目前最大的人群基因组变异数据库。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `gnomad_af` | float64 | gnomAD v4 全基因组人群频率（综合） |
| `gnomad_af_afr` | float64 | gnomAD 非洲/非裔美国人人群频率 |
| `gnomad_af_ami` | float64 | gnomAD 美洲原住民人群频率（Amish） |
| `gnomad_af_amr` | float64 | gnomAD 美洲/拉丁裔人群频率 |
| `gnomad_af_asj` | float64 | gnomAD 德系犹太人人群频率 |
| `gnomad_af_eas` | float64 | gnomAD 东亚人群频率 |
| `gnomad_af_fin` | float64 | gnomAD 芬兰人群频率 |
| `gnomad_af_nfe` | float64 | gnomAD 非芬兰欧洲人群频率 |
| `gnomad_af_oth` | float64 | gnomAD 其他人群频率 |
| `gnomad_af_sas` | float64 | gnomAD 南亚人群频率 |
| `gnomad_an` | int32 | gnomAD v4 等位基因总数 |
| `gnomad_hom` | int32 | gnomAD v4 纯合子个体数 |
| `gnomad_het` | int32 | gnomAD v4 杂合子个体数 |

> **注意**：gnomAD v4 仅提供全基因组数据，不再区分全基因组和全外显子。

### 3.2 dbSNP 与 ClinVar 注释

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `rs_id` | string | dbSNP rsID 编号 |
| `clinvar_id` | string | ClinVar 登录号 |
| `clinvar_significance` | string | ClinVar 临床意义描述 |
| `clinvar_review_status` | string | ClinVar 审核状态 |
| `clinvar_stars` | int32 | ClinVar 星级评分（0-4 星） |

**clinvar_review_status 可选值：**
- `practice_guideline` - 实践指南
- `reviewed_by_expert_panel` - 专家小组审核
- `criteria_provided` - 提供标准
- `criteria_provided_conflicting` - 提供标准（冲突）
- `no_assertion` - 无断言
- `no_assertion_criteria` - 无断言标准

---

## 四、错义突变功能预测

本方案采用 **AlphaMissense** 作为错义突变致病性预测的核心工具，全面替代 SIFT 和 PolyPhen-2。

### 4.1 AlphaMissense

AlphaMissense 是 Google DeepMind 于 2023 年发布的基于 AlphaFold 的错义突变致病性预测工具，利用蛋白质结构域信息进行深度学习预测，在多项基准测试中表现显著优于传统方法。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `alpha_missense_score` | float64 | AlphaMissense 概率评分，范围 0 到 1 |
| `alpha_missense_pathogenicity` | enum | AlphaMissense 致病性分类 |

**alpha_missense_pathogenicity 可选值：**
- `pathogenic` - 致病性（≥0.9）
- `likely_pathogenic` - 可能致病性（0.5-0.9）
- `ambiguous` - 不确定（0.3-0.5）
- `likely_benign` - 可能良性（0.1-0.3）
- `benign` - 良性（<0.1）

---


## 四、孟德尔遗传病变异预测（遗传病平台专用）

本方案采用 **Maverick** 作为遗传病平台错义突变预测的核心工具，补充或替代 AlphaMissense。Maverick 是专门针对孟德尔遗传病设计的变异效应预测工具，基于 Transformer 架构处理多模态输入，可直接预测变异对显性遗传病和隐性遗传病的致病性。

### 4.1 Maverick

Maverick 是 2023 年发表于 Nature Communications 的孟德尔遗传病专用预测工具，采用 Keras/Transformer 架构，能够区分显性致病、隐性致病和良性变异。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `maverick_prediction` | enum | Maverick 三分类预测结果 |
| `maverick_dom_score` | float64 | 显性致病评分（0-1） |
| `maverick_rec_score` | float64 | 隐性致病评分（0-1） |
| `maverick_benign_score` | float64 | 良性评分（0-1） |

**maverick_prediction 可选值：**
- `benign` - 预测为良性
- `dominant_pathogenic` - 预测为显性致病
- `recessive_pathogenic` - 预测为隐性致病

**与 ACMG 证据的关联：**
| Maverick 结果 | 对应 ACMG 证据 |
|--------------|----------------|
| 显性疾病基因中纯合良性预测 | `BP2` |
| 隐性疾病基因中复合杂合 | `PM3` |
| 与家系遗传模式一致的预测 | `PP1` |

### 4.2 AlphaMissense（作为补充）

对于遗传病平台，AlphaMissense 可作为 Maverick 的补充工具，提供额外的致病性概率评估。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `alpha_missense_score` | float64 | AlphaMissense 概率评分，范围 0 到 1 |
| `alpha_missense_pathogenicity` | enum | AlphaMissense 致病性分类 |

---


## 五、剪接效应预测

本方案采用 **SpliceAI** 作为剪接变异预测的核心工具。

### 5.1 SpliceAI

SpliceAI 是 Illumina 发布的基于深度学习的剪接位点预测工具，是目前剪接预测的最佳实践。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `spliceai_score` | float64 | SpliceAI 最高评分（综合评估供体和受体位点） |
| `spliceai_acceptor_gain` | float64 | 剪接 acceptor 获得评分 |
| `spliceai_acceptor_loss` | float64 | 剪接 acceptor 缺失评分 |
| `spliceai_donor_gain` | float64 | 剪接 donor 获得评分 |
| `spliceai_donor_loss` | float64 | 剪接 donor 缺失评分 |
| `spliceai_distance` | int32 | 变异与预测剪接位点的距离 |

**SpliceAI 阈值参考：**
- `≥0.5` - 强剪接效应
- `0.2-0.5` - 中等剪接效应
- `<0.2` - 弱或无剪接效应

---


## 七、LoF 变异与 InDel 功能预测

功能丧失（LoF）变异包括无义突变、移码突变、剪接突变以及大片段缺失。InDel 变异需要根据其类型分别评估。

### 7.1 LoF 变异预测

LoFtool 是专门评估移码/无义突变致病性风险的深度学习工具，结合了多种特征进行预测。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `loftool_score` | float64 | LoFtool 评分（移码/无义突变专用） |
| `lof_flag` | boolean | 是否为功能丧失变异 |

**lof_flag 判断条件（满足任一）：**
- consequence 为 `stop_gained`、`frameshift_variant`、`splice_donor_variant`、`splice_acceptor_variant`
- `spliceai_score ≥ 0.5` 且 consequence 为 `intron_variant`

### 7.2 InDel 功能预测

InDel 变异根据类型采用不同评估策略：

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `indel_type` | enum | InDel 类型 |
| `indel_length` | int32 | InDel 长度（碱基数） |
| `is_frameshift` | boolean | 是否为移码变异 |
| `alpha_missense_score` | float64 | AlphaMissense 评分（对短 InDel 有效） |

**indel_type 可选值：**
- `frameshift_deletion` - 移码缺失
- `frameshift_insertion` - 移码插入
- `inframe_deletion` - 非移码缺失
- `inframe_insertion` - 非移码插入

### 7.3 InDel 评估策略

| InDel 类型 | 推荐评估方法 |
|-----------|-------------|
| 移码 InDel | LoFtool + pLI/LOEUF |
| 非移码 InDel（≤10 aa） | AlphaMissense + LoFtool |
| 非移码 InDel（>10 aa） | 基于长度的经验评估 |
| 剪接区域 InDel | SpliceAI 优先评估 |

---


## 八、基因 LoF 耐受性评分

基因级别的 LoF 耐受性评分用于评估基因对功能丧失变异的承受能力，是 LoF 变异致病性评估的重要参考。

### 8.1 gnomAD 耐受性指标

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `pLI` | float64 | pLI 分数，基因对 LoF 的耐受性（0=耐受，1=敏感） |
| `loeuf` | float64 | LOEUF 分数，约束观察值/期望值上限 |

**pLI 阈值参考：**
- `≥0.9` - 高度 LoF 敏感（常染色体显性致病基因）
- `0.45-0.9` - 中度敏感
- `<0.45` - LoF 耐受

**LOEUF 阈值参考：**
- `<0.35` - 高度约束
- `0.35-0.5` - 中度约束
- `>0.5` - 约束较少

### 8.2 其他耐受性指标

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `oe_mis` | float64 | 错义突变 O/E 分数 |
| `oe_syn` | float64 | 同义突变 O/E 分数 |
| `mis_z` | float64 | 错突变 Z 分数 |

---


## 九、UTR 变异预测

UTR 区域变异影响基因表达和翻译效率，需要专门的预测工具。

### 9.1 5'UTR 变异预测

KozakAI 是 2024 年发布的预测 Kozak 序列变异对翻译起始影响的深度学习工具。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `kozakai_score` | float64 | KozakAI 评分（范围 -1 到 1） |
| `kozak_impact` | enum | Kozak 序列影响 |
| `uorf_created` | boolean | 是否创建新的上游 ORF |
| `uorf_disrupted` | boolean | 是否破坏原有的上游 ORF |

**kozak_impact 可选值：**
- `increased_translation` - 翻译增强
- `decreased_translation` - 翻译减弱
- `no_impact` - 无影响

### 9.2 3'UTR 变异预测

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `mirna_target_lost` | array[string] | 丢失的 miRNA 结合位点列表 |
| `mirna_target_gained` | array[string] | 获得的新 miRNA 结合位点列表 |
| `mrna_stability_impact` | enum | mRNA 稳定性影响 |

**mrna_stability_impact 可选值：**
- `increased_stability` - 稳定性增强
- `decreased_stability` - 稳定性减弱
- `no_impact` - 无影响

---


## 十、保守性评分

保守性评分用于评估变异位点在进化过程中的保守程度，是致病性评估的重要参考依据。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `phylop100way_vertebrate` | float64 | PhyloP 100 种脊椎动物保守性评分 |
| `phylop30way_mammalian` | float64 | PhyloP 30 种哺乳动物保守性评分 |
| `gerp_rs` | float64 | GERP++ 拒绝替代评分 |
| `gerp_element` | string | GERP++ 元素类型 |
| `mammpheno_score` | float64 | Mammalian Phylogenetic Score |

**GERP++ 阈值参考：**
- `>2.0` - 高度保守
- `0-2.0` - 中度保守
- `<0` - 加速进化

---

## 十、肿瘤平台特有注释字段

肿瘤体细胞突变分析平台需要额外的临床用药指导、肿瘤数据库注释以及体细胞突变特异性字段。

### 10.1 临床用药指导

OncoKB 和 CIViC 是肿瘤精准医学最重要的临床证据数据库。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `onco_kb_id` | string | OncoKB 数据库标识 |
| `onco_kb_level` | enum | OncoKB 证据等级 |
| `onco_kb_actionability` | string | OnCoKB 临床可操作性描述 |
| `civic_id` | int32 | CIViC 数据库变异 ID |
| `civic_clinical_significance` | string | CIViC 临床意义 |
| `civic_evidence_score` | float64 | CIViC 证据评分 |
| `targeted_drugs` | array[string] | 靶向药物列表 |
| `drug_resistance` | array[string] | 耐药药物列表 |
| `therapy_recommendation` | string | 治疗建议 |

**onco_kb_level 可选值：**
- `Level_1` - FDA 认可的标准治疗
- `Level_2` - NCCN 等指南推荐
- `Level_3` - 临床证据支持
- `Level_4` - 生物学证据支持
- `Level_R1` - 敏感预后标志物
- `Level_R2` - 耐药预后标志物

### 10.2 肿瘤变异数据库

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `cosmic_id` | string | COSMIC 变异 ID |
| `cosmic_gene` | string | COSMIC 中的基因名称 |
| `cosmic_mutation_id` | string | COSMIC 变异标识 |
| `cosmic_count` | int32 | COSMIC 中该变异出现次数 |
| `icgc_id` | string | ICGC 项目标识 |
| `dbsnp_tumor` | boolean | 是否为肿瘤特异性 dbSNP 位点 |
| `cancergenome_interpreter_id` | string | Cancer Genome Interpreter 变异 ID |

### 10.3 体细胞突变特征

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `tumor_mutational_burden` | string | 肿瘤突变负荷分类 |
| `microsatellite_status` | enum | 微卫星状态 |
| `hotspot` | boolean | 是否为热点变异 |
| `vogelstein_cancer_gene` | boolean | 是否为 Vogelstein 癌症基因 |
| `clonal` | boolean | 是否为克隆性变异 |
| `clonal_frequency` | float64 | 克隆性频率估算值 |
| `subclonal_frequency` | float64 | 亚克隆性频率估算值 |
| `vaf_tumor` | float64 | 肿瘤样本 VAF |
| `vaf_normal` | float64 | 正常样本 VAF |

**tumor_mutational_burden 可选值：**
- `High` - 高 TMB（≥10 muts/Mb）
- `Medium` - 中 TMB（3-10 muts/Mb）
- `Low` - 低 TMB（<3 muts/Mb）

**microsatellite_status 可选值：**
- `MSI_High` - 微卫星高度不稳定
- `MSI_Low` - 微卫星低度不稳定
- `MSS` - 微卫星稳定

### 10.4 AMP/ASCO/CAP 临床分级

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `amp_tier` | enum | AMP 变异分级 |
| `amp_level` | string | AMP 证据等级描述 |
| `amp_evidence` | array[string] | AMP 证据代码列表 |

**amp_tier 可选值：**
- `Tier_I` - I 级（强临床意义）
- `Tier_II` - II 级（中等临床意义）
- `Tier_III` - III 级（潜在临床意义）
- `Tier_IV` - IV 级（生物学意义）

### 10.5 肿瘤特有审核字段

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `therapy_notes` | string | 治疗相关备注 |
| `resistance_mechanism` | string | 耐药机制描述 |

---

## 十一、遗传病平台特有注释字段

遗传病胚系突变分析平台需要全面的 ACMG 评级、遗传模式、疾病关联以及家系分析相关字段。

### 11.1 ACMG 致病性分类

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `acmg_classification` | enum | ACMG 最终分类 |
| `acmg_criteria` | array[string] | 支持分类的 ACMG 证据代码列表 |
| `acmg_criteria_details` | object | ACMG 证据详情 |
| `intervar_automated` | enum | InterVar 自动分类结果 |
| `intervar_evidence_summary` | string | InterVar 证据摘要 |

**acmg_classification 可选值：**
- `Pathogenic` - 致病性
- `Likely_Pathogenic` - 可能致病性
- `VUS` - 意义未明变异
- `Likely_Benign` - 可能良性
- `Benign` - 良性

**ACMG 证据代码：**

**致病性证据（Pathogenic）：**
- `PVS1` - 非常强：功能丧失变异
- `PVS1_Strong` - 强：功能丧失变异
- `PVS1_Moderate` - 中等：功能丧失变异
- `PVS1_Supporting` - 支持：功能丧失变异
- `PS1` - 强：已知致病变异（相同氨基酸改变）
- `PS2` - 强：新发突变（亲缘关系已确认）
- `PS3` - 强：功能实验支持有害
- `PS4` - 中等：病例对照研究支持
- `PM1` - 中等：位于突变热点区域
- `PM2` - 支持：在正常人群中未发现
- `PM3` - 强：复合杂合（隐性遗传病）
- `PM4` - 中等：非重复区框内插入/缺失
- `PM5` - 支持：新的错义变异
- `PM6` - 支持：未确认的新发突变
- `PP1` - 支持：共分离证据
- `PP2` - 支持：基因罕见错义变异
- `PP3` - 支持：计算证据支持有害
- `PP4` - 支持：表型高度特异

**良性证据（Benign）：**
- `BA1` - 强：人群频率 >5%
- `BS1` - 中等：人群频率 >1%
- `BS2` - 强：观察到纯合状态
- `BS3` - 强：功能实验支持良性
- `BS4` - 强：缺乏共分离
- `BP1` - 支持：错义变异（已知致病变异为截短）
- `BP2` - 支持：在显性遗传病中观察到纯合状态
- `BP3` - 支持：预测不影响剪接
- `BP4` - 支持：计算证据支持良性
- `BP5` - 支持：在病例中发现
- `BP6` - 支持：可靠来源报告为良性
- `BP7` - 支持：同义变异不影响剪接

### 11.2 疾病与遗传模式

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `omim_id` | string | OMIM 疾病标识 |
| `omim_phenotype` | string | OMIM 表型描述 |
| `orphanet_id` | string | Orphanet 疾病标识 |
| `orphanet_phenotype` | string | Orphanet 表型描述 |
| `hpo_id` | array[string] | HPO 表型术语 ID 列表 |
| `hpo_term` | array[string] | HPO 表型术语描述列表 |
| `inheritance_mode` | enum | 遗传模式 |
| `disease_name` | string | 疾病名称 |
| `gene_review_status` | string | GeneReview 状态 |

**inheritance_mode 可选值：**
- `AD` - 常染色体显性
- `AR` - 常染色体隐性
- `XLD` - X 连锁显性
- `XLR` - X 连锁隐性
- `Y-linked` - Y 连锁
- `Mitochondrial` - 线粒体遗传
- `Unknown` - 未知

### 11.3 家系分析

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `de_novo` | boolean | 是否为新发突变 |
| `de_novo_confidence` | enum | 新发突变可信度 |
| `segregation_score` | float64 | 共分离分析评分 |
| `family_carriers` | array[string] | 家系中其他携带者信息 |
| `compound_heterozygous` | boolean | 是否为复合杂合变异 |
| `compound_heterozygous_partner` | string | 复合杂合配对变异 ID |
| `x_linked_hemi` | boolean | 是否为半合子（男性）/杂合（女性） |

**de_novo_confidence 可选值：**
- `Confirmed` - 已确认
- `Likely` - 很可能
- `Possible` - 可能

### 11.4 文献与证据

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `pubmed_ids` | array[string] | 相关 PubMed 文献 ID |
| `literature_count` | int32 | 相关文献数量 |
| `expert_comments` | string | 专家评语 |
| `clinical_trials` | array[string] | 相关临床试验 |

### 11.5 遗传病特有审核字段

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `counseling_notes` | string | 遗传咨询备注 |
| `management_recommendation` | string | 临床管理建议 |

---

## 十二、审核与报告状态

以下字段为两个平台共用，用于管理变异注释的审核和报告工作流。

| 字段名称 | 数据类型 | 说明 |
|---------|---------|------|
| `reviewed` | boolean | 是否已审核 |
| `reviewed_by` | string | 审核人 ID |
| `reviewed_at` | timestamp | 审核时间 |
| `reported` | boolean | 是否已报告 |
| `reported_by` | string | 报告人 ID |
| `reported_at` | timestamp | 报告时间 |
| `notes` | string | 备注信息 |
| `tags` | array[string] | 自定义标签 |

---

## 十三、字段分类汇总

### 13.1 肿瘤平台字段分组

| 分类 | 字段数量 | 主要用途 |
|-----|---------|----------|
| 基础信息与转录本 | 14 | 变异识别与定位 |
| 人群频率 | 15 | 过滤常见变异 |
| 错义突变预测 | 2 | AlphaMissense |
| 剪接预测 | 6 | SpliceAI |
| LoF/InDel 预测 | 5 | LoFtool + InDel 分类 |
| 基因耐受性评分 | 6 | pLI/LOEUF |
| UTR 预测 | 6 | KozakAI + miRNA |
| 保守性评分 | 5 | 进化保守性分析 |
| 肿瘤数据库与用药 | 18 | 临床用药指导 |
| 体细胞特征 | 13 | 肿瘤突变特征 |
| 审核状态 | 8 | 工作流管理 |

**总计：约 98 个字段**

### 13.2 遗传病平台字段分组

| 分类 | 字段数量 | 主要用途 |
|-----|---------|----------|
| 基础信息与转录本 | 14 | 变异识别与定位 |
| 人群频率 | 15 | 过滤常见变异 |
| 错义突变预测 | 6 | Maverick + AlphaMissense |
| 剪接预测 | 6 | SpliceAI |
| LoF/InDel 预测 | 5 | LoFtool + InDel 分类 |
| 基因耐受性评分 | 6 | pLI/LOEUF |
| UTR 预测 | 6 | KozakAI + miRNA |
| 保守性评分 | 5 | 进化保守性分析 |
| ACMG 评级 | 7 | 致病性综合评估 |
| 疾病与遗传 | 12 | 临床表型关联 |
| 家系分析 | 8 | 遗传模式验证 |
| 文献与证据 | 4 | 研究证据 |
| 审核状态 | 8 | 工作流管理 |

**总计：约 102 个字段**

---

## 十四、注释工具版本要求

本设计方案推荐的注释工具及其版本要求如下：

### 11.1 人群频率数据库

| 数据库 | 版本 | 参考基因组 | 样本量 |
|-------|------|-----------|-------|
| gnomAD | v4.0 | GRCh38 | ~73万外显子 + 15万基因组 |

### 11.2 功能预测工具

| 工具 | 版本 | 适用平台 | 说明 |
|-----|------|---------|------|
| AlphaMissense | latest | 通用 | Google DeepMind 2023，基于 AlphaFold 蛋白质结构 |
| Maverick | latest | 遗传病 | Nature Comms 2023，Transformer 架构，孟德尔遗传病专用 |
| LoFtool | latest | 通用 | LoF 变异致病性预测 |

### 11.3 剪接预测工具

| 工具 | 版本 | 说明 |
|-----|------|------|
| SpliceAI | v1.3.1 | Illumina，基于深度学习 |

### 11.4 UTR 预测工具

| 工具 | 版本 | 说明 |
|-----|------|------|
| KozakAI | latest | 5'UTR Kozak 序列变异预测 |
| TargetScan | latest | 3'UTR miRNA 结合位点预测 |

### 11.5 临床证据数据库

| 数据库 | 更新频率 | 说明 |
|-------|---------|------|
| OncoKB | 每月更新 | MSKCC 肿瘤精准医学 |
| CIViC | 持续更新 | 社区驱动的临床证据 |
| ClinVar | 每周更新 | NCBI 临床变异数据库 |

---

## 十五、参考标准与术语

### 12.1 参考基因组

本方案默认使用 **GRCh38（hg38）** 作为主要参考基因组。对于使用 hg19 的历史数据，建议使用链特异性转换工具 LiftOver 进行坐标转换。

### 12.2 HGVS 命名规范

- **转录水平**：`c.` 前缀，如 c.2573T>G
- **蛋白水平**：`p.` 前缀，如 p.L858R
- **基因组水平**：`g.` 前缀，如 g.55259515C>T

### 12.3 SO 变异后果术语

| 术语 | 说明 |
|-----|------|
| `stop_gained` | 获得终止密码子 |
| `frameshift_variant` | 移码变异 |
| `splice_donor_variant` | 剪接 donor 位点变异 |
| `splice_acceptor_variant` | 剪接 acceptor 位点变异 |
| `missense_variant` | 错义变异 |
| `synonymous_variant` | 同义变异 |
| `intron_variant` | 内含子变异 |
| `5_prime_UTR_variant` | 5'UTR 变异 |
| `3_prime_UTR_variant` | 3'UTR 变异 |

---

## 十六、实施建议

### 13.1 变异注释流程

建议采用以下技术栈构建变异注释流程：

```
测序数据 → VEP → gnomAD v4 + AlphaMissense + SpliceAI → 结构化输出
```

1. **基础注释**：使用 VEP 进行基础注释（转录本、HGVS、Consequence）
2. **人群频率**：使用 gnomAD v4 VCF 文件进行注释
3. **功能预测**：调用 AlphaMissense API（仅错义突变）
4. **剪接预测**：使用 SpliceAI 插件（仅剪接区域变异）
5. **临床证据**：查询 OncoKB、CIViC API

### 13.2 版本管理

- 建立注释工具版本管理机制
- 记录每次注释使用的工具版本和数据库版本
- 确保注释结果的可重复性

### 13.3 数据质量控制

- 定期验证注释数据的准确性
- 监控注释工具的更新和潜在问题
- 建立人工审核流程

---

## 附录 A：字段变更日志

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| v1.2.0 | 2026-01-21 | 新增：Maverick 孟德尔遗传病变异预测（遗传病平台专用） |
| v1.1.0 | 2026-01-21 | 新增：LoF/InDel 预测（LoFtool）、基因耐受性评分（pLI/LOEUF）、UTR 变异预测（KozakAI、miRNA） |
| v1.0.1 | 2026-01-21 | 更新 gnomAD v3.1 → v4；精简预测模型：错义突变仅保留 AlphaMissense，剪接预测仅保留 SpliceAI |
| v1.0.0 | 2025-01-21 | 初始版本发布 |

---

## 附录 B：与传统方案的对比

### B.1 被淘汰的字段

| 原有字段 | 淘汰原因 |
|---------|---------|
| `sift_score` | 基于传统算法，精度较低，被 AlphaMissense 替代 |
| `sift_prediction` | 基于传统算法，被 AlphaMissense 替代 |
| `polyphen_score` | 基于传统算法，被 AlphaMissense 替代 |
| `polyphen_prediction` | 基于传统算法，被 AlphaMissense 替代 |
| `revel_score` | 被 AlphaMissense 替代（最新最佳模型） |
| `cadd_phred` | 被 AlphaMissense 替代 |
| `primateai_score` | 被 AlphaMissense 替代（最新最佳模型） |
| `eve_score` | 被 AlphaMissense 替代 |
| `splicevault_delta_score` | 被 SpliceAI 替代 |
| `hal_score` | 被 SpliceAI 替代 |
| `thousand_genomes_af` | 被 gnomAD v4 替代 |
| `exac_af` | 已合并到 gnomAD |
| `topmed_af` | 被 gnomAD v4 替代（样本量已更大） |

### B.2 新增的核心字段

| 新增字段 | 数据来源 | 适用平台 |
|---------|---------|---------|
| `alpha_missense_score` | AlphaMissense（Google DeepMind 2023） | 通用 |
| `alpha_missense_pathogenicity` | AlphaMissense（Google DeepMind 2023） | 通用 |
| `maverick_prediction` | Maverick（Nature Comms 2023） | 遗传病 |
| `maverick_dom_score` | Maverick（Nature Comms 2023） | 遗传病 |
| `maverick_rec_score` | Maverick（Nature Comms 2023） | 遗传病 |
| `maverick_benign_score` | Maverick（Nature Comms 2023） | 遗传病 |
| `spliceai_score` | SpliceAI（Illumina） | 通用 |
| `gnomad_af` | gnomAD v4 | 通用 |
| `loftool_score` | LoFtool | 通用 |
| `pLI` / `loeuf` | gnomAD v4 | 通用 |
| `kozakai_score` | KozakAI 2024 | 通用 |
| `mirna_target_lost` | TargetScan | 通用 |
| `onco_kb_level` | OncoKB（MSKCC） | 肿瘤 |
| `civic_id` | CIViC | 肿瘤 |
| `acmg_criteria_details` | ACMG 2015 指南 | 遗传病 |

---

*本规范由 Schema Platform 技术团队维护*
