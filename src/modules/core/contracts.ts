import { ComponentType, LazyExoticComponent } from 'react';
import type { UiV2View } from '@/config/uiFlags';

export interface ModuleRouteMeta {
  title: string;
  section: string;
  breadcrumb: string[];
  featureFlag?: UiV2View;
}

export interface ModuleRoute {
  path: string;
  component: LazyExoticComponent<ComponentType<{}>>;
  meta: ModuleRouteMeta;
  standalone?: boolean;
}

export interface ModuleQueryKeyFactory {
  all: readonly unknown[];
  lists: () => readonly unknown[];
  list: (filters?: unknown) => readonly unknown[];
  details: () => readonly unknown[];
  detail: (id: string) => readonly unknown[];
}

export interface ModuleApiAdapter<TDto, TDomain, TInput = Partial<TDomain>> {
  fromDto: (dto: TDto) => TDomain;
  toDto?: (input: TInput) => unknown;
}
