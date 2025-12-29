// 数据文件类型
export type FileFormat = 'fastq' | 'ubam';
export type PairedEndType = 'single' | 'paired';
export type DataStatus = 'pending' | 'validated' | 'matched' | 'error';

export interface DataFile {
  id: string;
  name: string;                    // 显示名称/条目名称
  format: FileFormat;              // 文件格式: fastq | ubam
  pairedEnd: PairedEndType;        // 单端/双端
  r1Path: string;                  // R1文件路径
  r2Path?: string;                 // R2文件路径（双端时）
  size: number;                    // 文件大小（字节）
  sampleId?: string;               // 关联的样本ID
  sampleName?: string;             // 关联的样本名称
  status: DataStatus;              // 状态
  readCount?: number;              // reads数量
  qualityScore?: number;           // 质量分数
  createdAt: string;               // 创建时间
  updatedAt: string;               // 更新时间
  errorMessage?: string;           // 错误信息
}

export interface ImportFormData {
  name: string;
  format: FileFormat;
  pairedEnd: PairedEndType;
  r1Path: string;
  r2Path?: string;
}
