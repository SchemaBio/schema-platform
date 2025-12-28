import { useContext, useCallback, useEffect, useState } from 'react';
import type { Patient } from '@schema/types';
import { SampleContext } from '../providers/SampleContext.js';
import type { CreatePatientRequest, UpdatePatientRequest } from '../types.js';
import type { SampleState } from '../stores/sample.store.js';

/**
 * Return type for usePatients hook
 */
export interface UsePatientsReturn {
  /** List of patients */
  patients: Patient[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;

  // Actions
  /** Fetch all patients */
  fetchPatients: () => Promise<void>;
  /** Create a new patient */
  createPatient: (data: CreatePatientRequest) => Promise<Patient>;
  /** Update a patient */
  updatePatient: (id: string, data: UpdatePatientRequest) => Promise<Patient>;
  /** Delete a patient */
  deletePatient: (id: string) => Promise<void>;
  /** Search patients */
  searchPatients: (query: string) => Promise<Patient[]>;
  /** Add phenotypes to a patient */
  addPhenotypes: (patientId: string, hpoTerms: string[]) => Promise<Patient>;
  /** Remove phenotypes from a patient */
  removePhenotypes: (patientId: string, hpoTerms: string[]) => Promise<Patient>;
}

/**
 * Hook for managing patients
 */
export function usePatients(): UsePatientsReturn {
  const context = useContext(SampleContext);
  if (!context) {
    throw new Error('usePatients must be used within a SampleProvider');
  }

  const { patientService, store } = context;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [storeState, setStoreState] = useState<SampleState>(store.getState());

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return unsubscribe;
  }, [store]);

  // Fetch patients
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await patientService.getPatients();
      store.setPatients(response.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch patients'));
    } finally {
      setIsLoading(false);
    }
  }, [patientService, store]);

  // Create patient
  const createPatient = useCallback(
    async (data: CreatePatientRequest): Promise<Patient> => {
      setError(null);

      try {
        const patient = await patientService.createPatient(data);
        store.addPatient(patient);
        return patient;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create patient');
        setError(error);
        throw error;
      }
    },
    [patientService, store]
  );

  // Update patient
  const updatePatient = useCallback(
    async (id: string, data: UpdatePatientRequest): Promise<Patient> => {
      setError(null);

      // Optimistic update
      const snapshot = store.createSnapshot();
      store.updatePatient(id, data);

      try {
        const patient = await patientService.updatePatient(id, data);
        store.updatePatient(id, patient);
        return patient;
      } catch (err) {
        // Rollback
        store.restoreSnapshot(snapshot);
        const error = err instanceof Error ? err : new Error('Failed to update patient');
        setError(error);
        throw error;
      }
    },
    [patientService, store]
  );

  // Delete patient
  const deletePatient = useCallback(
    async (id: string): Promise<void> => {
      setError(null);

      // Optimistic update
      const snapshot = store.createSnapshot();
      store.removePatient(id);

      try {
        await patientService.deletePatient(id);
      } catch (err) {
        // Rollback
        store.restoreSnapshot(snapshot);
        const error = err instanceof Error ? err : new Error('Failed to delete patient');
        setError(error);
        throw error;
      }
    },
    [patientService, store]
  );

  // Search patients
  const searchPatients = useCallback(
    async (query: string): Promise<Patient[]> => {
      setError(null);

      try {
        const patients = await patientService.searchPatients(query);
        // Cache results
        patients.forEach((patient) => store.addPatient(patient));
        return patients;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to search patients');
        setError(error);
        throw error;
      }
    },
    [patientService, store]
  );

  // Add phenotypes
  const addPhenotypes = useCallback(
    async (patientId: string, hpoTerms: string[]): Promise<Patient> => {
      setError(null);

      try {
        const patient = await patientService.addPhenotypes(patientId, hpoTerms);
        store.updatePatient(patientId, patient);
        return patient;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add phenotypes');
        setError(error);
        throw error;
      }
    },
    [patientService, store]
  );

  // Remove phenotypes
  const removePhenotypes = useCallback(
    async (patientId: string, hpoTerms: string[]): Promise<Patient> => {
      setError(null);

      try {
        const patient = await patientService.removePhenotypes(patientId, hpoTerms);
        store.updatePatient(patientId, patient);
        return patient;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to remove phenotypes');
        setError(error);
        throw error;
      }
    },
    [patientService, store]
  );

  // Get patients from store
  const patients = Array.from(storeState.patients.values());

  return {
    patients,
    isLoading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    addPhenotypes,
    removePhenotypes,
  };
}
