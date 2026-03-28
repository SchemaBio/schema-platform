'use client';

import * as React from 'react';
import { Button, Tag, Input, Select, Modal, ModalHeader, ModalBody, ModalFooter } from '@schema/ui-kit';
import { Link2, Link2Off, RefreshCw, CheckCircle, Clock, AlertCircle, Database } from 'lucide-react';

interface MatchingData {
  id: string;
  sequencingId: string;
  runId: string;
  laneId: string;
  dataSize: string;
  fileType: string;
  status: 'available' | 'matched' | 'unavailable';
  matchedAt?: string;
  matchedSample?: string;
}

interface MatchingTabProps {
  sampleId: string;
}

const mockAvailableData: MatchingData[] = [
  {
    id: 'SEQ-001-A01',
    sequencingId: 'SEQ-001',
    runId: 'RUN-2024120001',
    laneId: 'Lane1',
    dataSize: '12.5 GB',
    fileType: 'FASTQ',
    status: 'available',
  },
  {
    id: 'SEQ-001-A02',
    sequencingId: 'SEQ-001',
    runId: 'RUN-2024120001',
    laneId: 'Lane2',
    dataSize: '11.8 GB',
    fileType: 'FASTQ',
    status: 'matched',
    matchedSample: 'S2024120002',
    matchedAt: '2024-12-20 14:35',
  },
  {
    id: 'SEQ-002-B01',
    sequencingId: 'SEQ-002',
    runId: 'RUN-2024120002',
    laneId: 'Lane1',
    dataSize: '13.2 GB',
    fileType: 'FASTQ',
    status: 'available',
  },
];

