import type { Sample, Patient } from '@schema/types';
import type { SampleFilters, SampleWithRelations } from '../types.js';

/**
 * Filter samples based on filter criteria
 * @param samples - Array of samples to filter
 * @param filters - Filter criteria
 * @param patients - Optional map of patients for patient name search
 * @returns Filtered array of samples
 */
export function filterSamples(
  samples: Sample[],
  filters: SampleFilters,
  patients?: Map<string, Patient>
): Sample[] {
  return samples.filter((sample) => {
    // Filter by sample type
    if (filters.sampleType && sample.sampleType !== filters.sampleType) {
      return false;
    }

    // Filter by status
    if (filters.status && sample.status !== filters.status) {
      return false;
    }

    // Filter by batch ID
    if (filters.batchId && sample.batchId !== filters.batchId) {
      return false;
    }

    // Filter by created date range
    if (filters.createdAfter) {
      const createdAt = new Date(sample.createdAt);
      const afterDate = new Date(filters.createdAfter);
      if (createdAt < afterDate) {
        return false;
      }
    }

    if (filters.createdBefore) {
      const createdAt = new Date(sample.createdAt);
      const beforeDate = new Date(filters.createdBefore);
      if (createdAt > beforeDate) {
        return false;
      }
    }

    // Filter by search query
    if (filters.search && filters.search.trim().length > 0) {
      const query = filters.search.toLowerCase().trim();
      const matchesSampleName = sample.name.toLowerCase().includes(query);
      
      // Check patient name if patients map is provided
      let matchesPatientName = false;
      if (patients) {
        const patient = patients.get(sample.patientId);
        if (patient) {
          matchesPatientName = patient.name.toLowerCase().includes(query);
        }
      }

      if (!matchesSampleName && !matchesPatientName) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Search samples by query string
 * @param samples - Array of samples to search
 * @param query - Search query
 * @param patients - Optional map of patients for patient name search
 * @returns Matching samples
 */
export function searchSamples(
  samples: Sample[],
  query: string,
  patients?: Map<string, Patient>
): Sample[] {
  if (!query || query.trim().length === 0) {
    return samples;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return samples.filter((sample) => {
    // Match sample name
    if (sample.name.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Match patient name if patients map is provided
    if (patients) {
      const patient = patients.get(sample.patientId);
      if (patient && patient.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort samples by a field
 * @param samples - Array of samples to sort
 * @param field - Field to sort by
 * @param direction - Sort direction
 * @returns Sorted array of samples
 */
export function sortSamples<T extends Sample>(
  samples: T[],
  field: keyof T | string,
  direction: SortDirection = 'asc'
): T[] {
  const sorted = [...samples].sort((a, b) => {
    const aValue = getNestedValue(a as unknown as Record<string, unknown>, field as string);
    const bValue = getNestedValue(b as unknown as Record<string, unknown>, field as string);

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;

    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      // Convert to string for comparison
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Get nested value from object using dot notation
 * @param obj - Object to get value from
 * @param path - Dot-separated path
 * @returns Value at path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Filter samples with relations
 * @param samples - Array of samples with relations
 * @param filters - Filter criteria
 * @returns Filtered samples
 */
export function filterSamplesWithRelations(
  samples: SampleWithRelations[],
  filters: SampleFilters
): SampleWithRelations[] {
  return samples.filter((sample) => {
    // Filter by sample type
    if (filters.sampleType && sample.sampleType !== filters.sampleType) {
      return false;
    }

    // Filter by status
    if (filters.status && sample.status !== filters.status) {
      return false;
    }

    // Filter by batch ID
    if (filters.batchId && sample.batchId !== filters.batchId) {
      return false;
    }

    // Filter by created date range
    if (filters.createdAfter) {
      const createdAt = new Date(sample.createdAt);
      const afterDate = new Date(filters.createdAfter);
      if (createdAt < afterDate) {
        return false;
      }
    }

    if (filters.createdBefore) {
      const createdAt = new Date(sample.createdAt);
      const beforeDate = new Date(filters.createdBefore);
      if (createdAt > beforeDate) {
        return false;
      }
    }

    // Filter by search query
    if (filters.search && filters.search.trim().length > 0) {
      const query = filters.search.toLowerCase().trim();
      const matchesSampleName = sample.name.toLowerCase().includes(query);
      const matchesPatientName = sample.patient?.name.toLowerCase().includes(query) ?? false;

      if (!matchesSampleName && !matchesPatientName) {
        return false;
      }
    }

    return true;
  });
}
