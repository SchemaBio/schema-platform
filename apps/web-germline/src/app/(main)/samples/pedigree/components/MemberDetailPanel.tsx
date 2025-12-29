'use client';

import * as React from 'react';
import { Button, Tag } from '@schema/ui-kit';
import { X, User, Link2, Trash2 } from 'lucide-react';
import type { PedigreeMember } from '../types';
import { RELATION_CONFIG, AFFECTED_STATUS_CONFIG } from '../types';
import { GENDER_CONFIG } from '../../types';

interface MemberDetailPanelProps {
  member: PedigreeMember;
  onClose: () => void;
  onLinkSample?: (memberId: string) => void;
  onRemoveMember?: (memberId: string) => void;
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-fg-muted">{label}</span>
      <span className="text-sm text-fg-default">{value || '-'}</span>
    </div>
  );
}

export function MemberDetailPanel({ member, onClose, onLinkSample, onRemoveMember }: MemberDetailPanelProps) {
  const genderInfo = GENDER_CONFIG[member.gender];
  const relationInfo = RELATION_CONFIG[member.relation];
  const statusInfo = AFFECTED_STATUS_CONFIG[member.affectedStatus];

  return (
    <div className="w-80 border-l border-border-default bg-canvas-subtle flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-fg-muted" />
          <span className="font-medium text-fg-default">{member.name}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* 基本信息 */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wider">基本信息</h4>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="姓名" value={member.name} />
            <InfoItem 
              label="性别" 
              value={<span className={genderInfo.color}>{genderInfo.label}</span>} 
            />
            <InfoItem label="关系" value={relationInfo.label} />
            <InfoItem 
              label="出生年份" 
              value={member.birthYear ? `${member.birthYear}年` : '-'} 
            />
            <InfoItem 
              label="状态" 
              value={
                member.isDeceased 
                  ? <span className="text-fg-muted">已故 {member.deceasedYear ? `(${member.deceasedYear})` : ''}</span>
                  : <span className="text-success-fg">在世</span>
              } 
            />
          </div>
        </div>

        {/* 患病状态 */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wider">患病状态</h4>
          <div className="space-y-2">
            <Tag 
              variant={
                member.affectedStatus === 'affected' ? 'danger' :
                member.affectedStatus === 'carrier' ? 'warning' :
                member.affectedStatus === 'unaffected' ? 'success' : 'neutral'
              }
            >
              {statusInfo.label}
            </Tag>
            {member.phenotypes && member.phenotypes.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-fg-muted block mb-1">表型描述</span>
                <div className="flex flex-wrap gap-1">
                  {member.phenotypes.map((p, i) => (
                    <Tag key={i} variant="neutral">{p}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 样本关联 */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wider">样本关联</h4>
          {member.sampleId ? (
            <div className="flex items-center gap-2 p-2 bg-success-subtle rounded">
              <div className="w-2 h-2 rounded-full bg-success-emphasis" />
              <span className="text-sm text-success-fg">已关联样本: {member.sampleId}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-canvas-inset rounded">
              <div className="w-2 h-2 rounded-full bg-neutral-emphasis" />
              <span className="text-sm text-fg-muted">未关联样本</span>
            </div>
          )}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="p-4 border-t border-border-default space-y-2">
        {!member.sampleId && (
          <Button 
            variant="secondary" 
            className="w-full" 
            leftIcon={<Link2 className="w-4 h-4" />}
            onClick={() => onLinkSample?.(member.id)}
          >
            关联样本
          </Button>
        )}
        {member.relation !== 'proband' && (
          <Button 
            variant="ghost" 
            className="w-full text-danger-fg hover:bg-danger-subtle" 
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => onRemoveMember?.(member.id)}
          >
            移除成员
          </Button>
        )}
      </div>
    </div>
  );
}
