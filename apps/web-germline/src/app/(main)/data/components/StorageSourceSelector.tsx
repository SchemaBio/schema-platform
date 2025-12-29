'use client';

import * as React from 'react';
import { HardDrive, Cloud, Server } from 'lucide-react';
import { cn } from '@schema/ui-kit';
import type { StorageSource, StorageProtocol } from '../types';

interface StorageSourceSelectorProps {
  sources: StorageSource[];
  selectedId: string | null;
  onSelect: (source: StorageSource) => void;
}

const protocolIcons: Record<StorageProtocol, React.ReactNode> = {
  webdav: <HardDrive className="w-4 h-4" />,
  s3: <Cloud className="w-4 h-4" />,
  smb: <Server className="w-4 h-4" />,
};

const protocolLabels: Record<StorageProtocol, string> = {
  webdav: 'WebDAV',
  s3: 'S3',
  smb: 'SMB',
};

export function StorageSourceSelector({
  sources,
  selectedId,
  onSelect,
}: StorageSourceSelectorProps) {
  return (
    <div className="space-y-1">
      {sources.map((source) => {
        const isSelected = source.id === selectedId;
        return (
          <button
            key={source.id}
            onClick={() => onSelect(source)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
              isSelected
                ? 'bg-accent-subtle text-accent-fg'
                : 'hover:bg-canvas-inset text-fg-default'
            )}
          >
            <span className={cn(isSelected ? 'text-accent-fg' : 'text-fg-muted')}>
              {protocolIcons[source.protocol]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{source.name}</div>
              <div className="text-xs text-fg-muted truncate">
                {protocolLabels[source.protocol]} · {source.basePath}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
