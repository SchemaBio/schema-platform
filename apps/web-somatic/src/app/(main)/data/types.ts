// 存储协议类型
export type StorageProtocol = 'webdav' | 's3' | 'smb';

// 文件类型
export type FileType = 'file' | 'folder';

// 支持导入的文件格式
export type ImportableFormat = 'fastq' | 'fastq.gz' | 'fq' | 'fq.gz' | 'ubam' | 'bam';

// 存储源配置
export interface StorageSource {
  id: string;
  name: string;
  protocol: StorageProtocol;
  endpoint: string;        // 连接地址
  basePath: string;        // 基础路径
  icon?: string;
}

// 远程文件/文件夹
export interface RemoteFile {
  name: string;
  path: string;            // 完整路径
  type: FileType;
  size?: number;           // 文件大小（字节）
  modifiedAt?: string;     // 修改时间
  isImportable?: boolean;  // 是否可导入（fastq/ubam）
}

// 面包屑导航项
export interface BreadcrumbItem {
  name: string;
  path: string;
}

// 导入任务
export interface ImportTask {
  id: string;
  sourceId: string;
  files: string[];         // 选中的文件路径
  targetFolder: string;    // 目标文件夹
  status: 'pending' | 'importing' | 'completed' | 'failed';
  progress?: number;
  createdAt: string;
}
