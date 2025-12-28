import { useState, useCallback, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Patient } from '@schema/types';
import { Gender } from '@schema/types';
import type { CreatePatientRequest, UpdatePatientRequest } from '../../types.js';
import { validatePatientData } from '../../utils/validation.js';

/**
 * Patient form props
 */
export interface PatientFormProps {
  /** Patient for editing (null for create) */
  patient?: Patient | null;
  /** Loading state */
  isLoading?: boolean;
  /** Callback on successful save */
  onSuccess?: (patient: Patient) => void;
  /** Callback on cancel */
  onCancel?: () => void;
  /** Callback to create patient */
  onCreate?: (data: CreatePatientRequest) => Promise<Patient>;
  /** Callback to update patient */
  onUpdate?: (id: string, data: UpdatePatientRequest) => Promise<Patient>;
}

/**
 * Patient form component
 */
export function PatientForm({
  patient,
  isLoading = false,
  onSuccess,
  onCancel,
  onCreate,
  onUpdate,
}: PatientFormProps): JSX.Element {
  const isEditing = !!patient;

  const [name, setName] = useState(patient?.name || '');
  const [gender, setGender] = useState<Gender>(patient?.gender || Gender.UNKNOWN);
  const [birthDate, setBirthDate] = useState(patient?.birthDate || '');
  const [phenotypes, setPhenotypes] = useState<string[]>(patient?.phenotypes || []);
  const [newPhenotype, setNewPhenotype] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when patient changes
  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setGender(patient.gender);
      setBirthDate(patient.birthDate);
      setPhenotypes(patient.phenotypes);
    }
  }, [patient]);

  const handleAddPhenotype = useCallback(() => {
    const trimmed = newPhenotype.trim().toUpperCase();
    if (trimmed && !phenotypes.includes(trimmed)) {
      setPhenotypes([...phenotypes, trimmed]);
      setNewPhenotype('');
    }
  }, [newPhenotype, phenotypes]);

  const handleRemovePhenotype = useCallback((hpo: string) => {
    setPhenotypes((prev) => prev.filter((p) => p !== hpo));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setErrors({});

      const data: CreatePatientRequest = {
        name: name.trim(),
        gender,
        birthDate,
        phenotypes,
      };

      const validation = validatePatientData(data);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      setIsSubmitting(true);
      try {
        let result: Patient;
        if (isEditing && patient) {
          result = await onUpdate?.(patient.id, { name: data.name, gender: data.gender, birthDate: data.birthDate }) as Patient;
        } else {
          result = await onCreate?.(data) as Patient;
        }
        if (result) {
          onSuccess?.(result);
        }
      } catch (err) {
        setErrors({ _: err instanceof Error ? err.message : 'Failed to save patient' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, gender, birthDate, phenotypes, isEditing, patient, onCreate, onUpdate, onSuccess]
  );

  return (
    <form className="patient-form" onSubmit={handleSubmit}>
      <h2 className="patient-form__title">{isEditing ? 'Edit Patient' : 'Create Patient'}</h2>

      {errors._ && (
        <div className="form-error" role="alert">
          {errors._}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Name <span className="form-required">*</span>
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
        <label htmlFor="gender" className="form-label">
          Gender <span className="form-required">*</span>
        </label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          className={`form-select ${errors.gender ? 'form-select--error' : ''}`}
          disabled={isSubmitting || isLoading}
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="UNKNOWN">Unknown</option>
        </select>
        {errors.gender && <p className="form-error-text">{errors.gender}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="birthDate" className="form-label">
          Birth Date <span className="form-required">*</span>
        </label>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className={`form-input ${errors.birthDate ? 'form-input--error' : ''}`}
          disabled={isSubmitting || isLoading}
          required
        />
        {errors.birthDate && <p className="form-error-text">{errors.birthDate}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Phenotypes (HPO Terms)</label>
        <div className="patient-form__phenotype-input">
          <input
            type="text"
            value={newPhenotype}
            onChange={(e) => setNewPhenotype(e.target.value)}
            placeholder="e.g., HP:0001250"
            className="form-input"
            disabled={isSubmitting || isLoading}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddPhenotype}
            disabled={isSubmitting || isLoading}
          >
            Add
          </button>
        </div>
        {phenotypes.length > 0 && (
          <ul className="patient-form__phenotypes">
            {phenotypes.map((hpo) => (
              <li key={hpo} className="patient-form__phenotype">
                <span>{hpo}</span>
                <button
                  type="button"
                  className="patient-form__phenotype-remove"
                  onClick={() => handleRemovePhenotype(hpo)}
                  disabled={isSubmitting || isLoading}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="patient-form__actions">
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
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Patient' : 'Create Patient'}
        </button>
      </div>
    </form>
  );
}
