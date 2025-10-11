declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          text: string,
          options?: {
            model?: string;
            stream?: boolean;
          }
        ) => Promise<ReadableStream<string> | string>;
      };
    };
  }
}

export {};
