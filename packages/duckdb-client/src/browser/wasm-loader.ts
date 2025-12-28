/**
 * WASM Loader for Browser Environment
 */

import * as duckdb from '@duckdb/duckdb-wasm';
import type { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import { WASMInitError } from '../types/errors.js';

/**
 * WASM loader configuration
 */
export interface WASMLoaderConfig {
  /** Memory limit in bytes */
  memoryLimit?: number;

  /** Enable IndexedDB persistence */
  enablePersistence?: boolean;

  /** Database name for IndexedDB */
  databaseName?: string;

  /** Custom bundle URLs */
  bundleUrls?: {
    mainModule?: string;
    mainWorker?: string;
    pthreadWorker?: string;
  };
}

/**
 * WASM loader for initializing DuckDB in browser
 */
export class WASMLoader {
  private db: AsyncDuckDB | null = null;
  private worker: Worker | null = null;
  private readonly config: WASMLoaderConfig;

  constructor(config: WASMLoaderConfig = {}) {
    this.config = {
      memoryLimit: 512 * 1024 * 1024, // 512MB default
      enablePersistence: false,
      databaseName: 'duckdb',
      ...config,
    };
  }

  /**
   * Initialize DuckDB WASM
   */
  async initialize(): Promise<AsyncDuckDB> {
    if (this.db) {
      return this.db;
    }

    try {
      // Get bundles
      const bundle = await this.selectBundle();

      // Create worker
      this.worker = new Worker(bundle.mainWorker!);

      // Create logger
      const logger = new duckdb.ConsoleLogger();

      // Create database instance
      this.db = new duckdb.AsyncDuckDB(logger, this.worker);

      // Instantiate
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);

      // Open database
      await this.db.open({
        query: {
          castBigIntToDouble: true,
        },
      });

      return this.db;
    } catch (error) {
      throw new WASMInitError(
        `Failed to initialize DuckDB WASM: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get the database instance
   */
  getDatabase(): AsyncDuckDB | null {
    return this.db;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.db !== null;
  }

  /**
   * Dispose resources
   */
  async dispose(): Promise<void> {
    if (this.db) {
      await this.db.terminate();
      this.db = null;
    }

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Select the best bundle for the current environment
   */
  private async selectBundle(): Promise<duckdb.DuckDBBundle> {
    // Use custom URLs if provided
    if (this.config.bundleUrls?.mainModule && this.config.bundleUrls?.mainWorker) {
      return {
        mainModule: this.config.bundleUrls.mainModule,
        mainWorker: this.config.bundleUrls.mainWorker,
        pthreadWorker: this.config.bundleUrls.pthreadWorker ?? null,
      };
    }

    // Use CDN bundles
    const bundles = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(bundles);

    if (!bundle.mainWorker) {
      throw new WASMInitError('No suitable DuckDB bundle found for this browser');
    }

    return bundle;
  }
}

/**
 * Create a WASM loader
 */
export function createWASMLoader(config?: WASMLoaderConfig): WASMLoader {
  return new WASMLoader(config);
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Check if WebAssembly is supported
 */
export function isWASMSupported(): boolean {
  try {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );
      if (module instanceof WebAssembly.Module) {
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
      }
    }
  } catch {
    // WebAssembly not supported
  }
  return false;
}

/**
 * Check if SharedArrayBuffer is supported (needed for multi-threading)
 */
export function isSharedArrayBufferSupported(): boolean {
  try {
    return typeof SharedArrayBuffer !== 'undefined';
  } catch {
    return false;
  }
}
