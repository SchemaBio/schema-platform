import type { StorageSource, RemoteFile } from './types';

// 预设的存储源
export const storageSources: StorageSource[] = [
  {
    id: 'webdav-nas',
    name: 'NAS 存储',
    protocol: 'webdav',
    endpoint: 'https://nas.example.com/webdav',
    basePath: '/sequencing',
  },
  {
    id: 's3-bucket',
    name: 'S3 数据桶',
    protocol: 's3',
    endpoint: 's3://genomics-data',
    basePath: '/raw-data',
  },
  {
    id: 'smb-share',
    name: '共享文件夹',
    protocol: 'smb',
    endpoint: '//fileserver/genomics',
    basePath: '/incoming',
  },
];

// 判断文件是否可导入
export function isImportableFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith('.fastq') ||
    lower.endsWith('.fastq.gz') ||
    lower.endsWith('.fq') ||
    lower.endsWith('.fq.gz') ||
    lower.endsWith('.ubam') ||
    lower.endsWith('.bam')
  );
}

// 模拟文件数据
const mockFileSystem: Record<string, RemoteFile[]> = {
  '/': [
    { name: '2024-12', path: '/2024-12', type: 'folder' },
    { name: '2024-11', path: '/2024-11', type: 'folder' },
    { name: '2024-10', path: '/2024-10', type: 'folder' },
    { name: 'archive', path: '/archive', type: 'folder' },
  ],
  '/2024-12': [
    { name: 'batch_001', path: '/2024-12/batch_001', type: 'folder' },
    { name: 'batch_002', path: '/2024-12/batch_002', type: 'folder' },
    { name: 'README.txt', path: '/2024-12/README.txt', type: 'file', size: 1024, modifiedAt: '2024-12-01 10:00' },
  ],
  '/2024-12/batch_001': [
    { name: 'Sample_001_R1.fastq.gz', path: '/2024-12/batch_001/Sample_001_R1.fastq.gz', type: 'file', size: 2_400_000_000, modifiedAt: '2024-12-15 14:30', isImportable: true },
    { name: 'Sample_001_R2.fastq.gz', path: '/2024-12/batch_001/Sample_001_R2.fastq.gz', type: 'file', size: 2_400_000_000, modifiedAt: '2024-12-15 14:30', isImportable: true },
    { name: 'Sample_002_R1.fastq.gz', path: '/2024-12/batch_001/Sample_002_R1.fastq.gz', type: 'file', size: 1_800_000_000, modifiedAt: '2024-12-15 15:00', isImportable: true },
    { name: 'Sample_002_R2.fastq.gz', path: '/2024-12/batch_001/Sample_002_R2.fastq.gz', type: 'file', size: 1_800_000_000, modifiedAt: '2024-12-15 15:00', isImportable: true },
    { name: 'md5sum.txt', path: '/2024-12/batch_001/md5sum.txt', type: 'file', size: 256, modifiedAt: '2024-12-15 15:30' },
  ],
  '/2024-12/batch_002': [
    { name: 'Patient_A.ubam', path: '/2024-12/batch_002/Patient_A.ubam', type: 'file', size: 3_200_000_000, modifiedAt: '2024-12-20 09:00', isImportable: true },
    { name: 'Patient_B.ubam', path: '/2024-12/batch_002/Patient_B.ubam', type: 'file', size: 2_900_000_000, modifiedAt: '2024-12-20 09:30', isImportable: true },
    { name: 'run_info.json', path: '/2024-12/batch_002/run_info.json', type: 'file', size: 512, modifiedAt: '2024-12-20 10:00' },
  ],
  '/2024-11': [
    { name: 'batch_001', path: '/2024-11/batch_001', type: 'folder' },
  ],
  '/2024-11/batch_001': [
    { name: 'Old_Sample_R1.fastq.gz', path: '/2024-11/batch_001/Old_Sample_R1.fastq.gz', type: 'file', size: 2_100_000_000, modifiedAt: '2024-11-10 11:00', isImportable: true },
    { name: 'Old_Sample_R2.fastq.gz', path: '/2024-11/batch_001/Old_Sample_R2.fastq.gz', type: 'file', size: 2_100_000_000, modifiedAt: '2024-11-10 11:00', isImportable: true },
  ],
  '/2024-10': [],
  '/archive': [
    { name: 'legacy_data', path: '/archive/legacy_data', type: 'folder' },
  ],
  '/archive/legacy_data': [
    { name: 'archived_sample.bam', path: '/archive/legacy_data/archived_sample.bam', type: 'file', size: 5_000_000_000, modifiedAt: '2024-01-15 08:00', isImportable: true },
  ],
};

// 模拟获取目录内容
export async function fetchDirectoryContents(
  _sourceId: string,
  path: string
): Promise<RemoteFile[]> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const files = mockFileSystem[path] || [];
  return files.map((f) => ({
    ...f,
    isImportable: f.type === 'file' ? isImportableFile(f.name) : undefined,
  }));
}

// 格式化文件大小
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 解析路径为面包屑
export function parseBreadcrumbs(path: string): { name: string; path: string }[] {
  if (path === '/') return [{ name: '根目录', path: '/' }];
  
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: '根目录', path: '/' }];
  
  let currentPath = '';
  for (const part of parts) {
    currentPath += '/' + part;
    breadcrumbs.push({ name: part, path: currentPath });
  }
  
  return breadcrumbs;
}

// 目标文件夹选项（导入目的地）
export const targetFolders = [
  { value: '/imported/fastq', label: 'FASTQ 数据' },
  { value: '/imported/bam', label: 'BAM/uBAM 数据' },
  { value: '/imported/other', label: '其他数据' },
];
