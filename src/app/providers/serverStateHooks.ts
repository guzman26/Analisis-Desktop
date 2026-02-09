import { useServerStateContext } from './serverStateContext';

export const useServerScopeVersion = (scope: string): number => {
  const { versions } = useServerStateContext();
  return versions[scope] ?? 0;
};

export const useInvalidateServerScope = () => {
  const { invalidateScope } = useServerStateContext();
  return invalidateScope;
};
