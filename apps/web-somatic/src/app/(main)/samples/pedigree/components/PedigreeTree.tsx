'use client';

import * as React from 'react';
import type { PedigreeMember, AffectedStatus } from '../types';
import { AFFECTED_STATUS_CONFIG } from '../types';

interface PedigreeTreeProps {
  members: PedigreeMember[];
  probandId: string;
  selectedMemberId?: string;
  onSelectMember?: (member: PedigreeMember) => void;
}

// 节点尺寸配置
const NODE_SIZE = 40;
const NODE_SPACING_X = 80;
const NODE_SPACING_Y = 100;
const COUPLE_SPACING = 20;

// 绘制家系符号
function PedigreeSymbol({ 
  member, 
  x, 
  y, 
  isSelected, 
  isProband,
  onClick 
}: { 
  member: PedigreeMember; 
  x: number; 
  y: number; 
  isSelected: boolean;
  isProband: boolean;
  onClick: () => void;
}) {
  const size = NODE_SIZE;
  const halfSize = size / 2;
  const statusConfig = AFFECTED_STATUS_CONFIG[member.affectedStatus];
  
  // 根据性别选择形状
  const shape = member.gender === 'male' ? (
    // 男性：正方形
    <rect
      x={x - halfSize}
      y={y - halfSize}
      width={size}
      height={size}
      className={`${statusConfig.color} stroke-fg-default stroke-2 cursor-pointer transition-all ${isSelected ? 'stroke-accent-emphasis stroke-[3px]' : ''}`}
      onClick={onClick}
    />
  ) : member.gender === 'female' ? (
    // 女性：圆形
    <circle
      cx={x}
      cy={y}
      r={halfSize}
      className={`${statusConfig.color} stroke-fg-default stroke-2 cursor-pointer transition-all ${isSelected ? 'stroke-accent-emphasis stroke-[3px]' : ''}`}
      onClick={onClick}
    />
  ) : (
    // 未知：菱形
    <polygon
      points={`${x},${y - halfSize} ${x + halfSize},${y} ${x},${y + halfSize} ${x - halfSize},${y}`}
      className={`${statusConfig.color} stroke-fg-default stroke-2 cursor-pointer transition-all ${isSelected ? 'stroke-accent-emphasis stroke-[3px]' : ''}`}
      onClick={onClick}
    />
  );

  return (
    <g>
      {shape}
      {/* 先证者箭头标记 */}
      {isProband && (
        <path
          d={`M ${x - halfSize - 15} ${y + halfSize + 5} L ${x - halfSize - 5} ${y + halfSize - 5}`}
          className="stroke-accent-emphasis stroke-2"
          markerEnd="url(#arrowhead)"
        />
      )}
      {/* 已故标记（斜线） */}
      {member.isDeceased && (
        <line
          x1={x - halfSize - 5}
          y1={y - halfSize - 5}
          x2={x + halfSize + 5}
          y2={y + halfSize + 5}
          className="stroke-fg-default stroke-2"
        />
      )}
      {/* 样本标记（小圆点表示已采样） */}
      {member.sampleId && (
        <circle
          cx={x}
          cy={y + halfSize + 8}
          r={4}
          className="fill-success-emphasis"
        />
      )}
      {/* 名字 */}
      <text
        x={x}
        y={y + halfSize + 22}
        textAnchor="middle"
        className="text-xs fill-fg-default"
      >
        {member.name}
      </text>
    </g>
  );
}

