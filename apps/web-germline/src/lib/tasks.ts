import { api } from './api';
import type {
  AnalysisTask,
  TaskListResponse,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskProgressResponse,
} from '@/types/task';

export const tasksApi = {
  /** List tasks with optional filters */
  list(params?: {
    status?: string;
    sampleId?: string;
    page?: number;
    page_size?: number;
  }): Promise<TaskListResponse> {
    const searchParams: Record<string, string> = {};
    if (params?.status) searchParams.status = params.status;
    if (params?.sampleId) searchParams.sampleId = params.sampleId;
    if (params?.page) searchParams.page = String(params.page);
    if (params?.page_size) searchParams.page_size = String(params.page_size);
    return api.get<TaskListResponse>('/v1/tasks', { params: searchParams });
  },

  /** Create a new task */
  create(data: TaskCreateRequest): Promise<AnalysisTask> {
    return api.post<AnalysisTask>('/v1/tasks', data);
  },

  /** Get a single task by UUID */
  get(id: string): Promise<AnalysisTask> {
    return api.get<AnalysisTask>(`/v1/tasks/${id}`);
  },

  /** Update a task */
  update(id: string, data: TaskUpdateRequest): Promise<AnalysisTask> {
    return api.put<AnalysisTask>(`/v1/tasks/${id}`, data);
  },

  /** Start a task */
  start(id: string): Promise<AnalysisTask> {
    return api.post<AnalysisTask>(`/v1/tasks/${id}/start`);
  },

  /** Cancel/delete a task */
  cancel(id: string): Promise<void> {
    return api.delete<void>(`/v1/tasks/${id}`);
  },

  /** Get task progress (with Sepiida data) */
  getProgress(id: string): Promise<TaskProgressResponse> {
    return api.get<TaskProgressResponse>(`/v1/tasks/${id}/progress`);
  },
};
