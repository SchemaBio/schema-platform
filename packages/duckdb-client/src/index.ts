/**
 * @schema/duckdb-client
 *
 * DuckDB client for Schema Platform genomic data analysis.
 * Supports both browser (via DuckDB-WASM) and Node.js environments.
 */

// Types
export * from './types/index.js';

// Client
export * from './client/index.js';

// Query Builder
export * from './query/index.js';

// Data Loader
export * from './loader/index.js';

// Result Transformer
export * from './transformer/index.js';

// Services
export * from './services/index.js';

// Browser compatibility
export * from './browser/index.js';
