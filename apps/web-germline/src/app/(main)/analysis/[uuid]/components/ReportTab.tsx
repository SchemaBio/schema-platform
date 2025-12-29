'use client';

import * as React from 'react';
import { Button, Select, Tag, FormItem, Modal, ModalHeader, ModalBody, ModalFooter } from '@schema/ui-kit';
import { 
  FileText, Play, Clock, CheckCircle, Loader2, Download, 
  FileSpreadsheet, Database, FileCode, Upload, FileArchive, Trash2, AlertCircle,
  X, Eye, FileType
} from 'lucide-react';

// 统一的报告记录类型
interface ReportRecord {
  id: string;
  name: string;
  type: 'generated' | 'uploaded';
  templateName?: string;
  fileName?: string;
  status: 'pending' | 'generating' | 'completed';
  createdAt: string;
  createdBy: string;
  completedAt?: string;
  downloadUrl?: string;
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
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<ReportRecord | null>(null);
  const [previewRecord, setPreviewRecord] = React.useState<ReportRecord | null>(null);
  const [previewHtml, setPreviewHtml] = React.useState<string>('');
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    const newRecordId = `RPT${String(Date.now()).slice(-6)}`;
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const success = Math.random() > 0.2;
    
    if (success) {
      const newRecord: ReportRecord = {
        id: newRecordId,
        name: template.name,
        type: 'generated',
        templateName: template.name,
        status: 'completed',
        createdAt: new Date().toLocaleString('zh-CN'),
        createdBy: '当前用户',
        completedAt: new Date().toLocaleString('zh-CN'),
        downloadUrl: `/reports/${newRecordId}.pdf`,
      };
      setRecords((prev) => [newRecord, ...prev]);
    } else {
      setErrorMessage(`报告 "${template.name}" 生成失败：API 连接超时，请稍后重试。`);
      setErrorModalOpen(true);
    }

