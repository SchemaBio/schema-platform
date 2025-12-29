import type { DataFile } from './types';

export const mockDataFiles: DataFile[] = [
  {
    id: 'DATA001',
    name: 'Sample_001_WGS',
    format: 'fastq',
    pairedEnd: 'paired',
    r1Path: '/data/raw/Sample_001_R1.fastq.gz',
    r2Path: '/data/raw/Sample_001_R2.fastq.gz',
    size: 4_800_000_000,
    sampleId: 'S001',
    sampleName: '张三',
    status: 'matched',
    readCount: 150_000_000,
    qualityScore: 35.2,
    createdAt: '2024-12-20 10:30:00',
    updatedAt: '2024-12-20 11:00:00',
  },
  {
    id: 'DATA002',
    name: 'Sample_002_WES',
    format: 'fastq',
    pairedEnd: 'paired',
    r1Path: '/data/raw/Sample_002_R1.fastq.gz',
    r2Path: '/data/raw/Sample_002_R2.fastq.gz',
    size: 2_400_000_000,
    sampleId: 'S002',
    sampleName: '李四',
    status: 'matched',
    readCount: 80_000_000,
    qualityScore: 34.8,
    createdAt: '2024-12-21 09:15:00',
    updatedAt: '2024-12-21 09:45:00',
  },
  {
    id: 'DATA003',
    name: 'Sample_003_Panel',
    format: 'ubam',
    pairedEnd: 'single',
    r1Path: '/data/raw/Sample_003.ubam',
    size: 1_200_000_000,
    status: 'validated',
    readCount: 50_000_000,
    qualityScore: 33.5,
    createdAt: '2024-12-22 14:20:00',
    updatedAt: '2024-12-22 14:20:00',
  },
  {
    id: 'DATA004',
    name: 'Unknown_Sample',
    format: 'fastq',
    pairedEnd: 'paired',
    r1Path: '/data/raw/unknown_R1.fastq.gz',
    r2Path: '/data/raw/unknown_R2.fastq.gz',
    size: 3_600_000_000,
    status: 'pending',
    createdAt: '2024-12-23 16:00:00',
    updatedAt: '2024-12-23 16:00:00',
  },
  {
    id: 'DATA005',
    name: 'Corrupted_File',
    format: 'fastq',
    pairedEnd: 'single',
    r1Path: '/data/raw/corrupted.fastq.gz',
    size: 0,
    status: 'error',
    errorMessage: '文件校验失败：MD5不匹配',
    createdAt: '2024-12-24 08:30:00',
    updatedAt: '2024-12-24 08:35:00',
  },
];

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 格式化reads数量
export function formatReadCount(count?: number): string {
  if (!count) return '-';
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1) + 'M';
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1) + 'K';
  }
  return count.toString();
}
