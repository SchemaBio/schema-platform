import type { SampleWithRelations } from '../../types.js';

/**
 * Sample detail props
 */
export interface SampleDetailProps {
  /** Sample with relations */
  sample: SampleWithRelations;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Whether to show edit button */
  editable?: boolean;
  /** Callback when edit is clicked */
  onEdit?: () => void;
  /** Callback when delete is clicked */
  onDelete?: () => void;
  /** Callback when batch link is clicked */
  onBatchClick?: (batchId: string) => void;
  /** Callback when patient link is clicked */
  onPatientClick?: (patientId: string) => void;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

/**
 * Sample detail component
 */
export function SampleDetail({
  sample,
  isLoading = false,
  error = null,
  editable = false,
  onEdit,
  onDelete,
  onBatchClick,
  onPatientClick,
}: SampleDetailProps): JSX.Element {
  if (isLoading) {
    return <div className="sample-detail sample-detail--loading">Loading sample...</div>;
  }

  if (error) {
    return (
      <div className="sample-detail sample-detail--error">
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="sample-detail">
      {/* Header */}
      <div className="sample-detail__header">
        <h2 className="sample-detail__title">{sample.name}</h2>
        {editable && (
          <div className="sample-detail__actions">
            <button type="button" className="btn btn-secondary" onClick={onEdit}>
              Edit
            </button>
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <section className="sample-detail__section">
        <h3 className="sample-detail__section-title">Basic Information</h3>
        <dl className="sample-detail__info">
          <dt>ID</dt>
          <dd>{sample.id}</dd>
          <dt>Type</dt>
          <dd>{sample.sampleType}</dd>
          <dt>Status</dt>
          <dd>
            <span className={`sample-detail__status sample-detail__status--${sample.status.toLowerCase()}`}>
              {sample.status}
            </span>
          </dd>
          <dt>Created</dt>
          <dd>{formatDate(sample.createdAt)}</dd>
          <dt>Updated</dt>
          <dd>{formatDate(sample.updatedAt)}</dd>
        </dl>
      </section>

      {/* Patient Info */}
      {sample.patient && (
        <section className="sample-detail__section">
          <h3 className="sample-detail__section-title">Patient Information</h3>
          <dl className="sample-detail__info">
            <dt>Name</dt>
            <dd>
              <button
                type="button"
                className="sample-detail__link"
                onClick={() => onPatientClick?.(sample.patient!.id)}
              >
                {sample.patient.name}
              </button>
            </dd>
            <dt>Gender</dt>
            <dd>{sample.patient.gender}</dd>
            <dt>Birth Date</dt>
            <dd>{sample.patient.birthDate}</dd>
            {sample.patient.phenotypes.length > 0 && (
              <>
                <dt>Phenotypes</dt>
                <dd>
                  <ul className="sample-detail__phenotypes">
                    {sample.patient.phenotypes.map((hpo) => (
                      <li key={hpo}>{hpo}</li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
          </dl>
        </section>
      )}

      {/* Batch Info */}
      {sample.batch && (
        <section className="sample-detail__section">
          <h3 className="sample-detail__section-title">Batch Information</h3>
          <dl className="sample-detail__info">
            <dt>Batch Name</dt>
            <dd>
              <button
                type="button"
                className="sample-detail__link"
                onClick={() => onBatchClick?.(sample.batch!.id)}
              >
                {sample.batch.name}
              </button>
            </dd>
            <dt>Batch Status</dt>
            <dd>{sample.batch.status}</dd>
          </dl>
        </section>
      )}

      {/* QC Report */}
      {sample.qcReport && (
        <section className="sample-detail__section">
          <h3 className="sample-detail__section-title">Quality Control Report</h3>
          <dl className="sample-detail__info">
            <dt>Sequencing Depth</dt>
            <dd>{sample.qcReport.sequencingDepth.toFixed(1)}x</dd>
            <dt>Coverage</dt>
            <dd>{(sample.qcReport.coverage * 100).toFixed(1)}%</dd>
            <dt>Q30</dt>
            <dd>{(sample.qcReport.q30Percentage * 100).toFixed(1)}%</dd>
            <dt>Total Reads</dt>
            <dd>{sample.qcReport.totalReads.toLocaleString()}</dd>
            <dt>Mapped Reads</dt>
            <dd>{sample.qcReport.mappedReads.toLocaleString()}</dd>
            <dt>Duplicate Rate</dt>
            <dd>{(sample.qcReport.duplicateRate * 100).toFixed(2)}%</dd>
          </dl>
        </section>
      )}

      {/* Analysis Status */}
      {sample.analysisStatus && (
        <section className="sample-detail__section">
          <h3 className="sample-detail__section-title">Analysis Status</h3>
          <dl className="sample-detail__info">
            <dt>Stage</dt>
            <dd>{sample.analysisStatus.stage}</dd>
            <dt>Progress</dt>
            <dd>
              <div className="sample-detail__progress">
                <div
                  className="sample-detail__progress-bar"
                  style={{ width: `${sample.analysisStatus.progress}%` }}
                />
                <span>{sample.analysisStatus.progress}%</span>
              </div>
            </dd>
            {sample.analysisStatus.startedAt && (
              <>
                <dt>Started</dt>
                <dd>{formatDate(sample.analysisStatus.startedAt)}</dd>
              </>
            )}
            {sample.analysisStatus.completedAt && (
              <>
                <dt>Completed</dt>
                <dd>{formatDate(sample.analysisStatus.completedAt)}</dd>
              </>
            )}
            {sample.analysisStatus.errorMessage && (
              <>
                <dt>Error</dt>
                <dd className="sample-detail__error">{sample.analysisStatus.errorMessage}</dd>
              </>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}
