import { ARN } from '@aws-sdk/util-arn-parser';
import { fetchAllLambdaVersions } from '../../helpers';
import {
  CheckResult,
  ErrorMessages,
  Rule,
  RuleDisplayNames,
} from '../../types';

const MAX_AMOUNT_OF_VERSIONS = 3 + 1; // +$latest

const run = async (resources: ARN[]): Promise<{ results: CheckResult[] }> => {
  const lambdaVersions = await fetchAllLambdaVersions(resources);

  const results = lambdaVersions.map(({ arn, versions }) => ({
    arn,
    success: versions.length <= MAX_AMOUNT_OF_VERSIONS,
    versionAmount: versions.length,
  }));

  return { results };
};

export default {
  ruleName: RuleDisplayNames.LIMITED_AMOUNT_OF_LAMBDA_VERSIONS,
  errorMessage: ErrorMessages.LIMITED_AMOUNT_OF_LAMBDA_VERSIONS,
  run,
} as Rule;
