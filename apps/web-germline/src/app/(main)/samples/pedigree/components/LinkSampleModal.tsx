'use client';

import * as React from 'react';
import { Button, Input } from '@schema/ui-kit';
import { X, Search } from 'lucide-react';
import { mockSamples } from '../../mock-data';
import { GENDER_CONFIG } from '../../types';

interface LinkSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sampleId: string) => void;
  memberName: string;
}

export function LinkSampleModal({ isOpen, onClose, onSelect, memberName }: LinkSampleModalProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSamples = React.useMemo(() => {
    if (!searchQuery) return mockSamples;
    const query = searchQuery.toLowerCase();
    return mockSamples.filter(
      (s) => s.id.toLowerCase().includes(query) || s.name.includes(query)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 弹窗 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-medium text-gray-900">关联样本</h2>
            <p className="text-sm text-gray-500 mt-0.5">为 {memberName} 选择关联样本</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索 */}
        <div className="px-6 py-3 border-b border-gray-200">
          <Input
            placeholder="搜索样本编号或姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>

        {/* 样本列表 */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredSamples.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredSamples.map((sample) => {
                const genderInfo = GENDER_CONFIG[sample.gender];
                return (
                  <div
                    key={sample.id}
                    className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      onSelect(sample.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{sample.id}</span>
                        <span className="text-gray-500 ml-2">{sample.name}</span>
                        <span className={`ml-2 text-sm ${genderInfo.color}`}>
                          {genderInfo.label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">{sample.sampleType}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {sample.hospital} · {sample.testProject}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              未找到匹配的样本
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={onClose} className="w-full">
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}
