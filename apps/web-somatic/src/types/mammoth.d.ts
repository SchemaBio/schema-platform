declare module 'mammoth' {
  interface ConversionResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  interface ConversionOptions {
    arrayBuffer?: ArrayBuffer;
    path?: string;
    buffer?: Buffer;
  }

  function convertToHtml(options: ConversionOptions): Promise<ConversionResult>;
  
  const mammoth: {
    convertToHtml: typeof convertToHtml;
  };
  
  export = mammoth;
}
