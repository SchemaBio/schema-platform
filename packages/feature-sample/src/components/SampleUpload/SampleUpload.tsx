import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import type { Sample, Patient } from '@schema/types';
import { SampleType } from '@schema/types';
import type { CreateSampleRequest } from '../../types.js';
import { validateCreateSampleRequest } from '../../utils/validation.js';

/**
 * Sample upload props
 */
export interface SampleUploadProps {
  /** Pre-selected patient ID */
  patientId?: string;
  /** Pre-selected batch ID */
  batchId?: string;
  /** Available patients for selection */
  patients?: Patient[];
  /** Available samples for pairing */
  availableSamples?: Sample[];
  /** Allowed sample types */
  allowedTypes?: SampleType[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback on successful creation */
  onSuccess?: (sample: Sample) => void;
  /** Callback on cancel */
  onCancel?: () => void;
  /** Callback to create sample */
  onSubmit?: (data: CreateSampleRequest) => Promise<Sample>;
  /** Callback to search patients */
  onSearchPatients?: (query: string) => Promise<Patient[]>;
}

/**
 * Sample upload component
 */
export function SampleUpload({
  patientId: initialPatientId,
  batchId: initialBatchId,
  patients = [],
  availableSamples = [],
  allowedTypes = [SampleType.GERMLINE, SampleType.SOMATIC, SampleType.TUMOR_NORMAL_PAIR],
  isLoading = false,
  onSuccess,
  onCancel,
  onSubmit,
  onSearchPatients,
}: SampleUploadProps): JSX.Element {
  const [name, setName] = useState('');
  const [sampleType, setSampleType] = useState<SampleType>(allowedTypes[0]);
  const [patientId, setPatientId] = useState(initialPatientId || '');
  const [pairedSampleId, setPairedSampleId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearchPatients = useCallback(async () => {
    if (!patientSearch.trim() || !onSearchPatients) return;
    try {
      const results = await onSearchPatients(patientSearch);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }, [patientSearch, onSearchPatients]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setErrors({});

      const data: CreateSampleRequest = {
        name: name.trim(),
        sampleType,
        patientId,
        batchId: initialBatchId || undefined,
        pairedSampleId: sampleType === SampleType.TUMOR_NORMAL_PAIR ? pairedSampleId : undefined,
      };

      const validation = validateCreateSampleRequest(data);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      setIsSubmitting(true);
      try {
        const sample = await onSubmit?.(data);
        if (sample) {
          onSuccess?.(sample);
        }
      } catch (err) {
        setErrors({ _: err instanceof Error ? err.message : 'Failed to create sample' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, sampleType, patientId, initialBatchId, pairedSampleId, onSubmit, onSuccess]
  );

  const allPatients = [...patients, ...searchResults.filter((p) => !patients.find((pp) => pp.id === p.id))];

  return (
    <form className="sample-upload" onSubmit={handleSubmit}>
      <h2 className="sample-upload__title">Create Sample</h2>

      {errors._ && (
        <div className="form-error" role="alert">
          {errors._}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Sample Name <span className="form-required">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`form-input ${errors.name ? 'form-input--error' : ''}`}
          disabled={isSubmitting || isLoading}
          required
        />
        {errors.name && <p className="form-error-text">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="sampleType" className="form-label">
          Sample Type <span className="form-required">*</span>
        </label>
        <select
          id="sampleType"
          value={sampleType}
          onChange={(e) => setSampleType(e.target.value as SampleType)}
          className={`form-select ${errors.sampleType ? 'form-select--error' : ''}`}
          disabled={isSubmitting || isLoading}
        >
          {allowedTypes.map((type) => (
            <option key={type} value={type}>
              {type === 'GERMLINE' ? 'Germline' : type === 'SOMATIC' ? 'Somatic' : 'Tumor-Normal Pair'}
            </option>
          ))}
        </select>
        {errors.sampleType && <p className="form-error-text">{errors.sampleType}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="patientId" className="form-label">
          Patient <span className="form-required">*</span>
        </label>
        {onSearchPatients && (
          <div className="sample-upload__patient-search">
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patients..."
              className="form-input"
              disabled={isSubmitting || isLoading}
            />
            <button type="button" className="btn btn-secondary" onClick={handleSearchPatients}>
              Search
            </button>
          </div>
        )}
        <select
          id="patientId"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className={`form-select ${errors.patientId ? 'form-select--error' : ''}`}
          disabled={isSubmitting || isLoading}
        >
          <option value="">Select a patient</option>
          {allPatients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name} ({patient.gender}, {patient.birthDate})
            </option>
          ))}
        </select>
        {errors.patientId && <p className="form-error-text">{errors.patientId}</p>}
      </div>

      {sampleType === SampleType.TUMOR_NORMAL_PAIR && (
        <div className="form-group">
          <label htmlFor="pairedSampleId" className="form-label">
            Paired Sample <span className="form-required">*</span>
          </label>
          <select
            id="pairedSampleId"
            value={pairedSampleId}
            onChange={(e) => setPairedSampleId(e.target.value)}
            className={`form-select ${errors.pairedSampleId ? 'form-select--error' : ''}`}
            disabled={isSubmitting || isLoading}
          >
            <option value="">Select paired sample</option>
            {availableSamples.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.name}
              </option>
            ))}
          </select>
          {errors.pairedSampleId && <p className="form-error-text">{errors.pairedSampleId}</p>}
        </div>
      )}

      <div className="sample-upload__actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? 'Creating...' : 'Create Sample'}
        </button>
      </div>
    </form>
  );
}
