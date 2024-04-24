import { kreds } from '../common';

type PathType = string | string[];
type QueryType = Record<string, string | number | boolean | undefined>;

const BASE_URL = new URL('/api/v1/', window.location.href);

function buildFormData(data: any) {
  const formData = new FormData();

  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) {
      for (const item of data[key]) {
        formData.append(key, item);
      }
    } else {
      formData.append(key, data[key]);
    }
  }

  return formData;
}

export const http = async <TReturn>(
  method: string,
  path: PathType,
  options: {
    data?: any;
    query?: QueryType;
  } = {}
): Promise<TReturn> => {
  const { data, query } = options;

  const isMultipart =
    typeof data === 'object' &&
    Object.keys(data).some(
      key =>
        data[key] instanceof File ||
        (Array.isArray(data[key]) && data[key][0] instanceof File)
    );

  const contentTypeHeader: any =
    data && !isMultipart ? { 'content-type': 'application/json' } : {};
  const body =
    data && isMultipart
      ? buildFormData(data)
      : data
      ? JSON.stringify(data)
      : undefined;

  let transformedPath = '';
  if (Array.isArray(path)) {
    transformedPath = path[0];
    for (let i = 1; i < path.length; i++) {
      transformedPath = transformedPath.replace(`:${i}`, path[i]);
    }
  } else {
    transformedPath = path;
  }

  const url = new URL(transformedPath, BASE_URL);
  if (query) {
    for (const key of Object.keys(query)) {
      const value = query[key];
      if (typeof value === 'undefined' || value === null) {
        continue;
      }

      url.searchParams.append(key, `${value}`);
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      ...kreds?.getRequestHeaders(),
      ...contentTypeHeader,
    },
    body,
  });

  return await res.json();
};

export const httpGet = <TReturn>(
  path: PathType,
  query?: QueryType
): Promise<TReturn> => http('GET', path, { query });

export const httpPost = <TReturn, TData>(
  path: PathType,
  data: TData,
  query?: QueryType
): Promise<TReturn> => http('POST', path, { data, query });

export const httpPatch = <TReturn, TData>(
  path: PathType,
  data: TData,
  query?: QueryType
): Promise<TReturn> => http('PATCH', path, { data, query });

export const httpDelete = <TReturn>(
  path: PathType,
  query?: QueryType
): Promise<TReturn> => http('DELETE', path, { query });

export * from './types';
