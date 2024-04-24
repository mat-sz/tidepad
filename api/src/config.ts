import fs from 'fs/promises';

export interface Config {
  kreds: {
    redirectUrl: string;
    strategies: any[];
  };
  tidepad: {
    useProxy: boolean;
    publicUrls: {
      attachments: string;
      thumbnails: string;
    };
    limits: {
      files: {
        // Size in bytes.
        size: number;
        count: number;
      };
    };
  };
}

export const config: Config = JSON.parse(
  await fs.readFile('../data/.config.json', 'utf-8')
);
