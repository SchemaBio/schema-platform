'use client';

import * as React from 'react';
import { Button, Select, Tag, FormItem, Modal, ModalHeader, ModalBody, ModalFooter } from '@schema/ui-kit';
import { 
  FileText, Play, Clock, CheckCircle, XCircle, Loader2, Download, 
  FileSpreadsheet, Database, FileCode, Upload 
} from 'lucide-react';

// 统一的报告记录类型
interface ReportRecord {
  id: string;
  name: string;
  type: 'generated' | 'uploaded';  // 生成的 or 上传的
  templateName?: string;           // 生成报告的模板名
  fileName?: string;               // 上传报告的文件名
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  createdBy: string;
  completedAt?: string;
  downloadUrl?: string;
  errorMessage?: string;
}

// 报告模板类型
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
}

interface ReportTabProps {
  taskId: string;
}

// Mock 数据获取函数
async function getActiveTemplates(): Promise<ReportTemplate[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [
    { id: 'TPL001', name: 'wes-germline-report', description: '全外显子遗传病检测报告模板' },
    { id: 'TPL002', name: 'cardio-panel-report', description: '心血管疾病基因检测专用报告' },
    { id: 'TPL003', name: 'cnv-detection-report', description: '拷贝数变异检测报告' },
  ];
}

async function getReportRecords(_taskId: string): Promise<ReportRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [
    {
      id: 'RPT001',
      name: 'wes-germline-report',
      type: 'generated',
      templateName: 'wes-germline-report',
      status: 'completed',
      createdAt: '2024-12-28 14:30',
      createdBy: '王工',
      completedAt: '2024-12-28 14:32',
      downloadUrl: '/reports/RPT001.pdf',
    },
    {
      id: 'RPT002',
      name: 'cardio-panel-report',
      type: 'generated',
      templateName: 'cardio-panel-report',
      status: 'failed',
      createdAt: '2024-12-28 15:00',
      createdBy: '李工',
      errorMessage: 'API 连接超时',
    },
    {
      id: 'UPL001',
      name: '患者报告_手动上传.docx',
      type: 'uploaded',
      fileName: '患者报告_手动上传.docx',
      status: 'completed',
      createdAt: '2024-12-27 10:00',
      createdBy: '王工',
      downloadUrl: '/uploads/UPL001.docx',
    },
  ];
}

