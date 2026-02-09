import type { ModuleQueryKeyFactory } from './contracts';

const stableSerialize = (input: unknown): string => {
  if (!input || typeof input !== 'object') {
    return String(input ?? '');
  }

  if (Array.isArray(input)) {
    return `[${input.map((item) => stableSerialize(item)).join(',')}]`;
  }

  return `{${Object.entries(input as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${stableSerialize(value)}`)
    .join(',')}}`;
};

export const createModuleQueryKeyFactory = (
  scope: string
): ModuleQueryKeyFactory => ({
  all: [scope] as const,
  lists: () => [scope, 'list'] as const,
  list: (filters?: unknown) =>
    [scope, 'list', stableSerialize(filters ?? {})] as const,
  details: () => [scope, 'detail'] as const,
  detail: (id: string) => [scope, 'detail', id] as const,
});
