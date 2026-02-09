export type DataV2Module = 'packing' | 'bodega' | 'transito' | 'sales';

export interface DataFlags {
  modules: Partial<Record<DataV2Module, boolean>>;
}

const STORAGE_KEY = 'data.v2.flags';

const MODULE_KEYS: DataV2Module[] = ['packing', 'bodega', 'transito', 'sales'];

const parseBool = (value: string | undefined): boolean => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
};

const normalizeModuleToken = (token: string): DataV2Module | null => {
  const normalized = token.trim().toLowerCase();

  const aliasMap: Record<string, DataV2Module> = {
    packing: 'packing',
    bodega: 'bodega',
    transito: 'transito',
    transit: 'transito',
    sales: 'sales',
    'sales-core': 'sales',
  };

  return aliasMap[normalized] ?? null;
};

const parseModulesFromObject = (
  rawModules: unknown
): Partial<Record<DataV2Module, boolean>> => {
  if (!rawModules || typeof rawModules !== 'object') return {};

  return Object.entries(rawModules as Record<string, unknown>).reduce<
    Partial<Record<DataV2Module, boolean>>
  >((acc, [key, value]) => {
    const normalized = normalizeModuleToken(key);
    if (normalized && typeof value === 'boolean') {
      acc[normalized] = value;
    }
    return acc;
  }, {});
};

const parseModulesFromEnv = (
  rawValue: string | undefined
): Partial<Record<DataV2Module, boolean>> => {
  if (!rawValue) return {};

  const entries = rawValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (entries.includes('all')) {
    return MODULE_KEYS.reduce<Partial<Record<DataV2Module, boolean>>>(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {}
    );
  }

  return entries.reduce<Partial<Record<DataV2Module, boolean>>>(
    (acc, token) => {
      const key = normalizeModuleToken(token);
      if (key) {
        acc[key] = true;
      }
      return acc;
    },
    {}
  );
};

const readLocalOverride = (): Partial<DataFlags> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as {
      modules?: unknown;
    };

    return {
      modules: parseModulesFromObject(parsed.modules),
    };
  } catch (error) {
    console.warn('dataFlags: invalid localStorage override', error);
    return {};
  }
};

const readEnvFallback = (): Partial<Record<DataV2Module, boolean>> => {
  const explicit = parseModulesFromEnv(import.meta.env.VITE_DATA_V2_MODULES);
  if (Object.keys(explicit).length > 0) {
    return explicit;
  }

  // fallback temporal: si no hay flags de datos, usar flags UI activos
  return parseModulesFromEnv(import.meta.env.VITE_UI_V2_VIEWS);
};

export const getDataFlags = (): DataFlags => {
  const envModules = readEnvFallback();
  const localOverride = readLocalOverride();

  return {
    modules: {
      ...envModules,
      ...localOverride.modules,
    },
  };
};

export const isDataV2Enabled = (module: DataV2Module): boolean => {
  const flags = getDataFlags();
  return Boolean(flags.modules[module]);
};

export const isDataV2DevtoolsEnabled = (): boolean => {
  return parseBool(import.meta.env.VITE_DATA_V2_DEVTOOLS);
};

export const getDataModuleFromPath = (pathname: string): DataV2Module | null => {
  if (pathname.startsWith('/packing/')) return 'packing';
  if (pathname.startsWith('/bodega/')) return 'bodega';
  if (pathname.startsWith('/transito/')) return 'transito';

  if (
    pathname === '/sales/new' ||
    pathname === '/sales/createCustomer' ||
    pathname === '/sales/orders' ||
    pathname === '/sales/confirmed' ||
    pathname === '/sales/customers' ||
    pathname.startsWith('/sales/print/')
  ) {
    return 'sales';
  }

  return null;
};
