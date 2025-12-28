import { useState, useCallback } from 'react';
import type { Batch, SampleStatus } from '@schema/types';
import type { CreateBatchRequest } from '../../types.js';

/**
 * Batch manager props
 */
export interface BatchManagerProps {
  /** List of batches */
  batches: Batch[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Whether to show create button */
  showCreateButton?: boolean;
  /** Callback when batch is selected */
  onBatchSelect?: (batch: Batch) => void;
  /** Callback when batch is created */
  onBatchCreate?: (data: CreateBatchRequest) => Promise<Batch>;
  /** Callback when batch is renamed */
  onBatchRename?: (id: string, name: string) => Promise<void>;
  /** Callback when batch is deleted */
  onBatchDelete?: (id: string) => Promise<void>;
}

/**
 * Get status summary for a batch
 */
function getStatusSummary(sampleIds: string[], _status: SampleStatus): string {
  return `${sampleIds.length} samples`;
}

/**
 * Batch manager component
 */
export function BatchManager({
  batches,
  isLoading = false,
  error = null,
  showCreateButton = true,
  onBatchSelect,
  onBatchCreate,
  onBatchRename,
  onBatchDelete,
}: BatchManagerProps): JSX.Element {
  const [isCreating, setIsCreating] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!newBatchName.trim()) {
      setFormError('Batch name is required');
      return;
    }
    setFormError(null);
    try {
      await onBatchCreate?.({ name: newBatchName.trim() });
      setNewBatchName('');
      setIsCreating(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create batch');
    }
  }, [newBatchName, onBatchCreate]);

  const handleRename = useCallback(
    async (id: string) => {
      if (!editName.trim()) {
        setFormError('Batch name is required');
        return;
      }
      setFormError(null);
      try {
        await onBatchRename?.(id, editName.trim());
        setEditingId(null);
        setEditName('');
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to rename batch');
      }
    },
    [editName, onBatchRename]
  );

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Delete batch "${name}"?`)) return;
      try {
        await onBatchDelete?.(id);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to delete batch');
      }
    },
    [onBatchDelete]
  );

  const startEditing = useCallback((batch: Batch) => {
    setEditingId(batch.id);
    setEditName(batch.name);
    setFormError(null);
  }, []);

  if (error) {
    return (
      <div className="batch-manager batch-manager--error">
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="batch-manager">
      <div className="batch-manager__header">
        <h3 className="batch-manager__title">Batches</h3>
        {showCreateButton && !isCreating && (
          <button type="button" className="btn btn-primary" onClick={() => setIsCreating(true)}>
            New Batch
          </button>
        )}
      </div>

      {formError && (
        <div className="form-error" role="alert">
          {formError}
        </div>
      )}

      {isCreating && (
        <div className="batch-manager__create-form">
          <input
            type="text"
            value={newBatchName}
            onChange={(e) => setNewBatchName(e.target.value)}
            placeholder="Batch name"
            className="form-input"
            autoFocus
          />
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            Create
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setIsCreating(false);
              setNewBatchName('');
              setFormError(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="batch-manager__loading">Loading batches...</div>
      ) : batches.length === 0 ? (
        <div className="batch-manager__empty">No batches found</div>
      ) : (
        <ul className="batch-manager__list">
          {batches.map((batch) => (
            <li key={batch.id} className="batch-manager__item">
              {editingId === batch.id ? (
                <div className="batch-manager__edit-form">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="form-input"
                    autoFocus
                  />
                  <button type="button" className="btn btn-primary btn-small" onClick={() => handleRename(batch.id)}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      setEditingId(null);
                      setFormError(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="batch-manager__item-name"
                    onClick={() => onBatchSelect?.(batch)}
                  >
                    {batch.name}
                  </button>
                  <span className="batch-manager__item-info">
                    {getStatusSummary(batch.sampleIds, batch.status)} • {batch.status}
                  </span>
                  <div className="batch-manager__item-actions">
                    <button type="button" className="btn btn-secondary btn-small" onClick={() => startEditing(batch)}>
                      Rename
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(batch.id, batch.name)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
