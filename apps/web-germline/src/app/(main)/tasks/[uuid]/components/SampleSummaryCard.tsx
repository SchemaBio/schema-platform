'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import { User, Calendar, FlaskConical, HeartPulse, Users } from 'lucide-react';
import type { SampleDetail } from '@/app/(main)/samples/types';
import { GENDER_CONFIG } from '@/app/(main)/samples/types';

interface SampleSummaryCardProps {
  sample: SampleDetail;
}

function InfoSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex items-center gap-1 text-fg-muted min-w-[100px]">
        {icon}
        <span className="text-xs">{title}</span>
      </div>
      <div className="flex-1 text-sm text-fg-default">{children}</div>
    </div>
  );
}

function InfoItem({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-fg-muted min-w-[60px]">{label}</span>
      <span className="text-sm text-fg-default">{value || '-'}</span>
    </div>
  );
}

export function SampleSummaryCard({ sample }: SampleSummaryCardProps) {
  const genderInfo = GENDER_CONFIG[sample.gender];
  const isMatched = sample.matchedPair !== null;

  return (
    <div className="bg-canvas-subtle rounded-lg p-4 mb-4">
      {/* 第一行：基本信息 */}
      <div className="flex items-center gap-4 mb-3 pb-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-fg-muted" />
          <span className="font-medium text-fg-default">{sample.internalId}</span>
          <span className={`text-sm ${genderInfo.color}`}>{genderInfo.label}</span>
          {sample.age !== undefined && (
            <span className="text-sm text-fg-muted">{sample.age}岁</span>
          )}
          <Tag variant={isMatched ? 'success' : 'warning'}>
            {isMatched ? '已匹配' : '未匹配'}
          </Tag>
        </div>
        <div className="flex items-center gap-1 text-xs text-fg-muted">
          <span>样本编号:</span>
          <span className="font-mono">{sample.id.substring(0, 8)}...</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-fg-muted">
          <span>样本类型:</span>
          <span>{sample.sampleType}</span>
        </div>
        {sample.projectInfo && (
          <>
            <div className="flex items-center gap-1 text-xs text-fg-muted">
              <span>检测Panel:</span>
              <span>{sample.projectInfo.panel || sample.projectInfo.projectName}</span>
            </div>
            <Tag
              variant={sample.projectInfo.priority === 'urgent' ? 'danger' : 'neutral'}
            >
              {sample.projectInfo.priority === 'urgent' ? '加急' : '普通'}
            </Tag>
          </>
        )}
      </div>

      {/* 第二行：送检信息 */}
      {sample.submissionInfo && (
        <div className="flex items-center gap-6 mb-3 pb-3 border-b border-border-default text-xs">
          <div className="flex items-center gap-1 text-fg-muted">
            <Calendar className="w-3.5 h-3.5" />
            <span>送检日期:</span>
            <span className="text-fg-default">{sample.submissionInfo.submissionDate}</span>
          </div>
          <div className="flex items-center gap-1 text-fg-muted">
            <span>采样日期:</span>
            <span className="text-fg-default">{sample.submissionInfo.sampleCollectionDate}</span>
          </div>
          <div className="flex items-center gap-1 text-fg-muted">
            <span>收样日期:</span>
            <span className="text-fg-default">{sample.submissionInfo.sampleReceiveDate}</span>
          </div>
          <div className="flex items-center gap-1 text-fg-muted">
            <span>样本质量:</span>
            <Tag
              variant={
                sample.submissionInfo.sampleQuality === 'good'
                  ? 'success'
                  : sample.submissionInfo.sampleQuality === 'acceptable'
                  ? 'warning'
                  : 'danger'
              }
            >
              {sample.submissionInfo.sampleQuality === 'good'
                ? '良好'
                : sample.submissionInfo.sampleQuality === 'acceptable'
                ? '合格'
                : '不合格'}
            </Tag>
          </div>
          {sample.projectInfo && (
            <div className="flex items-center gap-1 text-fg-muted">
              <span>承诺周期:</span>
              <span className="text-fg-default">{sample.projectInfo.turnaroundDays}天</span>
            </div>
          )}
        </div>
      )}

      {/* 第三行：临床诊断 */}
      <div className="grid grid-cols-2 gap-4">
        <InfoSection icon={<HeartPulse className="w-3.5 h-3.5" />} title="临床诊断">
          <div className="space-y-1">
            <InfoItem label="主要诊断" value={sample.clinicalDiagnosis?.mainDiagnosis} />
            {sample.clinicalDiagnosis?.symptoms && sample.clinicalDiagnosis.symptoms.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-fg-muted min-w-[60px]">症状</span>
                <div className="flex flex-wrap gap-1">
                  {sample.clinicalDiagnosis.symptoms.map((s, i) => (
                    <Tag key={i} variant="neutral">{s}</Tag>
                  ))}
                </div>
              </div>
            )}
            {sample.clinicalDiagnosis?.hpoTerms && sample.clinicalDiagnosis.hpoTerms.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-fg-muted min-w-[60px] pt-0.5">HPO</span>
                <div className="flex flex-wrap gap-1">
                  {sample.clinicalDiagnosis.hpoTerms.map((hpo, i) => (
                    <Tag
                      key={i}
                      variant="info"
                      className="font-mono"
                      title={hpo.name}
                    >
                      {hpo.id}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </InfoSection>

        <InfoSection icon={<Users className="w-3.5 h-3.5" />} title="家族史">
          <div className="space-y-1">
            <InfoItem
              label="家族史"
              value={sample.familyHistory?.hasHistory ? '有' : '无'}
            />
            {sample.familyHistory?.hasHistory && sample.familyHistory.affectedMembers && (
              <div className="flex flex-wrap gap-1">
                {sample.familyHistory.affectedMembers.map((member, i) => (
                  <Tag key={i} variant="warning">
                    {member.relation}: {member.condition}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </InfoSection>
      </div>
    </div>
  );
}