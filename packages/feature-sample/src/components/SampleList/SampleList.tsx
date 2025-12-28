import { useState, useCallback } from 'react';
import type { Sample, SampleType, SampleStatus } from '@schema/types';
import type { SampleFilters } from '../../types.js';

/**
 * Sample list props
 */
export interface SampleListProps {
  /** List of samples to display */
  samples: Sample[];
  /** Total count for pagination */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  pageSize: number;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Selected sample IDs */
  selectedIds?: string[];
  /** Callback when sample is clicked */
  onSampleClick?: (sample: Sample) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Callback when filters change */
  onFiltersChange?: (filters: SampleFilters) => void;
  /** Callback for batch delete */
  onBatchDelete?: (ids: string[]) => void;
  /** Whether to show batch column */
  showBatchColumn?: boolean;
}

/**
 * Get status badge class
 */
function getStatusClass(status: SampleStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'sample-list__status--completed';
    case 'PROCESSING':
      return 'sample-list__status--processing';
    case 'FAILED':
      return 'sample-list__status--failed';
    case 'PENDING':
    default:
      return 'sample-list__status--pending';
  }
}

/**
 * Get sample type label
 */
function getSampleTypeLabel(type: SampleType): string {
  switch (type) {
    case 'GERMLINE':
      return 'Germline';
    case 'SOMATIC':
      return 'Somatic';
    case 'TUMOR_NORMAL_PAIR':
      return 'Tumor-Normal';
    default:
      return type;
  }
}

/**
 * Sample list component
 */
export function SampleList({
  samples,
  total,
  page,
  pageSize,
  isLoading = false,
  error = null,
  selectedIds = [],
  onSampleClick,
  onSelectionChange,
  onPageChange,
  onPageSizeChange,
  onFiltersChange,
  onBatchDelete,
  showBatchColumn = true,
}: SampleListProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SampleType | ''>('');
  const [statusFilter, setStatusFilter] = useState<SampleStatus | ''>('');

  const selectedSet = new Set(selectedIds);
  const allSelected = samples.length > 0 && samples.every((s) => selectedSet.has(s.id));

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(samples.map((s) => s.id));
    }
  }, [allSelected, samples, onSelectionChange]);

  const handleSelectSample = useCallback(
    (id: string) => {
      if (selectedSet.has(id)) {
        onSelectionChange?.(selectedIds.filter((sid) => sid !== id));
      } else {
        onSelectionChange?.([...selectedIds, id]);
      }
    },
    [selectedIds, selectedSet, onSelectionChange]
  );

  const handleSearch = useCallback(() => {
    onFiltersChange?.({
      search: searchQuery || undefined,
      sampleType: typeFilter || undefined,
      status: statusFilter || undefined,
    });
  }, [searchQuery, typeFilter, statusFilter, onFiltersChange]);

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.length > 0 && confirm(`Delete ${selectedIds.length} samples?`)) {
      onBatchDelete?.(selectedIds);
    }
  }, [selectedIds, onBatchDelete]);

  const totalPages = Math.ceil(total / pageSize);

  if (error) {
    return (
      <div className="sample-list sample-list--error">
        <p className="sample-list__error-message">{error.message}</p>
        <button type="button" className="btn btn-primary" onClick={() => onFiltersChange?.({})}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="sample-list">
      {/* Toolbar */}
      <div className="sample-list__toolbar">
        <div className="sample-list__search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search samples..."
            className="form-input"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as SampleType | '')}
            className="form-select"
          >
            <option value="">All Types</option>
            <option value="GERMLINE">Germline</option>
            <option value="SOMATIC">Somatic</option>
            <option value="TUMOR_NORMAL_PAIR">Tumor-Normal</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SampleStatus | '')}
            className="form-select"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
          <button type="button" className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
        {selectedIds.length > 0 && (
          <div className="sample-list__actions">
            <span>{selectedIds.length} selected</span>
            <button type="button" className="btn btn-danger" onClick={handleBatchDelete}>
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="sample-list__loading">Loading samples...</div>
      ) : (
        <table className="sample-list__table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
              </th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              {showBatchColumn && <th>Batch</th>}
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {samples.length === 0 ? (
              <tr>
                <td colSpan={showBatchColumn ? 6 : 5} className="sample-list__empty">
                  No samples found
                </td>
              </tr>
            ) : (
              samples.map((sample) => (
                <tr
                  key={sample.id}
                  className={selectedSet.has(sample.id) ? 'sample-list__row--selected' : ''}
                  onClick={() => onSampleClick?.(sample)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedSet.has(sample.id)}
                      onChange={() => handleSelectSample(sample.id)}
                    />
                  </td>
                  <td>{sample.name}</td>
                  <td>{getSampleTypeLabel(sample.sampleType)}</td>
                  <td>
                    <span className={`sample-list__status ${getStatusClass(sample.status)}`}>
                      {sample.status}
                    </span>
                  </td>
                  {showBatchColumn && <td>{sample.batchId || '-'}</td>}
                  <td>{new Date(sample.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="sample-list__pagination">
        <div className="sample-list__page-info">
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}
        </div>
        <div className="sample-list__page-controls">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="form-select"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