export function MatchingTab({ sampleId }: MatchingTabProps) {
  const [matchedData, setMatchedData] = React.useState<MatchingData | null>(null);
  const [availableData, setAvailableData] = React.useState<MatchingData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [matchModalOpen, setMatchModalOpen] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState<string>('');
  const [matching, setMatching] = React.useState(false);
  const [unmatchConfirmOpen, setUnmatchConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if sample already has matched data
      const existingMatch = mockAvailableData.find(
        (d) => d.status === 'matched' && d.matchedSample === sampleId
      );

      if (existingMatch) {
        setMatchedData(existingMatch);
      }

      // Get available data for matching
      setAvailableData(mockAvailableData.filter((d) => d.status === 'available'));
      setLoading(false);
    }
    loadData();
  }, [sampleId]);

  const handleMatch = async () => {
    if (!selectedData) return;

    setMatching(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = availableData.find((d) => d.id === selectedData);
    if (data) {
      setMatchedData({
        ...data,
        status: 'matched',
        matchedSample: sampleId,
        matchedAt: new Date().toLocaleString('zh-CN'),
      });
      setAvailableData((prev) => prev.filter((d) => d.id !== selectedData));
    }

    setMatching(false);
    setMatchModalOpen(false);
    setSelectedData('');
  };

  const handleUnmatch = async () => {
    if (!matchedData) return;

    // Return data to available pool
    setAvailableData((prev) => [
      ...prev,
      { ...matchedData, status: 'available', matchedSample: undefined, matchedAt: undefined },
    ]);
    setMatchedData(null);
    setUnmatchConfirmOpen(false);
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
      {/* 当前匹配状态 */}
      <div className="bg-canvas-subtle rounded-lg p-4">
        <h4 className="text-sm font-medium text-fg-default mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          数据匹配状态
        </h4>

        {matchedData ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-success-subtle rounded border border-success-muted">
              <CheckCircle className="w-5 h-5 text-success-fg" />
              <div className="flex-1">
                <div className="text-sm font-medium text-fg-default">已匹配数据</div>
                <div className="text-xs text-fg-muted mt-1">
                  匹配时间: {matchedData.matchedAt}
                </div>
              </div>
              <Button
                variant="secondary"
                size="small"
                leftIcon={<Link2Off className="w-4 h-4" />}
                onClick={() => setUnmatchConfirmOpen(true)}
              >
                解除匹配
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-canvas-default rounded">
              <div>
                <span className="text-xs text-fg-muted">测序编号</span>
                <p className="text-sm text-fg-default font-mono">{matchedData.sequencingId}</p>
              </div>
              <div>
                <span className="text-xs text-fg-muted">Run ID</span>
                <p className="text-sm text-fg-default font-mono">{matchedData.runId}</p>
              </div>
              <div>
                <span className="text-xs text-fg-muted">Lane</span>
                <p className="text-sm text-fg-default">{matchedData.laneId}</p>
              </div>
              <div>
                <span className="text-xs text-fg-muted">数据大小</span>
                <p className="text-sm text-fg-default">{matchedData.dataSize}</p>
              </div>
              <div>
                <span className="text-xs text-fg-muted">文件类型</span>
                <p className="text-sm text-fg-default">{matchedData.fileType}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-warning-subtle rounded border border-warning-muted">
              <Clock className="w-5 h-5 text-warning-fg" />
              <div className="flex-1">
                <div className="text-sm font-medium text-fg-default">未匹配数据</div>
                <div className="text-xs text-fg-muted mt-1">
                  该样本尚未关联测序数据，无法启动分析流程
                </div>
              </div>
              <Button
                variant="primary"
                size="small"
                leftIcon={<Link2 className="w-4 h-4" />}
                onClick={() => setMatchModalOpen(true)}
                disabled={availableData.length === 0}
              >
                匹配数据
              </Button>
            </div>

            {availableData.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-canvas-default rounded">
                <AlertCircle className="w-4 h-4 text-fg-muted" />
                <span className="text-sm text-fg-muted">当前没有可用的测序数据可匹配</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 可用数据列表 */}
      {!matchedData && availableData.length > 0 && (
        <div className="bg-canvas-subtle rounded-lg p-4">
          <h4 className="text-sm font-medium text-fg-default mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            可用测序数据 ({availableData.length})
          </h4>
          <div className="space-y-2">
            {availableData.map((data) => (
              <div
                key={data.id}
                className="flex items-center justify-between p-3 bg-canvas-default rounded hover:bg-canvas-inset transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-fg-default font-mono">{data.id}</span>
                    <Tag variant="success">可用</Tag>
                  </div>
                  <div className="text-xs text-fg-muted mt-1">
                    {data.runId} / {data.laneId} / {data.dataSize}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={<Link2 className="w-4 h-4" />}
                  onClick={() => {
                    setSelectedData(data.id);
                    setMatchModalOpen(true);
                  }}
                >
                  匹配
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 匹配弹窗 */}
      <Modal open={matchModalOpen} onOpenChange={setMatchModalOpen}>
        <ModalHeader>匹配测序数据</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-fg-muted">
              选择要匹配到样本 <span className="font-mono text-fg-default">{sampleId}</span> 的测序数据。
              一个样本只能匹配一组数据。
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-fg-default">选择测序数据</label>
              {availableData.map((data) => (
                <div
                  key={data.id}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedData === data.id
                      ? 'border-accent-emphasis bg-accent-subtle'
                      : 'border-border-default hover:border-accent-muted'
                  }`}
                  onClick={() => setSelectedData(data.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-fg-default font-mono">{data.id}</span>
                    <Tag variant="info">{data.fileType}</Tag>
                  </div>
                  <div className="text-xs text-fg-muted mt-1">
                    Run: {data.runId} | Lane: {data.laneId} | Size: {data.dataSize}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setMatchModalOpen(false)}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleMatch}
            disabled={!selectedData || matching}
            leftIcon={matching ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined}
          >
            {matching ? '匹配中...' : '确认匹配'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* 解除匹配确认弹窗 */}
      <Modal open={unmatchConfirmOpen} onOpenChange={setUnmatchConfirmOpen}>
        <ModalHeader>确认解除匹配</ModalHeader>
        <ModalBody>
          <p className="text-sm text-fg-muted">
            确定要解除样本 <span className="font-mono text-fg-default">{sampleId}</span> 与测序数据
            <span className="font-mono text-fg-default">{matchedData?.id}</span> 的匹配关系吗？
          </p>
          <p className="text-sm text-warning-fg mt-2">
            解除匹配后，该数据将返回可用数据池，其他样本可以匹配。
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setUnmatchConfirmOpen(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleUnmatch}>
            解除匹配
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}