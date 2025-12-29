declare module 'igv' {
  export interface IGVBrowser {
    search(locus: string): Promise<void>;
    loadTrack(config: TrackConfig): Promise<void>;
    removeTrackByName(name: string): void;
    toSVG(): string;
    dispose(): void;
  }

  export interface TrackConfig {
    type: string;
    format?: string;
    url?: string;
    indexURL?: string;
    name?: string;
    height?: number;
    [key: string]: any;
  }

  export interface IGVOptions {
    genome?: string;
    locus?: string;
    tracks?: TrackConfig[];
    reference?: {
      id: string;
      fastaURL: string;
      indexURL?: string;
      cytobandURL?: string;
    };
    [key: string]: any;
  }

  export function createBrowser(
    container: HTMLElement,
    options: IGVOptions
  ): Promise<IGVBrowser>;

  export function removeBrowser(browser: IGVBrowser): void;

  export function removeAllBrowsers(): void;
}
