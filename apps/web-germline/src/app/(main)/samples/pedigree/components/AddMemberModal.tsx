'use client';

import * as React from 'react';
import { Button, Input, Select } from '@schema/ui-kit';
import { X } from 'lucide-react';
import type { RelationType, AffectedStatus, PedigreeMember } from '../types';
import type { Gender } from '../../types';
import { RELATION_CONFIG, AFFECTED_STATUS_CONFIG } from '../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Omit<PedigreeMember, 'id' | 'generation' | 'position'>) => void;
  existingMembers: PedigreeMember[];
}

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '未知' },
];

const relationOptions = Object.entries(RELATION_CONFIG)
  .filter(([key]) => key !== 'proband')
  .map(([value, config]) => ({ value, label: config.label }));

const affectedOptions = Object.entries(AFFECTED_STATUS_CONFIG)
  .map(([value, config]) => ({ value, label: config.label }));

export function AddMemberModal({ isOpen, onClose, onSubmit, existingMembers }: AddMemberModalProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    gender: 'unknown' as Gender,
    birthYear: '',
    relation: 'sibling' as RelationType,
    affectedStatus: 'unknown' as AffectedStatus,
    fatherId: '',
    motherId: '',
    phenotypes: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      gender: formData.gender,
      birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
      relation: formData.relation,
      affectedStatus: formData.affectedStatus,
      fatherId: formData.fatherId || undefined,
      motherId: formData.motherId || undefined,
      phenotypes: formData.phenotypes ? formData.phenotypes.split(',').map(s => s.trim()) : undefined,
    });
    onClose();
    setFormData({
      name: '',
      gender: 'unknown',
      birthYear: '',
      relation: 'sibling',
      affectedStatus: 'unknown',
      fatherId: '',
      motherId: '',
      phenotypes: '',
    });
  };

  // 获取可选的父母
  const maleMembers = existingMembers.filter(m => m.gender === 'male');
  const femaleMembers = existingMembers.filter(m => m.gender === 'female');

  const fatherOptions = [
    { value: '', label: '无/未知' },
    ...maleMembers.map(m => ({ value: m.id, label: m.name })),
  ];

  const motherOptions = [
    { value: '', label: '无/未知' },
    ...femaleMembers.map(m => ({ value: m.id, label: m.name })),
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-canvas-default rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h2 className="text-lg font-medium text-fg-default">添加家系成员</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-xs text-fg-muted mb-1">姓名 *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="请输入姓名"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-fg-muted mb-1">性别 *</label>
              <Select
                value={formData.gender}
                onChange={(value) => handleChange('gender', Array.isArray(value) ? value[0] : value)}
                options={genderOptions}
              />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1">出生年份</label>
              <Input
                type="number"
                value={formData.birthYear}
                onChange={(e) => handleChange('birthYear', e.target.value)}
                placeholder="如 1990"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-fg-muted mb-1">与先证者关系 *</label>
              <Select
                value={formData.relation}
                onChange={(value) => handleChange('relation', Array.isArray(value) ? value[0] : value)}
                options={relationOptions}
              />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1">患病状态 *</label>
              <Select
                value={formData.affectedStatus}
                onChange={(value) => handleChange('affectedStatus', Array.isArray(value) ? value[0] : value)}
                options={affectedOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-fg-muted mb-1">父亲</label>
              <Select
                value={formData.fatherId}
                onChange={(value) => handleChange('fatherId', Array.isArray(value) ? value[0] : value)}
                options={fatherOptions}
              />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1">母亲</label>
              <Select
                value={formData.motherId}
                onChange={(value) => handleChange('motherId', Array.isArray(value) ? value[0] : value)}
                options={motherOptions}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-fg-muted mb-1">表型描述</label>
            <Input
              value={formData.phenotypes}
              onChange={(e) => handleChange('phenotypes', e.target.value)}
              placeholder="多个表型用逗号分隔"
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default bg-canvas-subtle">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={(e: React.MouseEvent) => handleSubmit(e)}>添加成员</Button>
        </div>
      </div>
    </div>
  );
}
