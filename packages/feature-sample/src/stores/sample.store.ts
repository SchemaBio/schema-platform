import type { Sample, Batch, Patient } from '@schema/types';

/**
 * Sample state
 */
export interface SampleState {
  /** Cached samples by ID */
  samples: Map<string, Sample>;
  /** Cached batches by ID */
  batches: Map<string, Batch>;
  /** Cached patients by ID */
  patients: Map<string, Patient>;

  /** Sample list state */
  sampleList: {
    /** Sample IDs in current list */
    ids: string[];
    /** Total count */
    total: number;
    /** Current page */
    page: number;
    /** Page size */
    pageSize: number;
  };

  /** Loading states */
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  /** Error state */
  error: Error | null;

  /** Selected sample IDs */
  selectedIds: Set<string>;
}

/**
 * State listener callback
 */
export type SampleStateListener = (state: SampleState) => void;

/**
 * Sample store interface
 */
export interface SampleStore {
  /** Get current state */
  getState(): SampleState;

  // Sample actions
  /** Set samples from API response */
  setSamples(samples: Sample[], total: number, page: number, pageSize: number): void;
  /** Add a single sample */
  addSample(sample: Sample): void;
  /** Update a sample */
  updateSample(id: string, sample: Partial<Sample>): void;
  /** Remove a sample */
  removeSample(id: string): void;
  /** Get a sample by ID */
  getSample(id: string): Sample | undefined;

  // Batch actions
  /** Set batches */
  setBatches(batches: Batch[]): void;
  /** Add a batch */
  addBatch(batch: Batch): void;
  /** Update a batch */
  updateBatch(id: string, batch: Partial<Batch>): void;
  /** Remove a batch */
  removeBatch(id: string): void;
  /** Get a batch by ID */
  getBatch(id: string): Batch | undefined;

  // Patient actions
  /** Set patients */
  setPatients(patients: Patient[]): void;
  /** Add a patient */
  addPatient(patient: Patient): void;
  /** Update a patient */
  updatePatient(id: string, patient: Partial<Patient>): void;
  /** Remove a patient */
  removePatient(id: string): void;
  /** Get a patient by ID */
  getPatient(id: string): Patient | undefined;

  // Selection actions
  /** Select a sample */
  selectSample(id: string): void;
  /** Deselect a sample */
  deselectSample(id: string): void;
  /** Select all samples in current list */
  selectAll(): void;
  /** Deselect all samples */
  deselectAll(): void;
  /** Check if a sample is selected */
  isSelected(id: string): boolean;

  // Loading/Error actions
  /** Set loading state */
  setLoading(isLoading: boolean): void;
  /** Set creating state */
  setCreating(isCreating: boolean): void;
  /** Set updating state */
  setUpdating(isUpdating: boolean): void;
  /** Set deleting state */
  setDeleting(isDeleting: boolean): void;
  /** Set error */
  setError(error: Error | null): void;

  // Optimistic update support
  /** Create a snapshot for rollback */
  createSnapshot(): SampleState;
  /** Restore from snapshot */
  restoreSnapshot(snapshot: SampleState): void;

  // Subscription
  /** Subscribe to state changes */
  subscribe(listener: SampleStateListener): () => void;
}

/**
 * Create initial state
 */
function createInitialState(): SampleState {
  return {
    samples: new Map(),
    batches: new Map(),
    patients: new Map(),
    sampleList: {
      ids: [],
      total: 0,
      page: 1,
      pageSize: 20,
    },
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    selectedIds: new Set(),
  };
}

/**
 * Clone state for snapshot
 */
function cloneState(state: SampleState): SampleState {
  return {
    samples: new Map(state.samples),
    batches: new Map(state.batches),
    patients: new Map(state.patients),
    sampleList: { ...state.sampleList },
    isLoading: state.isLoading,
    isCreating: state.isCreating,
    isUpdating: state.isUpdating,
    isDeleting: state.isDeleting,
    error: state.error,
    selectedIds: new Set(state.selectedIds),
  };
}

/**
 * Create a sample store instance
 */
