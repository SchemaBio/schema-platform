/**
 * Statistics Service for DuckDB
 */

import type { DuckDBClient } from '../client/duckdb-client.js';
import type {
  VariantStatistics,
  NumericStats,
  StatisticsParams,
  HistogramParams,
  HistogramResult,
  HistogramBin,
  CompareParams,
  ComparisonResult,
  GroupStats,
  OverlapAnalysis,
  FieldComparison,
  CrossTabParams,
  CrossTabResult,
} from '../types/statistics.js';
import { VariantType, ClinicalSignificance } from '../types/variant.js';

/**
 * Service for computing statistics on variant data
 */
export class StatisticsService {
  private readonly client: DuckDBClient;
  private readonly tableName: string;

  constructor(client: DuckDBClient, tableName = 'variants') {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * Get variant statistics
   */
  async getStatistics(params: StatisticsParams = {}): Promise<VariantStatistics> {
    const whereClause = this.buildWhereClause(params as Partial<StatisticsParams> & Record<string, unknown>);

    // Get total count
    const countResult = await this.client.execute<{ count: number }>(
      `SELECT COUNT(*) as count FROM "${this.tableName}" ${whereClause}`
    );
    const totalCount = countResult.rows[0]?.count ?? 0;

    // Get counts by type
    const byType = await this.getCountsByField('variantType', whereClause);

    // Get counts by chromosome
    const byChromosome = await this.getCountsByField('chromosome', whereClause);

    // Get counts by clinical significance
    const byClinicalSignificance = await this.getCountsByField('clinicalSignificance', whereClause);

    // Get frequency stats
    const frequencyStats = await this.getNumericStats('populationFrequency', whereClause);

    const result: VariantStatistics = {
      totalCount,
      byType: this.mapToVariantType(byType),
      byChromosome,
      byClinicalSignificance: this.mapToClinicalSignificance(byClinicalSignificance),
      frequencyStats,
    };

    // Optional stats
    if (params.includeQualityStats) {
      result.qualityStats = await this.getNumericStats('quality', whereClause);
    }

    if (params.includeDepthStats) {
      result.depthStats = await this.getNumericStats('depth', whereClause);
    }

    if (params.includeScoreStats) {
      result.caddStats = await this.getNumericStats('caddScore', whereClause);
      result.revelStats = await this.getNumericStats('revelScore', whereClause);
    }

    return result;
  }

  /**
   * Get histogram for a numeric field
   */
  async getHistogram(params: HistogramParams): Promise<HistogramResult> {
    const { field, bins = 20, sampleIds, filters } = params;
    const whereClause = this.buildWhereClause({ sampleIds, ...filters });

    // Get min/max
    const rangeResult = await this.client.execute<{ min: number; max: number; count: number }>(
      `SELECT MIN("${field}") as min, MAX("${field}") as max, COUNT(*) as count 
       FROM "${this.tableName}" ${whereClause} AND "${field}" IS NOT NULL`
    );

    const range = rangeResult.rows[0];
    if (!range || range.count === 0) {
      return {
        bins: [],
        min: 0,
        max: 0,
        binWidth: 0,
        totalCount: 0,
        field,
      };
    }

    const min = params.min ?? range.min;
    const max = params.max ?? range.max;
    const binWidth = (max - min) / bins;

    // Generate histogram using width_bucket
    const histogramResult = await this.client.execute<{ bucket: number; count: number }>(
      `SELECT width_bucket("${field}", ${min}, ${max}, ${bins}) as bucket, COUNT(*) as count
       FROM "${this.tableName}" ${whereClause} AND "${field}" IS NOT NULL
       GROUP BY bucket ORDER BY bucket`
    );

    const histogramBins: HistogramBin[] = [];
    let totalCount = 0;

    // Initialize all bins
    for (let i = 0; i < bins; i++) {
      histogramBins.push({
        start: min + i * binWidth,
        end: min + (i + 1) * binWidth,
        count: 0,
        percentage: 0,
      });
    }

    // Fill in counts
    for (const row of histogramResult.rows) {
      const bucketIndex = row.bucket - 1; // width_bucket is 1-indexed
      if (bucketIndex >= 0 && bucketIndex < bins) {
        histogramBins[bucketIndex].count = row.count;
        totalCount += row.count;
      }
    }

    // Calculate percentages
    for (const bin of histogramBins) {
      bin.percentage = totalCount > 0 ? (bin.count / totalCount) * 100 : 0;
    }

    return {
      bins: histogramBins,
      min,
      max,
      binWidth,
      totalCount,
      field,
    };
  }

  /**
   * Compare variants between two groups
   */
  async compareGroups(params: CompareParams): Promise<ComparisonResult> {
    const { group1, group2, group1Label = 'Group 1', group2Label = 'Group 2' } = params;

    // Get group statistics
    const group1Stats = await this.getGroupStats(group1, group1Label);
    const group2Stats = await this.getGroupStats(group2, group2Label);

    // Get overlap analysis if requested
    let overlap: OverlapAnalysis | undefined;
    if (params.includeOverlap) {
      overlap = await this.getOverlapAnalysis(group1, group2);
    }

    // Get field comparisons
    const compareFields = params.compareFields ?? ['populationFrequency', 'caddScore', 'quality'];
    const fieldComparisons: FieldComparison[] = [];

    for (const field of compareFields) {
      const comparison = await this.compareField(field, group1, group2);
      if (comparison) {
        fieldComparisons.push(comparison);
      }
    }

    return {
      group1Stats,
      group2Stats,
      overlap,
      fieldComparisons,
    };
  }

  /**
   * Get cross-tabulation
   */
  async getCrossTab(params: CrossTabParams): Promise<CrossTabResult> {
    const { rowField, columnField, sampleIds, includeTotals = true } = params;
    const whereClause = this.buildWhereClause({ sampleIds });

    // Get distinct values for rows and columns
    const rowLabels = await this.getDistinctValues(rowField, whereClause);
    const columnLabels = await this.getDistinctValues(columnField, whereClause);

    // Get counts
    const result = await this.client.execute<Record<string, unknown>>(
      `SELECT "${rowField}" as row_val, "${columnField}" as col_val, COUNT(*) as count
       FROM "${this.tableName}" ${whereClause}
       GROUP BY "${rowField}", "${columnField}"`
    );

    // Build data matrix
    const data: number[][] = [];
    const countMap = new Map<string, number>();

    for (const row of result.rows) {
      const key = `${row.row_val}|${row.col_val}`;
      countMap.set(key, Number(row.count));
    }

    for (const rowLabel of rowLabels) {
      const rowData: number[] = [];
      for (const colLabel of columnLabels) {
        const key = `${rowLabel}|${colLabel}`;
        rowData.push(countMap.get(key) ?? 0);
      }
      data.push(rowData);
    }

    // Calculate totals
    let rowTotals: number[] | undefined;
    let columnTotals: number[] | undefined;
    let grandTotal = 0;

    if (includeTotals) {
      rowTotals = data.map((row) => row.reduce((a, b) => a + b, 0));
      columnTotals = columnLabels.map((_, colIndex) =>
        data.reduce((sum, row) => sum + row[colIndex], 0)
      );
      grandTotal = rowTotals.reduce((a, b) => a + b, 0);
    }

    return {
      rowLabels,
      columnLabels,
      data,
      rowTotals,
      columnTotals,
      grandTotal,
    };
  }

  /**
   * Get counts by field
   */
  private async getCountsByField(
    field: string,
    whereClause: string
  ): Promise<Record<string, number>> {
    const result = await this.client.execute<{ value: string; count: number }>(
      `SELECT "${field}" as value, COUNT(*) as count 
       FROM "${this.tableName}" ${whereClause} 
       GROUP BY "${field}"`
    );

    const counts: Record<string, number> = {};
    for (const row of result.rows) {
      if (row.value !== null) {
        counts[row.value] = row.count;
      }
    }
    return counts;
  }

  /**
   * Get numeric statistics for a field
   */
  private async getNumericStats(field: string, whereClause: string): Promise<NumericStats> {
    const result = await this.client.execute<{
      min: number;
      max: number;
      avg: number;
      median: number;
      stddev: number;
      count: number;
      null_count: number;
    }>(
      `SELECT 
         MIN("${field}") as min,
         MAX("${field}") as max,
         AVG("${field}") as avg,
         MEDIAN("${field}") as median,
         STDDEV("${field}") as stddev,
         COUNT("${field}") as count,
         SUM(CASE WHEN "${field}" IS NULL THEN 1 ELSE 0 END) as null_count
       FROM "${this.tableName}" ${whereClause}`
    );

    const row = result.rows[0];
    return {
      min: row?.min ?? 0,
      max: row?.max ?? 0,
      mean: row?.avg ?? 0,
      median: row?.median ?? 0,
      stddev: row?.stddev ?? 0,
      count: row?.count ?? 0,
      nullCount: row?.null_count ?? 0,
    };
  }

  /**
   * Get group statistics
   */
  private async getGroupStats(sampleIds: string[], label: string): Promise<GroupStats> {
    const whereClause = `WHERE "sampleId" IN (${sampleIds.map((id) => `'${id}'`).join(', ')})`;

    const countResult = await this.client.execute<{ total: number; unique: number }>(
      `SELECT COUNT(*) as total, COUNT(DISTINCT id) as unique 
       FROM "${this.tableName}" ${whereClause}`
    );

    const typeDistribution = await this.getCountsByField('variantType', whereClause);

    return {
      label,
      sampleIds,
      totalVariants: countResult.rows[0]?.total ?? 0,
      uniqueVariants: countResult.rows[0]?.unique ?? 0,
      avgVariantsPerSample:
        sampleIds.length > 0 ? (countResult.rows[0]?.total ?? 0) / sampleIds.length : 0,
      typeDistribution: this.mapToVariantType(typeDistribution),
    };
  }

  /**
   * Get overlap analysis between two groups
   */
  private async getOverlapAnalysis(
    group1: string[],
    group2: string[]
  ): Promise<OverlapAnalysis> {
    const g1Ids = group1.map((id) => `'${id}'`).join(', ');
    const g2Ids = group2.map((id) => `'${id}'`).join(', ');

    // Get variant IDs for each group
    const result = await this.client.execute<{
      group1_only: number;
      group2_only: number;
      shared: number;
    }>(
      `WITH 
         g1_variants AS (SELECT DISTINCT id FROM "${this.tableName}" WHERE "sampleId" IN (${g1Ids})),
         g2_variants AS (SELECT DISTINCT id FROM "${this.tableName}" WHERE "sampleId" IN (${g2Ids}))
       SELECT
         (SELECT COUNT(*) FROM g1_variants WHERE id NOT IN (SELECT id FROM g2_variants)) as group1_only,
         (SELECT COUNT(*) FROM g2_variants WHERE id NOT IN (SELECT id FROM g1_variants)) as group2_only,
         (SELECT COUNT(*) FROM g1_variants WHERE id IN (SELECT id FROM g2_variants)) as shared`
    );

    const row = result.rows[0];
    const group1Only = row?.group1_only ?? 0;
    const group2Only = row?.group2_only ?? 0;
    const shared = row?.shared ?? 0;
    const totalUnique = group1Only + group2Only + shared;

    return {
      group1Only,
      group2Only,
      shared,
      jaccardIndex: totalUnique > 0 ? shared / totalUnique : 0,
      overlapPercentage: totalUnique > 0 ? (shared / totalUnique) * 100 : 0,
    };
  }

  /**
   * Compare a field between two groups
   */
  private async compareField(
    field: string,
    group1: string[],
    group2: string[]
  ): Promise<FieldComparison | null> {
    const g1Where = `WHERE "sampleId" IN (${group1.map((id) => `'${id}'`).join(', ')})`;
    const g2Where = `WHERE "sampleId" IN (${group2.map((id) => `'${id}'`).join(', ')})`;

    const g1Stats = await this.getNumericStats(field, g1Where);
    const g2Stats = await this.getNumericStats(field, g2Where);

    return {
      field,
      group1: g1Stats,
      group2: g2Stats,
      meanDifference: g1Stats.mean - g2Stats.mean,
    };
  }

  /**
   * Get distinct values for a field
   */
  private async getDistinctValues(field: string, whereClause: string): Promise<string[]> {
    const result = await this.client.execute<{ value: string }>(
      `SELECT DISTINCT "${field}" as value FROM "${this.tableName}" ${whereClause} ORDER BY "${field}"`
    );
    return result.rows.map((row) => String(row.value));
  }

  /**
   * Build WHERE clause from params
   */
  private buildWhereClause(params: Partial<StatisticsParams> & Record<string, unknown>): string {
    const conditions: string[] = ['1=1'];

    if (params.sampleIds && params.sampleIds.length > 0) {
      conditions.push(`"sampleId" IN (${params.sampleIds.map((id) => `'${id}'`).join(', ')})`);
    }

    if (params.variantTypes && params.variantTypes.length > 0) {
      conditions.push(`"variantType" IN (${params.variantTypes.map((t) => `'${t}'`).join(', ')})`);
    }

    if (params.chromosomes && params.chromosomes.length > 0) {
      conditions.push(`"chromosome" IN (${params.chromosomes.map((c) => `'${c}'`).join(', ')})`);
    }

    return `WHERE ${conditions.join(' AND ')}`;
  }

  /**
   * Map counts to VariantType record
   */
  private mapToVariantType(counts: Record<string, number>): Record<VariantType, number> {
    const result: Record<VariantType, number> = {
      [VariantType.SNV]: 0,
      [VariantType.INSERTION]: 0,
      [VariantType.DELETION]: 0,
      [VariantType.INDEL]: 0,
      [VariantType.CNV]: 0,
      [VariantType.SV]: 0,
    };

    for (const [key, value] of Object.entries(counts)) {
      if (key in VariantType) {
        result[key as VariantType] = value;
      }
    }

    return result;
  }

  /**
   * Map counts to ClinicalSignificance record
   */
  private mapToClinicalSignificance(
    counts: Record<string, number>
  ): Record<ClinicalSignificance, number> {
    const result: Record<ClinicalSignificance, number> = {
      [ClinicalSignificance.PATHOGENIC]: 0,
      [ClinicalSignificance.LIKELY_PATHOGENIC]: 0,
      [ClinicalSignificance.UNCERTAIN]: 0,
      [ClinicalSignificance.LIKELY_BENIGN]: 0,
      [ClinicalSignificance.BENIGN]: 0,
    };

    for (const [key, value] of Object.entries(counts)) {
      if (key in ClinicalSignificance) {
        result[key as ClinicalSignificance] = value;
      }
    }

    return result;
  }
}