export function PedigreeTree({ members, probandId, selectedMemberId, onSelectMember }: PedigreeTreeProps) {
  // 按代分组
  const generations = React.useMemo(() => {
    const genMap = new Map<number, PedigreeMember[]>();
    members.forEach(m => {
      const gen = m.generation;
      if (!genMap.has(gen)) genMap.set(gen, []);
      genMap.get(gen)!.push(m);
    });
    // 按 position 排序
    genMap.forEach(members => members.sort((a, b) => a.position - b.position));
    return genMap;
  }, [members]);

  // 计算成员位置
  const memberPositions = React.useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    const sortedGens = Array.from(generations.keys()).sort((a, b) => a - b);
    
    // 找到最小代数作为基准
    const minGen = Math.min(...sortedGens);
    
    sortedGens.forEach(gen => {
      const genMembers = generations.get(gen) || [];
      const y = (gen - minGen) * NODE_SPACING_Y + 60;
      
      // 计算该代的总宽度
      const totalWidth = (genMembers.length - 1) * NODE_SPACING_X;
      const startX = 200 - totalWidth / 2;
      
      genMembers.forEach((member, idx) => {
        positions.set(member.id, {
          x: startX + idx * NODE_SPACING_X,
          y,
        });
      });
    });
    
    return positions;
  }, [generations]);

  // 绘制连接线
  const connections = React.useMemo(() => {
    const lines: React.ReactNode[] = [];
    
    members.forEach(member => {
      const pos = memberPositions.get(member.id);
      if (!pos) return;
      
      // 父母连接线
      if (member.fatherId && member.motherId) {
        const fatherPos = memberPositions.get(member.fatherId);
        const motherPos = memberPositions.get(member.motherId);
        
        if (fatherPos && motherPos) {
          // 父母之间的横线
          const parentY = fatherPos.y;
          const midX = (fatherPos.x + motherPos.x) / 2;
          
          lines.push(
            <line
              key={`couple-${member.fatherId}-${member.motherId}`}
              x1={fatherPos.x}
              y1={parentY}
              x2={motherPos.x}
              y2={parentY}
              className="stroke-fg-muted stroke-1"
            />
          );
          
          // 从父母中点到子女的垂直线
          lines.push(
            <path
              key={`child-${member.id}`}
              d={`M ${midX} ${parentY} L ${midX} ${parentY + NODE_SPACING_Y / 2} L ${pos.x} ${parentY + NODE_SPACING_Y / 2} L ${pos.x} ${pos.y - NODE_SIZE / 2}`}
              className="stroke-fg-muted stroke-1 fill-none"
            />
          );
        }
      }
    });
    
    return lines;
  }, [members, memberPositions]);

  // 计算 SVG 尺寸
  const svgSize = React.useMemo(() => {
    let maxX = 400, maxY = 300;
    memberPositions.forEach(pos => {
      maxX = Math.max(maxX, pos.x + 100);
      maxY = Math.max(maxY, pos.y + 80);
    });
    return { width: maxX, height: maxY };
  }, [memberPositions]);

  return (
    <div className="w-full h-full overflow-auto bg-canvas-default rounded-lg border border-border-default">
      <svg width={svgSize.width} height={svgSize.height} className="min-w-full min-h-full">
        <defs>
          {/* 箭头标记 */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" className="fill-accent-emphasis" />
          </marker>
        </defs>
        
        {/* 连接线 */}
        {connections}
        
        {/* 成员节点 */}
        {members.map(member => {
          const pos = memberPositions.get(member.id);
          if (!pos) return null;
          
          return (
            <PedigreeSymbol
              key={member.id}
              member={member}
              x={pos.x}
              y={pos.y}
              isSelected={member.id === selectedMemberId}
              isProband={member.id === probandId}
              onClick={() => onSelectMember?.(member)}
            />
          );
        })}
      </svg>
      
      {/* 图例 */}
      <div className="absolute bottom-4 left-4 bg-canvas-subtle rounded-lg p-3 border border-border-default">
        <div className="text-xs font-medium text-fg-default mb-2">图例</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-fg-default bg-canvas-default" />
            <span className="text-fg-muted">男性</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-fg-default bg-canvas-default" />
            <span className="text-fg-muted">女性</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-fg-default bg-danger-emphasis" />
            <span className="text-fg-muted">患病</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-fg-default bg-attention-emphasis" />
            <span className="text-fg-muted">携带者</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success-emphasis" />
            <span className="text-fg-muted">已采样</span>
          </div>
        </div>
      </div>
    </div>
  );
}
