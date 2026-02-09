import { getIssues, updateIssueStatus } from '@/api/endpoints';
import type { GetIssuesParamsPaginated, Issue, PaginatedResponse } from '@/types';
import { toDomainErrorException } from '@/modules/core';

export const issuesApi = {
  list: async (
    params?: GetIssuesParamsPaginated
  ): Promise<PaginatedResponse<Issue>> => {
    try {
      return await getIssues(params);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  updateStatus: async (id: string, resolution: string): Promise<unknown> => {
    try {
      return await updateIssueStatus(id, resolution);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },
};
