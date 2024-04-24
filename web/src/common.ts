import { KredsClient } from '@kreds/client';

export const isKredsEnabled = true;

export const kreds = new KredsClient({
  url: new URL('/kreds/', window.location.href),
  prefix: 'tidepad_',
});
