'use client';

import * as React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  RadioGroup,
  FormItem,
} from '@schema/ui-kit';
import { FileText, HardDrive } from 'lucide-react';
import type { ImportFormData, FileFormat, PairedEndType } from '../types';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ImportFormData) => void;
}

const formatOptions = [
  { value: 'fastq', label: 'FASTQ (.fastq, .fastq.gz, .fq, .fq.gz)' },
  { value: 'ubam', label: 'uBAM (.ubam, .bam)' },
];

const pairedEndOptions = [
  { value: 'single', label: '单端 (Single-end)' },
  { value: 'paired', label: '双端 (Paired-end)' },
];

export function ImportDataModal({ isOpen, onClose, onSubmit }: ImportDataModalProps) {
  const [name, setName] = React.useState('');
  const [format, setFormat] = React.useState<FileFormat>('fastq');
  const [pairedEnd, setPairedEnd] = React.useState<PairedEndType>('paired');
  const [r1Path, setR1Path] = React.useState('');
  const [r2Path, setR2Path] = React.useState('');

  const handleSubmit = () => {
    if (!name.trim() || !r1Path.trim()) return;
    if (format === 'fastq' && pairedEnd === 'paired' && !r2Path.trim()) return;

    onSubmit({
      name: name.trim(),
      format,
      pairedEnd: format === 'ubam' ? 'single' : pairedEnd,
      r1Path: r1Path.trim(),
      r2Path: format === 'fastq' && pairedEnd === 'paired' ? r2Path.trim() : undefined,
    });

    // Reset form
    setName('');
    setFormat('fastq');
    setPairedEnd('paired');
    setR1Path('');
    setR2Path('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setFormat('fastq');
    setPairedEnd('paired');
    setR1Path('');
    setR2Path('');
    onClose();
  };

  const isValid = name.trim() && r1Path.trim() && 
    (format === 'ubam' || pairedEnd === 'single' || r2Path.trim());

  // uBAM 只支持单端
  const showPairedEndOption = format === 'fastq';
  const showR2Input = format === 'fastq' && pairedEnd === 'paired';

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()} size="medium">
      <ModalHeader>导入数据</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <FormItem label="条目名称" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入数据条目名称，如 Sample_001_WGS"
            />
          </FormItem>

          <FormItem label="文件格式" required>
            <Select
              value={format}
              onChange={(value) => {
                setFormat(value as FileFormat);
                if (value === 'ubam') {
                  setPairedEnd('single');
                  setR2Path('');
                }
              }}
              options={formatOptions}
            />
          </FormItem>

          {showPairedEndOption && (
            <FormItem label="测序类型">
              <RadioGroup
                name="pairedEnd"
                value={pairedEnd}
                onChange={(value) => {
                  setPairedEnd(value as PairedEndType);
                  if (value === 'single') {
                    setR2Path('');
                  }
                }}
                options={pairedEndOptions}
                orientation="horizontal"
              />
            </FormItem>
          )}

          <div className="border-t border-border-default pt-4">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-4 h-4 text-fg-muted" />
              <span className="text-sm font-medium text-fg-default">文件路径</span>
            </div>

            <FormItem 
              label={showR2Input ? 'R1 文件路径' : '文件路径'} 
              required
              hint={format === 'fastq' ? '支持 .fastq, .fastq.gz, .fq, .fq.gz' : '支持 .ubam, .bam'}
            >
              <Input
                value={r1Path}
                onChange={(e) => setR1Path(e.target.value)}
                placeholder={format === 'fastq' ? '/path/to/sample_R1.fastq.gz' : '/path/to/sample.ubam'}
                leftElement={<FileText className="w-4 h-4" />}
              />
            </FormItem>

            {showR2Input && (
              <FormItem label="R2 文件路径" required className="mt-3">
                <Input
                  value={r2Path}
                  onChange={(e) => setR2Path(e.target.value)}
                  placeholder="/path/to/sample_R2.fastq.gz"
                  leftElement={<FileText className="w-4 h-4" />}
                />
              </FormItem>
            )}
          </div>

          <div className="bg-canvas-subtle rounded-md p-3 text-xs text-fg-muted">
            <p className="font-medium text-fg-default mb-1">提示</p>
            <ul className="list-disc list-inside space-y-1">
              <li>双端 FASTQ 数据只需创建一个条目，同时指定 R1 和 R2 路径</li>
              <li>uBAM 文件为单端格式，包含未比对的 reads</li>
              <li>文件路径应为服务器上的绝对路径</li>
            </ul>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          取消
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
          导入
        </Button>
      </ModalFooter>
    </Modal>
  );
}