    setGenerating(false);
    setSelectedTemplate('');
  };

  const handleDelete = (record: ReportRecord) => {
    setRecordToDelete(record);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
    setDeleteModalOpen(false);
    if (previewRecord?.id === recordToDelete.id) {
      setPreviewRecord(null);
      setPreviewHtml('');
    }
    setRecordToDelete(null);
  };

  const handlePreview = async (record: ReportRecord) => {
    if (record.status !== 'completed' || !record.downloadUrl) return;
    
    setPreviewRecord(record);
    setPreviewLoading(true);
    setPreviewHtml('');

    try {
      const mammoth = await import('mammoth');
      const response = await fetch(record.downloadUrl);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setPreviewHtml(result.value);
    } catch {
      // 显示模拟内容
      setPreviewHtml(`
        <div style="font-family: 'SimSun', serif; padding: 20px;">
          <h1 style="text-align: center; font-size: 18px; margin-bottom: 20px;">基因检测报告</h1>
          <p><strong>报告编号：</strong>${record.id}</p>
          <p><strong>报告名称：</strong>${record.name}</p>
          <p><strong>生成时间：</strong>${record.createdAt}</p>
          <p><strong>创建者：</strong>${record.createdBy}</p>
          <hr style="margin: 20px 0;" />
          <h2 style="font-size: 16px;">一、样本信息</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <tr><td style="border: 1px solid #ddd; padding: 8px;">样本类型</td><td style="border: 1px solid #ddd; padding: 8px;">外周血</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;">采样日期</td><td style="border: 1px solid #ddd; padding: 8px;">2024-12-25</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;">检测方法</td><td style="border: 1px solid #ddd; padding: 8px;">全外显子组测序 (WES)</td></tr>
          </table>
          <h2 style="font-size: 16px;">二、检测结果</h2>
          <p>本次检测共发现 <strong>3</strong> 个可能致病性变异，详见下表：</p>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px;">基因</th>
              <th style="border: 1px solid #ddd; padding: 8px;">变异</th>
              <th style="border: 1px solid #ddd; padding: 8px;">ACMG分类</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">BRCA1</td>
              <td style="border: 1px solid #ddd; padding: 8px;">c.5266dupC</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: red;">致病</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">TP53</td>
              <td style="border: 1px solid #ddd; padding: 8px;">c.743G>A</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: orange;">可能致病</td>
            </tr>
          </table>
          <h2 style="font-size: 16px;">三、结论与建议</h2>
          <p>根据检测结果，建议进行遗传咨询并定期随访。</p>
        </div>
      `);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewRecord(null);
    setPreviewHtml('');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadExcel = () => window.open(`/api/analysis/${taskId}/export/excel`, '_blank');
  const handleDownloadParquet = () => window.open(`/api/analysis/${taskId}/export/parquet`, '_blank');
  const handleDownloadVCF = () => window.open(`/api/analysis/${taskId}/export/vcf`, '_blank');
  const handleDownloadBAM = () => window.open(`/api/analysis/${taskId}/export/bam`, '_blank');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
      </div>
    );
  }


  return (
    <div className="flex gap-4">
      {/* 左侧主内容区 */}
      <div className={`space-y-6 transition-all duration-300 ${previewRecord ? 'w-1/2' : 'w-full'}`}>
        {/* 数据导出区域 */}
        <div className="bg-canvas-subtle rounded-lg p-4">
          <h4 className="text-sm font-medium text-fg-default mb-3 flex items-center gap-2">
            <Download className="w-4 h-4" />
            数据导出
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="small" leftIcon={<FileSpreadsheet className="w-4 h-4" />} onClick={handleDownloadExcel}>
              Excel 结果表
            </Button>
            <Button variant="secondary" size="small" leftIcon={<Database className="w-4 h-4" />} onClick={handleDownloadParquet}>
              Parquet 文件
            </Button>
            <Button variant="secondary" size="small" leftIcon={<FileCode className="w-4 h-4" />} onClick={handleDownloadVCF}>
              SNV/InDel VCF
            </Button>
            <Button variant="secondary" size="small" leftIcon={<FileArchive className="w-4 h-4" />} onClick={handleDownloadBAM}>
              BAM 比对文件
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
                  onChange={(value) => { if (typeof value === 'string') setSelectedTemplate(value); }}
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
            <div className="text-center py-8 text-fg-muted border border-border rounded-lg">暂无报告记录</div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-canvas-subtle border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-fg-muted w-[30%]">报告名称</th>
                    <th className="text-center px-4 py-2 font-medium text-fg-muted w-[12%]">类型</th>
                    <th className="text-center px-4 py-2 font-medium text-fg-muted w-[12%]">状态</th>
                    <th className="text-center px-4 py-2 font-medium text-fg-muted w-[18%]">创建时间</th>
                    <th className="text-center px-4 py-2 font-medium text-fg-muted w-[10%]">创建者</th>
                    <th className="text-center px-4 py-2 font-medium text-fg-muted w-[18%]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr 
                      key={record.id} 
                      className={`${index !== records.length - 1 ? 'border-b border-border' : ''} ${record.status === 'completed' ? 'cursor-pointer hover:bg-canvas-subtle' : ''} ${previewRecord?.id === record.id ? 'bg-accent-subtle' : ''}`}
                      onClick={() => record.status === 'completed' && handlePreview(record)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {record.status === 'completed' && <CheckCircle className="w-4 h-4 text-success-fg flex-shrink-0" />}
                          {record.status === 'generating' && <Loader2 className="w-4 h-4 text-accent-fg animate-spin flex-shrink-0" />}
                          {record.status === 'pending' && <Clock className="w-4 h-4 text-warning-fg flex-shrink-0" />}
                          <span className="text-fg-default font-mono text-xs truncate">{record.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Tag variant={record.type === 'generated' ? 'info' : 'neutral'}>
                          {record.type === 'generated' ? '自动生成' : '手动上传'}
                        </Tag>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Tag variant={record.status === 'completed' ? 'success' : record.status === 'generating' ? 'info' : 'warning'}>
                          {record.status === 'completed' ? '已完成' : record.status === 'generating' ? '生成中' : '等待中'}
                        </Tag>
                      </td>
                      <td className="px-4 py-3 text-center text-fg-muted text-xs">{record.createdAt}</td>
                      <td className="px-4 py-3 text-center text-fg-muted">{record.createdBy}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {record.status === 'completed' && (
                            <Button variant="ghost" size="small" onClick={() => handlePreview(record)} title="预览">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {record.status === 'completed' && record.downloadUrl && (
                            <Button variant="ghost" size="small" onClick={() => window.open(record.downloadUrl, '_blank')} title="下载">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {record.status === 'completed' && (
                            <Button variant="ghost" size="small" onClick={() => window.open(`/api/reports/${record.id}/pdf`, '_blank')} title="导出PDF">
                              <FileType className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="small" onClick={() => handleDelete(record)} disabled={record.status === 'generating'} title="删除">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {/* 右侧预览面板 */}
      {previewRecord && (
        <>
          {/* 点击空白处关闭预览的遮罩 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={closePreview}
          />
          <div 
            className="w-1/2 border border-border rounded-lg bg-canvas-default flex flex-col h-[calc(100vh-200px)] sticky top-4 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-canvas-subtle rounded-t-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-fg-muted" />
                <span className="text-sm font-medium text-fg-default truncate max-w-[200px]">{previewRecord.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {previewRecord.downloadUrl && (
                  <Button variant="ghost" size="small" leftIcon={<Download className="w-4 h-4" />} onClick={() => window.open(previewRecord.downloadUrl, '_blank')}>
                    下载
                  </Button>
                )}
                <Button variant="ghost" size="small" leftIcon={<X className="w-4 h-4" />} onClick={closePreview}>
                  关闭
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-fg mx-auto mb-2" />
                    <p className="text-sm text-fg-muted">正在加载预览...</p>
                  </div>
                </div>
              ) : previewHtml ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <div className="flex items-center justify-center h-full text-fg-muted">无法加载预览内容</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 上传弹窗 */}
      <Modal open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <ModalHeader>上传报告文件</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-fg-muted">请选择要上传的 DOCX 报告文件。上传后可在报告列表中查看和下载。</p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent-emphasis hover:bg-canvas-subtle transition-colors" onClick={handleUploadClick}>
              <Upload className="w-8 h-8 mx-auto mb-2 text-fg-muted" />
              <p className="text-sm text-fg-default">点击选择文件</p>
              <p className="text-xs text-fg-muted mt-1">支持 .docx 格式</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".docx" className="hidden" onChange={handleFileChange} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>取消</Button>
        </ModalFooter>
      </Modal>

      {/* 生成失败提示弹窗 */}
      <Modal open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <ModalHeader>
          <div className="flex items-center gap-2 text-danger-fg">
            <AlertCircle className="w-5 h-5" />
            报告生成失败
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-fg-muted">{errorMessage}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setErrorModalOpen(false)}>确定</Button>
        </ModalFooter>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalHeader>确认删除</ModalHeader>
        <ModalBody>
          <p className="text-sm text-fg-muted">确定要删除报告 &quot;{recordToDelete?.name}&quot; 吗？此操作不可撤销。</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>取消</Button>
          <Button variant="danger" onClick={confirmDelete}>删除</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