export function ReportTab({ taskId }: ReportTabProps) {
  const [templates, setTemplates] = React.useState<ReportTemplate[]>([]);
  const [records, setRecords] = React.useState<ReportRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [generating, setGenerating] = React.useState(false);
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [tpls, recs] = await Promise.all([
        getActiveTemplates(),
        getReportRecords(taskId),
      ]);
      setTemplates(tpls);
      setRecords(recs);
      setLoading(false);
    }
    loadData();
  }, [taskId]);

  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: `${t.name} - ${t.description}`,
  }));

  const handleGenerate = async () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    setGenerating(true);

    const newRecord: ReportRecord = {
      id: `RPT${String(Date.now()).slice(-6)}`,
      name: template.name,
      type: 'generated',
      templateName: template.name,
      status: 'generating',
      createdAt: new Date().toLocaleString('zh-CN'),
      createdBy: '当前用户',
    };

    setRecords((prev) => [newRecord, ...prev]);

    // 模拟生成
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const success = Math.random() > 0.2;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === newRecord.id
          ? {
              ...r,
              status: success ? 'completed' : 'failed',
              completedAt: success ? new Date().toLocaleString('zh-CN') : undefined,
              downloadUrl: success ? `/reports/${newRecord.id}.pdf` : undefined,
              errorMessage: success ? undefined : '报告生成失败',
            }
          : r
      )
    );

    setGenerating(false);
    setSelectedTemplate('');
  };

  const handleRetry = async (record: ReportRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === record.id ? { ...r, status: 'generating' as const, errorMessage: undefined } : r))
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: 'completed' as const,
              completedAt: new Date().toLocaleString('zh-CN'),
              downloadUrl: `/reports/${record.id}.pdf`,
            }
          : r
      )
    );
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // 模拟上传
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newRecord: ReportRecord = {
      id: `UPL${String(Date.now()).slice(-6)}`,
      name: file.name,
      type: 'uploaded',
      fileName: file.name,
      status: 'completed',
      createdAt: new Date().toLocaleString('zh-CN'),
      createdBy: '当前用户',
      downloadUrl: `/uploads/${file.name}`,
    };

    setRecords((prev) => [newRecord, ...prev]);
    setUploading(false);
    setUploadModalOpen(false);
    
    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 下载处理函数
  const handleDownloadExcel = () => {
    window.open(`/api/analysis/${taskId}/export/excel`, '_blank');
  };

  const handleDownloadParquet = () => {
    window.open(`/api/analysis/${taskId}/export/parquet`, '_blank');
  };

  const handleDownloadVCF = () => {
    window.open(`/api/analysis/${taskId}/export/vcf`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 数据导出区域 */}
      <div className="bg-canvas-subtle rounded-lg p-4">
        <h4 className="text-sm font-medium text-fg-default mb-3 flex items-center gap-2">
          <Download className="w-4 h-4" />
          数据导出
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="small"
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={handleDownloadExcel}
          >
            Excel 结果表
          </Button>
          <Button
            variant="secondary"
            size="small"
            leftIcon={<Database className="w-4 h-4" />}
            onClick={handleDownloadParquet}
          >
            Parquet 文件
          </Button>
          <Button
            variant="secondary"
            size="small"
            leftIcon={<FileCode className="w-4 h-4" />}
            onClick={handleDownloadVCF}
          >
            SNV/InDel VCF
          </Button>
        </div>
      </div>

      {/* 报告操作区域 */}
      <div className="bg-canvas-subtle rounded-lg p-4">
        <h4 className="text-sm font-medium text-fg-default mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          报告管理
        </h4>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <FormItem label="选择报告模板">
              <Select
                value={selectedTemplate}
                onChange={(value) => {
                  if (typeof value === 'string') setSelectedTemplate(value);
                }}
                options={templateOptions}
                placeholder="请选择报告模板..."
              />
            </FormItem>
          </div>
          <Button
            variant="primary"
            leftIcon={generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            onClick={handleGenerate}
            disabled={!selectedTemplate || generating}
          >
            {generating ? '生成中...' : '生成报告'}
          </Button>
          <Button
            variant="secondary"
            leftIcon={uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            onClick={() => setUploadModalOpen(true)}
            disabled={uploading}
          >
            上传报告
          </Button>
        </div>
      </div>

      {/* 报告列表 */}
      <div>
        <h4 className="text-sm font-medium text-fg-default mb-3">报告列表</h4>
        {records.length === 0 ? (
          <div className="text-center py-8 text-fg-muted border border-border rounded-lg">
            暂无报告记录
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-fg-muted">报告名称</th>
                  <th className="text-left px-4 py-2 font-medium text-fg-muted w-24">类型</th>
                  <th className="text-left px-4 py-2 font-medium text-fg-muted w-24">状态</th>
                  <th className="text-left px-4 py-2 font-medium text-fg-muted w-36">创建时间</th>
                  <th className="text-left px-4 py-2 font-medium text-fg-muted w-20">创建者</th>
                  <th className="text-right px-4 py-2 font-medium text-fg-muted w-28">操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr 
                    key={record.id} 
                    className={index !== records.length - 1 ? 'border-b border-border' : ''}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {record.status === 'completed' && <CheckCircle className="w-4 h-4 text-success-fg flex-shrink-0" />}
                        {record.status === 'failed' && <XCircle className="w-4 h-4 text-danger-fg flex-shrink-0" />}
                        {record.status === 'generating' && <Loader2 className="w-4 h-4 text-accent-fg animate-spin flex-shrink-0" />}
                        {record.status === 'pending' && <Clock className="w-4 h-4 text-warning-fg flex-shrink-0" />}
                        <div>
                          <div className="text-fg-default font-mono text-xs">{record.name}</div>
                          {record.errorMessage && (
                            <div className="text-xs text-danger-fg">{record.errorMessage}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Tag variant={record.type === 'generated' ? 'info' : 'neutral'}>
                        {record.type === 'generated' ? '自动生成' : '手动上传'}
                      </Tag>
                    </td>
                    <td className="px-4 py-3">
                      <Tag
                        variant={
                          record.status === 'completed'
                            ? 'success'
                            : record.status === 'failed'
                            ? 'danger'
                            : record.status === 'generating'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {record.status === 'completed'
                          ? '已完成'
                          : record.status === 'failed'
                          ? '失败'
                          : record.status === 'generating'
                          ? '生成中'
                          : '等待中'}
                      </Tag>
                    </td>
                    <td className="px-4 py-3 text-fg-muted text-xs">{record.createdAt}</td>
                    <td className="px-4 py-3 text-fg-muted">{record.createdBy}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {record.status === 'completed' && record.downloadUrl && (
                          <Button
                            variant="ghost"
                            size="small"
                            leftIcon={<Download className="w-4 h-4" />}
                            onClick={() => window.open(record.downloadUrl, '_blank')}
                          >
                            下载
                          </Button>
                        )}
                        {record.status === 'failed' && record.type === 'generated' && (
                          <Button
                            variant="ghost"
                            size="small"
                            leftIcon={<Play className="w-4 h-4" />}
                            onClick={() => handleRetry(record)}
                          >
                            重试
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 上传弹窗 */}
      <Modal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      >
        <ModalHeader>上传报告文件</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-fg-muted">
              请选择要上传的 DOCX 报告文件。上传后可在报告列表中查看和下载。
            </p>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent-emphasis hover:bg-canvas-subtle transition-colors"
              onClick={handleUploadClick}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-fg-muted" />
              <p className="text-sm text-fg-default">点击选择文件</p>
              <p className="text-xs text-fg-muted mt-1">支持 .docx 格式</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>
            取消
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
