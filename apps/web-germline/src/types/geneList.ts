// 基因列表分类
export type GeneListCategory = 'core' | 'important' | 'optional';

// 基因列表
export interface GeneList {
  id: string;
  name: string;
  description?: string;
  genes: string[];
  geneCount: number;
  category?: GeneListCategory;
  diseaseCategory?: string;
  createdAt: string;
  updatedAt: string;
}

// 创建基因列表请求
export interface GeneListCreateRequest {
  name: string;
  description?: string;
  genes: string[];
  category?: GeneListCategory;
  diseaseCategory?: string;
}

// 更新基因列表请求
export interface GeneListUpdateRequest {
  name?: string;
  description?: string;
  genes?: string[];
  category?: GeneListCategory;
  diseaseCategory?: string;
}
