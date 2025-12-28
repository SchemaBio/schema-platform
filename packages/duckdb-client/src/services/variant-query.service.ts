/**
 * Variant Query Service
 */

import type { DuckDBClient } from '../client/duckdb-client.js';
import { QueryBuilder } from '../query/query-builder.js';
import type {
  Variant,
  RegionQueryParams,
  GeneQueryParams,
  VariantQueryParams,
} from '../types/variant.js';
import type { QueryResult, PaginatedResult } from '../types/query.js';

/**
 * Service for querying variant data
 */
export class VariantQueryService {
  private readonly client: DuckDBClient;
  private readonly tableName: string;

  constructor(client: DuckDBClient, tableName = 'variants') {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * Query variants by genomic region
   */
  async queryByRegion(params: RegionQueryParams): Promise<QueryResult<Variant>> {
    const builder = new QueryBuilder<Variant>(this.client, this.tableName)
      .where('chromosome', '=', params.chromosome)
      .and('position', '>=', params.start)
      .and('position', '<=', params.end);

    if (params.sampleIds && params.sampleIds.length > 0) {
      builder.whereIn('sampleId', params.sampleIds);
    }

    return builder.execute();
  }

  /**
   * Query variants by gene
   */
  async queryByGene(params: GeneQueryParams): Promise<QueryResult<Variant>> {
    const builder = new QueryBuilder<Variant>(this.client, this.tableName);

    if (params.geneSymbol) {
      builder.where('gene', '=', params.geneSymbol);
    } else if (params.ensemblId) {
      builder.where('ensemblGeneId', '=', params.ensemblId);
    } else {
      throw new Error('Either geneSymbol or ensemblId must be provided');
    }

    if (params.sampleIds && params.sampleIds.length > 0) {
      builder.whereIn('sampleId', params.sampleIds);
    }

    return builder.execute();
  }

  /**
   * Query variants with combined filters
   */
  async queryVariants(params: VariantQueryParams): Promise<PaginatedResult<Variant>> {
    const builder = this.buildVariantQuery(params);

    // Apply sorting
    if (params.sortBy) {
      builder.orderBy(params.sortBy, params.sortDirection ?? 'asc');
    } else {
      builder.orderBy('chromosome', 'asc').orderBy('position', 'asc');
    }

    // Apply pagination
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;

    return builder.paginate(page, pageSize);
  }

  /**
   * Count variants matching criteria
   */
  async countVariants(params: VariantQueryParams): Promise<number> {
    const builder = this.buildVariantQuery(params);
    return builder.getCount();
  }

  /**
   * Get distinct values for a field
   */
  async getDistinctValues(field: keyof Variant): Promise<unknown[]> {
    const result = await this.client.execute<Record<string, unknown>>(
      `SELECT DISTINCT "${String(field)}" FROM "${this.tableName}" ORDER BY "${String(field)}"`
    );
    return result.rows.map((row) => row[String(field)]);
  }

  /**
   * Build a variant query with filters
   */
  private buildVariantQuery(params: VariantQueryParams): QueryBuilder<Variant> {
    const builder = new QueryBuilder<Variant>(this.client, this.tableName);

    // Region filter
    if (params.region) {
      builder
        .where('chromosome', '=', params.region.chromosome)
        .and('position', '>=', params.region.start)
        .and('position', '<=', params.region.end);
    }

    // Gene filter
    if (params.gene) {
      if (params.gene.geneSymbol) {
        builder.where('gene', '=', params.gene.geneSymbol);
      } else if (params.gene.ensemblId) {
        builder.where('ensemblGeneId', '=', params.gene.ensemblId);
      }
    }

    // Variant type filter
    if (params.variantTypes && params.variantTypes.length > 0) {
      builder.whereIn('variantType', params.variantTypes);
    }

    // Clinical significance filter
    if (params.clinicalSignificance && params.clinicalSignificance.length > 0) {
      builder.whereIn('clinicalSignificance', params.clinicalSignificance);
    }

    // Population frequency filter
    if (params.maxPopulationFrequency !== undefined) {
      builder.where('populationFrequency', '<=', params.maxPopulationFrequency);
    }
    if (params.minPopulationFrequency !== undefined) {
      builder.where('populationFrequency', '>=', params.minPopulationFrequency);
    }

    // CADD score filter
    if (params.minCaddScore !== undefined) {
      builder.where('caddScore', '>=', params.minCaddScore);
    }
    if (params.maxCaddScore !== undefined) {
      builder.where('caddScore', '<=', params.maxCaddScore);
    }

    // REVEL score filter
    if (params.minRevelScore !== undefined) {
      builder.where('revelScore', '>=', params.minRevelScore);
    }
    if (params.maxRevelScore !== undefined) {
      builder.where('revelScore', '<=', params.maxRevelScore);
    }

    // Quality filter
    if (params.minQuality !== undefined) {
      builder.where('quality', '>=', params.minQuality);
    }

    // Depth filter
    if (params.minDepth !== undefined) {
      builder.where('depth', '>=', params.minDepth);
    }

    // Sample filter
    if (params.sampleIds && params.sampleIds.length > 0) {
      builder.whereIn('sampleId', params.sampleIds);
    }

    // Genotype filter
    if (params.genotypes && params.genotypes.length > 0) {
      builder.whereIn('genotype', params.genotypes);
    }

    // Consequence filter
    if (params.consequences && params.consequences.length > 0) {
      builder.whereIn('consequence', params.consequences);
    }

    return builder;
  }
}
