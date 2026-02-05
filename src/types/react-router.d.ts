// Type declarations for React Router v7
// This file resolves TypeScript module resolution issues with React Router v7

declare module 'react-router-dom' {
  export * from 'react-router';
  export { RouterProvider, HydratedRouter } from 'react-router/dom';
}

declare module 'react-router' {
  import * as React from 'react';

  // Router Components
  export const BrowserRouter: React.ComponentType<{
    children?: React.ReactNode;
    window?: Window;
  }>;

  export const Routes: React.ComponentType<{
    children?: React.ReactNode;
    location?: Partial<Location> | string;
  }>;

  export const Route: React.ComponentType<{
    path?: string;
    index?: boolean;
    element?: React.ReactNode | null;
    Component?: React.ComponentType | null;
    children?: React.ReactNode;
  }>;

  export const Link: React.ComponentType<{
    to: string | Partial<Location>;
    replace?: boolean;
    state?: any;
    children?: React.ReactNode;
    reloadDocument?: boolean;
    [key: string]: any;
  }>;

  export const NavLink: React.ComponentType<{
    to: string | Partial<Location>;
    end?: boolean;
    caseSensitive?: boolean;
    children?: React.ReactNode | ((props: { isActive: boolean; isPending: boolean }) => React.ReactNode);
    className?: string | ((props: { isActive: boolean; isPending: boolean }) => string);
    style?: React.CSSProperties | ((props: { isActive: boolean; isPending: boolean }) => React.CSSProperties);
    [key: string]: any;
  }>;

  // Hooks
  export function useNavigate(): (
    to: string | number | Partial<Location>,
    options?: { replace?: boolean; state?: any; relative?: 'route' | 'path' }
  ) => void;

  export function useParams<T extends Record<string, string | undefined> = Record<string, string>>(): T;

  export function useLocation(): Location;

  export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | Record<string, string>) => void];

  export function useMatch(pattern: string): { params: Record<string, string> } | null;

  // Types
  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: any;
    key: string;
  }
}

declare module 'react-router/dom' {
  import * as React from 'react';

  export const RouterProvider: React.ComponentType<{
    router: any;
    fallbackElement?: React.ReactNode;
    future?: any;
  }>;

  export const HydratedRouter: React.ComponentType<any>;
  export type RouterProviderProps = any;
}
