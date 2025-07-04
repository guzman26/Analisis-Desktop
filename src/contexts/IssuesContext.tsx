import React, { createContext, ReactNode } from 'react';
import { Issue, GetIssuesParamsPaginated } from '@/types';
import { getIssues } from '@/api/endpoints';
import usePagination from '@/hooks/usePagination';
import { extractDataFromResponse } from '@/utils/extractDataFromResponse';

interface PaginatedIssuesData {
  data: Issue[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

interface IssuesContextType {
  adminIssuesPaginated: PaginatedIssuesData;
}

export const IssuesContext = createContext<IssuesContextType>(
  {} as IssuesContextType
);

interface Props {
  children: ReactNode;
}

export const IssuesProvider: React.FC<Props> = ({ children }) => {
  const issuesPaginatedHook = usePagination<Issue>({
    fetchFunction: async (params: GetIssuesParamsPaginated) => {
      const response = await getIssues(params);
      const issues = extractDataFromResponse(response);
      return issues;
    },
  });

  const value: IssuesContextType = {
    adminIssuesPaginated: {
      data: issuesPaginatedHook.data,
      loading: issuesPaginatedHook.loading,
      error: issuesPaginatedHook.error,
      hasMore: issuesPaginatedHook.hasMore,
      loadMore: issuesPaginatedHook.loadMore,
      refresh: () => issuesPaginatedHook.refresh({}),
    },
  };

  return (
    <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>
  );
};
