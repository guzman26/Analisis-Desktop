import { PalletAuditResult } from '@/types';

interface RawAuditSection {
  count?: number;
  boxes?: string[];
}

interface RawAuditResponse {
  accuracy?: number;
  isAccurate?: boolean;
  missing?: RawAuditSection;
  extra?: RawAuditSection;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as { error?: { message?: unknown } }).error?.message ===
      'string'
  ) {
    return (error as { error: { message: string } }).error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Error del servidor durante la auditoria';
}

export function mapAuditResponseToPalletAuditResult(
  apiResponse: RawAuditResponse | PalletAuditResult
): PalletAuditResult {
  if (
    typeof apiResponse === 'object' &&
    apiResponse !== null &&
    'summary' in apiResponse &&
    'issues' in apiResponse
  ) {
    return apiResponse as PalletAuditResult;
  }

  const rawAccuracy = Number(apiResponse?.accuracy ?? 0);
  const accuracy = Number.isFinite(rawAccuracy) ? Math.max(0, rawAccuracy) : 0;
  const score = Math.round(accuracy * 100);

  const missingCount = Number(apiResponse?.missing?.count ?? 0);
  const extraCount = Number(apiResponse?.extra?.count ?? 0);

  const issues: PalletAuditResult['issues'] = [];

  if (missingCount > 0) {
    issues.push({
      type: 'UNDERUTILIZED',
      severity: missingCount > 5 ? 'CRITICAL' : 'WARNING',
      message: `Faltan ${missingCount} caja${missingCount !== 1 ? 's' : ''} en el pallet`,
      details: {
        count: missingCount,
        boxes: apiResponse?.missing?.boxes ?? [],
      },
    });
  }

  if (extraCount > 0) {
    issues.push({
      type: 'OVERFILLED',
      severity: extraCount > 5 ? 'CRITICAL' : 'WARNING',
      message: `Hay ${extraCount} caja${extraCount !== 1 ? 's' : ''} extra en el pallet`,
      details: {
        count: extraCount,
        boxes: apiResponse?.extra?.boxes ?? [],
      },
    });
  }

  let grade: PalletAuditResult['grade'];
  if (score >= 95) {
    grade = 'EXCELLENT';
  } else if (score >= 80) {
    grade = 'GOOD';
  } else if (score >= 60) {
    grade = 'WARNING';
  } else {
    grade = 'CRITICAL';
  }

  return {
    passed: Boolean(apiResponse?.isAccurate),
    grade,
    score,
    summary: {
      capacityPassed: missingCount === 0 && extraCount === 0,
      uniquenessPassed: extraCount === 0,
      sequencePassed: true,
      totalIssues: issues.length,
      criticalIssues: issues.filter((issue) => issue.severity === 'CRITICAL')
        .length,
      warningIssues: issues.filter((issue) => issue.severity === 'WARNING')
        .length,
    },
    issues,
  };
}

export function mapAuditErrorToPalletAuditResult(
  error: unknown,
  palletCode: string
): PalletAuditResult {
  return {
    passed: false,
    grade: 'CRITICAL',
    score: 0,
    summary: {
      capacityPassed: false,
      uniquenessPassed: false,
      sequencePassed: false,
      totalIssues: 1,
      criticalIssues: 1,
      warningIssues: 0,
    },
    issues: [
      {
        type: 'AUDIT_ERROR',
        severity: 'CRITICAL',
        message: getErrorMessage(error),
        details: {
          errorType: 'API_ERROR',
          palletCode,
        },
      },
    ],
  };
}
