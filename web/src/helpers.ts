import { formatRelative } from 'date-fns';
import { filesize } from 'filesize';
import React from 'react';

const debounceTimers: Record<string, any> = {};

export function debounce(key: string, fn: () => void) {
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }

  debounceTimers[key] = setTimeout(() => {
    delete debounceTimers[key];
    fn();
  }, 2000);
}

export function tryParse(data: string | null | undefined, fallback?: any): any {
  if (!data) {
    return fallback;
  }

  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

export const firstUpperCase = (str: string) =>
  str.charAt(0).toUpperCase() + str.substring(1);
export const dateFormatter = (dateString: string) =>
  firstUpperCase(formatRelative(new Date(dateString), new Date()));

export function formatFileSize(size: number): string {
  return filesize(size, { pad: true, precision: 3 }) as string;
}

export const stopPropagation = (e: React.BaseSyntheticEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export const preventDefault = (e: React.BaseSyntheticEvent) => {
  e.stopPropagation();
};

export const isTouchScreen = () => navigator.maxTouchPoints > 1;

export class EventEmitter<TListener = () => void> {
  private events: Map<string, Set<TListener>> = new Map();

  on(eventName: string, listener: TListener) {
    if (!this.events.get(eventName)) {
      this.events.set(eventName, new Set([listener]));
    } else {
      this.events.get(eventName)!.add(listener);
    }
  }

  off(eventName: string, listener: TListener) {
    this.events.get(eventName)?.delete(listener);
  }

  emit(eventName: string, ...args: any[]) {
    this.events
      .get(eventName)
      ?.forEach(listener => (listener as Function).apply(this, args));
  }
}
