export type UiV2View =
  | 'shell'
  | 'dashboard'
  | 'packing'
  | 'bodega'
  | 'transito'
  | 'sales-core'
  | 'dispatch-core';

export interface UiFlags {
  shellV2: boolean;
  views: Partial<Record<UiV2View, boolean>>;
}

const STORAGE_KEY = 'ui.v2.flags';

const VIEW_KEYS: UiV2View[] = [
  'shell',
  'dashboard',
  'packing',
  'bodega',
  'transito',
  'sales-core',
  'dispatch-core',
];

const DEFAULT_FLAGS: UiFlags = {
  shellV2: false,
  views: {},
};

const parseBool = (value: string | undefined): boolean => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
};

const normalizeViewToken = (token: string): UiV2View | null => {
  const normalized = token.trim().toLowerCase();
  const aliasMap: Record<string, UiV2View> = {
    shell: 'shell',
    dashboard: 'dashboard',
    packing: 'packing',
    bodega: 'bodega',
    transito: 'transito',
    transit: 'transito',
    'sales-core': 'sales-core',
    sales: 'sales-core',
    dispatch: 'dispatch-core',
    'dispatch-core': 'dispatch-core',
  };

  return aliasMap[normalized] ?? null;
};

const parseViewsFromEnv = (rawValue: string | undefined): UiFlags['views'] => {
  if (!rawValue) return {};

  const entries = rawValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (entries.includes('all')) {
    return VIEW_KEYS.reduce<UiFlags['views']>((acc, key) => {
      if (key !== 'shell') acc[key] = true;
      return acc;
    }, {});
  }

  return entries.reduce<UiFlags['views']>((acc, token) => {
    const key = normalizeViewToken(token);
    if (key) {
      acc[key] = true;
    }
    return acc;
  }, {});
};

const parseViewsFromObject = (
  rawViews: unknown
): Partial<Record<UiV2View, boolean>> => {
  if (!rawViews || typeof rawViews !== 'object') return {};

  return Object.entries(rawViews as Record<string, unknown>).reduce<
    Partial<Record<UiV2View, boolean>>
  >((acc, [key, value]) => {
    const normalized = normalizeViewToken(key);
    if (normalized && typeof value === 'boolean') {
      acc[normalized] = value;
    }
    return acc;
  }, {});
};

const readLocalOverride = (): Partial<UiFlags> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as {
      shellV2?: unknown;
      views?: unknown;
    };

    return {
      shellV2: typeof parsed.shellV2 === 'boolean' ? parsed.shellV2 : undefined,
      views: parseViewsFromObject(parsed.views),
    };
  } catch (error) {
    console.warn('uiFlags: invalid localStorage override', error);
    return {};
  }
};

export const getUiFlags = (): UiFlags => {
  const envFlags: UiFlags = {
    shellV2: parseBool(import.meta.env.VITE_UI_V2_SHELL),
    views: parseViewsFromEnv(import.meta.env.VITE_UI_V2_VIEWS),
  };

  const localOverride = readLocalOverride();

  return {
    shellV2: localOverride.shellV2 ?? envFlags.shellV2 ?? DEFAULT_FLAGS.shellV2,
    views: {
      ...envFlags.views,
      ...localOverride.views,
    },
  };
};

export const isViewV2 = (view: UiV2View): boolean => {
  const flags = getUiFlags();
  return Boolean(flags.views[view]);
};

export const getViewFromPath = (pathname: string): UiV2View | null => {
  if (pathname === '/' || pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/packing/')) return 'packing';
  if (pathname.startsWith('/bodega/')) return 'bodega';
  if (pathname.startsWith('/transito/')) return 'transito';

  if (
    pathname === '/sales/new' ||
    pathname === '/sales/createCustomer' ||
    pathname === '/sales/orders' ||
    pathname === '/sales/confirmed' ||
    pathname === '/sales/customers'
  ) {
    return 'sales-core';
  }

  if (pathname.startsWith('/dispatch/')) return 'dispatch-core';

  return null;
};

export const isPathV2Enabled = (pathname: string): boolean => {
  const view = getViewFromPath(pathname);
  return view ? isViewV2(view) : false;
};
