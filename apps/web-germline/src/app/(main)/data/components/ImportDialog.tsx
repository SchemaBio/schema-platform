'use client';

import * as React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  FormItem,
} from '@schema/ui-kit';
import { FileText, FolderInput } from 'lucide-react';
import { targetFolders, formatFileSize } from '../mock-data';
import type { RemoteFile } from '../types';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFiles: RemoteFile[];
  onConfirm: (targetFolder: string) => void;
}

export function ImportDialog({
  open,
  onOpenChange,
  selectedFiles,
  onConfirm,
}: ImportDialogProps) {
  const [targetFolder, setTargetFolder] = React.useState(targetFolders[0].value);

  const totalSize = selectedFiles.reduce((sum, f) => sum + (f.size || 0), 0);

  const handleConfirm = () => {
    onConfirm(targetFolder);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="medium">
      <ModalHeader>导入数据</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {/* 已选文件列表 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-fg-default">
                已选择 {selectedFiles.length} 个文件
              </span>
              <span className="text-sm text-fg-muted">
                共 {formatFileSize(totalSize)}
              </span>
            </div>
            <div className="border border-border-default rounded-md max-h-48 overflow-auto">
              {selectedFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center gap-2 px-3 py-2 border-b border-border-muted last:border-b-0"
                >
                  <FileText className="w-4 h-4 text-accent-fg flex-shrink-0" />
                  <span className="text-sm text-fg-default truncate flex-1">
                    {file.name}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 目标文件夹 */}
          <FormItem label="导入到" required>
            <Select
              value={targetFolder}
              onChange={(value) => {
                if (typeof value === 'string') {
                  setTargetFolder(value);
                }
              }}
              options={targetFolders}
            />
          </FormItem>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 bg-canvas-subtle rounded-md">
            <FolderInput className="w-4 h-4 text-fg-muted mt-0.5 flex-shrink-0" />
            <div className="text-xs text-fg-muted">
              <p>文件将被复制到系统存储中，原始文件不会被删除。</p>
              <p className="mt-1">导入后可在样本管理中关联到具体样本。</p>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          取消
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={selectedFiles.length === 0}
        >
          确认导入
        </Button>
      </ModalFooter>
    </Modal>
  );
}