export function createSampleStore(): SampleStore {
  let state: SampleState = createInitialState();
  const listeners = new Set<SampleStateListener>();

  /**
   * Notify all listeners
   */
  function notifyListeners(): void {
    listeners.forEach((listener) => listener(state));
  }

  /**
   * Update state and notify
   */
  function setState(newState: Partial<SampleState>): void {
    state = { ...state, ...newState };
    notifyListeners();
  }

  // Sample actions
  function setSamples(
    samples: Sample[],
    total: number,
    page: number,
    pageSize: number
  ): void {
    const samplesMap = new Map(state.samples);
    const ids: string[] = [];

    samples.forEach((sample) => {
      samplesMap.set(sample.id, sample);
      ids.push(sample.id);
    });

    setState({
      samples: samplesMap,
      sampleList: { ids, total, page, pageSize },
    });
  }

  function addSample(sample: Sample): void {
    const samples = new Map(state.samples);
    samples.set(sample.id, sample);
    setState({ samples });
  }

  function updateSample(id: string, updates: Partial<Sample>): void {
    const existing = state.samples.get(id);
    if (!existing) return;

    const samples = new Map(state.samples);
    samples.set(id, { ...existing, ...updates });
    setState({ samples });
  }

  function removeSample(id: string): void {
    const samples = new Map(state.samples);
    samples.delete(id);

    const selectedIds = new Set(state.selectedIds);
    selectedIds.delete(id);

    const ids = state.sampleList.ids.filter((sampleId) => sampleId !== id);

    setState({
      samples,
      selectedIds,
      sampleList: {
        ...state.sampleList,
        ids,
        total: Math.max(0, state.sampleList.total - 1),
      },
    });
  }

  function getSample(id: string): Sample | undefined {
    return state.samples.get(id);
  }

  // Batch actions
  function setBatches(batches: Batch[]): void {
    const batchesMap = new Map<string, Batch>();
    batches.forEach((batch) => {
      batchesMap.set(batch.id, batch);
    });
    setState({ batches: batchesMap });
  }

  function addBatch(batch: Batch): void {
    const batches = new Map(state.batches);
    batches.set(batch.id, batch);
    setState({ batches });
  }

  function updateBatch(id: string, updates: Partial<Batch>): void {
    const existing = state.batches.get(id);
    if (!existing) return;

    const batches = new Map(state.batches);
    batches.set(id, { ...existing, ...updates });
    setState({ batches });
  }

  function removeBatch(id: string): void {
    const batches = new Map(state.batches);
    batches.delete(id);
    setState({ batches });
  }

  function getBatch(id: string): Batch | undefined {
    return state.batches.get(id);
  }

  // Patient actions
  function setPatients(patients: Patient[]): void {
    const patientsMap = new Map<string, Patient>();
    patients.forEach((patient) => {
      patientsMap.set(patient.id, patient);
    });
    setState({ patients: patientsMap });
  }

  function addPatient(patient: Patient): void {
    const patients = new Map(state.patients);
    patients.set(patient.id, patient);
    setState({ patients });
  }

  function updatePatient(id: string, updates: Partial<Patient>): void {
    const existing = state.patients.get(id);
    if (!existing) return;

    const patients = new Map(state.patients);
    patients.set(id, { ...existing, ...updates });
    setState({ patients });
  }

  function removePatient(id: string): void {
    const patients = new Map(state.patients);
    patients.delete(id);
    setState({ patients });
  }

  function getPatient(id: string): Patient | undefined {
    return state.patients.get(id);
  }

  // Selection actions
  function selectSample(id: string): void {
    const selectedIds = new Set(state.selectedIds);
    selectedIds.add(id);
    setState({ selectedIds });
  }

  function deselectSample(id: string): void {
    const selectedIds = new Set(state.selectedIds);
    selectedIds.delete(id);
    setState({ selectedIds });
  }

  function selectAll(): void {
    const selectedIds = new Set(state.sampleList.ids);
    setState({ selectedIds });
  }

  function deselectAll(): void {
    setState({ selectedIds: new Set() });
  }

  function isSelected(id: string): boolean {
    return state.selectedIds.has(id);
  }

  // Loading/Error actions
  function setLoading(isLoading: boolean): void {
    setState({ isLoading });
  }

  function setCreating(isCreating: boolean): void {
    setState({ isCreating });
  }

  function setUpdating(isUpdating: boolean): void {
    setState({ isUpdating });
  }

  function setDeleting(isDeleting: boolean): void {
    setState({ isDeleting });
  }

  function setError(error: Error | null): void {
    setState({ error });
  }

  // Optimistic update support
  function createSnapshot(): SampleState {
    return cloneState(state);
  }

  function restoreSnapshot(snapshot: SampleState): void {
    state = snapshot;
    notifyListeners();
  }

  // Subscription
  function subscribe(listener: SampleStateListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    getState: () => state,
    setSamples,
    addSample,
    updateSample,
    removeSample,
    getSample,
    setBatches,
    addBatch,
    updateBatch,
    removeBatch,
    getBatch,
    setPatients,
    addPatient,
    updatePatient,
    removePatient,
    getPatient,
    selectSample,
    deselectSample,
    selectAll,
    deselectAll,
    isSelected,
    setLoading,
    setCreating,
    setUpdating,
    setDeleting,
    setError,
    createSnapshot,
    restoreSnapshot,
    subscribe,
  };
}

/**
 * Singleton store instance
 */
let sampleStoreInstance: SampleStore | null = null;

/**
 * Get or create singleton store
 */
export function getSampleStore(): SampleStore {
  if (!sampleStoreInstance) {
    sampleStoreInstance = createSampleStore();
  }
  return sampleStoreInstance;
}

/**
 * Reset store (for testing)
 */
export function resetSampleStore(): void {
  sampleStoreInstance = null;
}
