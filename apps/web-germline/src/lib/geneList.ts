import { api } from './api';
import type {
  GeneList,
  GeneListCreateRequest,
  GeneListUpdateRequest,
} from '@/types/geneList';
import type { PaginatedResponse, QueryParams } from '@/types/common';

interface BackendPaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface BackendGeneList {
  id: string;
  name: string;
  description?: string;
  genes: string[];
  gene_count: number;
  category?: string;
  disease_category?: string;
  created_at: string;
  updated_at: string;
}

function mapGeneList(g: BackendGeneList): GeneList {
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    genes: g.genes,
    geneCount: g.gene_count,
    category: g.category as GeneList['category'],
    diseaseCategory: g.disease_category,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
  };
}

function mapPaginated<T, U>(data: BackendPaginatedData<T>, mapper: (item: T) => U): PaginatedResponse<U> {
  return {
    items: data.items.map(mapper),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
  };
}

export const geneListApi = {
  list: async (params?: QueryParams): Promise<PaginatedResponse<GeneList>> => {
    const data = await api.get<BackendPaginatedData<BackendGeneList>>('/v1/gene-lists', {
      params: params as Record<string, string>,
    });
    return mapPaginated(data, mapGeneList);
  },

  get: async (id: string): Promise<GeneList> => {
    const data = await api.get<BackendGeneList>(`/v1/gene-lists/${id}`);
    return mapGeneList(data);
  },

  create: async (data: GeneListCreateRequest): Promise<GeneList> => {
    const payload = {
      ...data,
      disease_category: data.diseaseCategory,
    };
    delete (payload as any).diseaseCategory;
    const result = await api.post<BackendGeneList>('/v1/gene-lists', payload);
    return mapGeneList(result);
  },

  update: async (id: string, data: GeneListUpdateRequest): Promise<GeneList> => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.genes !== undefined) payload.genes = data.genes;
    if (data.category !== undefined) payload.category = data.category;
    if (data.diseaseCategory !== undefined) payload.disease_category = data.diseaseCategory;
    const result = await api.put<BackendGeneList>(`/v1/gene-lists/${id}`, payload);
    return mapGeneList(result);
  },

  delete: (id: string) => api.delete(`/v1/gene-lists/${id}`),
};
