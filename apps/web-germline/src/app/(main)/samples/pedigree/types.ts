import type { Gender } from '../types';

// 家系成员关系类型
export type RelationType =
  | 'proband'      // 先证者
  | 'father'       // 父亲
  | 'mother'       // 母亲
  | 'sibling'      // 兄弟姐妹
  | 'child'        // 子女
  | 'spouse'       // 配偶
  | 'grandfather_paternal'  // 祖父
  | 'grandmother_paternal'  // 祖母
  | 'grandfather_maternal'  // 外祖父
  | 'grandmother_maternal'  // 外祖母
  | 'uncle'        // 叔伯/舅舅
  | 'aunt'         // 姑姑/阿姨
  | 'cousin'       // 堂/表兄弟姐妹
  | 'other';       // 其他

// 患病状态
export type AffectedStatus = 'affected' | 'unaffected' | 'unknown' | 'carrier';

// 家系成员
export interface PedigreeMember {
  id: string;                 // 成员ID (UUID)
  sampleId?: string;          // 关联的样本UUID（必须存在于 /samples 中）
  name: string;
  gender: Gender;
  birthYear?: number;
  isDeceased?: boolean;
  deceasedYear?: number;
  relation: RelationType;
  affectedStatus: AffectedStatus;
  phenotypes?: string[];      // 表型描述
  // 家系关系
  fatherId?: string;          // 父亲成员ID
  motherId?: string;          // 母亲成员ID
  spouseIds?: string[];       // 配偶成员ID列表
  // 位置信息（用于可视化）
  generation: number;         // 代数（0为先证者所在代）
  position: number;           // 同代中的位置
}

// 家系
export interface Pedigree {
  id: string;                 // 家系UUID
  internalId: string;         // 家系内部编号
  probandId: string;          // 先证者成员ID
  probandSampleId?: string;   // 先证者样本UUID
  members: PedigreeMember[];
  clinicalDiagnosis?: string; // 临床诊断（先证者）
  batch?: string;             // 批次
  remark?: string;            // 备注
  createdAt: string;
  updatedAt: string;
  note?: string;
}

// 家系列表项
export interface PedigreeListItem {
  id: string;                 // 家系UUID
  internalId: string;         // 家系内部编号
  sampleIds: string[];        // 家系内样本UUID列表
  sampleInternalIds: string[]; // 样本内部编号列表（与sampleIds一一对应）
  probandSampleId?: string;   // 先证者样本UUID
  probandSampleInternalId?: string; // 先证者样本内部编号
  probandIndex: number;       // 先证者在sampleIds中的索引
  batch?: string;             // 批次
  clinicalDiagnosis?: string; // 临床诊断（先证者）
  remark?: string;            // 备注
  createdAt: string;
  updatedAt: string;
}

// 关系配置
export const RELATION_CONFIG: Record<RelationType, { label: string; generation: number }> = {
  proband: { label: '先证者', generation: 0 },
  father: { label: '父亲', generation: -1 },
  mother: { label: '母亲', generation: -1 },
  sibling: { label: '兄弟姐妹', generation: 0 },
  child: { label: '子女', generation: 1 },
  spouse: { label: '配偶', generation: 0 },
  grandfather_paternal: { label: '祖父', generation: -2 },
  grandmother_paternal: { label: '祖母', generation: -2 },
  grandfather_maternal: { label: '外祖父', generation: -2 },
  grandmother_maternal: { label: '外祖母', generation: -2 },
  uncle: { label: '叔伯/舅舅', generation: -1 },
  aunt: { label: '姑姑/阿姨', generation: -1 },
  cousin: { label: '堂/表兄弟姐妹', generation: 0 },
  other: { label: '其他', generation: 0 },
};

// 患病状态配置
export const AFFECTED_STATUS_CONFIG: Record<AffectedStatus, { label: string; color: string }> = {
  affected: { label: '患病', color: 'fill-gray-800' },      // 实心（深色填充）
  unaffected: { label: '未患病', color: 'fill-white' },     // 空心（白色填充）
  unknown: { label: '未知', color: 'fill-gray-300' },       // 灰色填充
  carrier: { label: '携带者', color: 'fill-amber-400' },    // 携带者（黄色）
};