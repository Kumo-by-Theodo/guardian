import { ARN, build } from '@aws-sdk/util-arn-parser';
import { fetchAllQueuesAttributes } from '../../helpers';
import {
  CheckResult,
  ErrorMessages,
  Rule,
  RuleDisplayNames,
} from '../../types';

const getArnFromRedrivePolicy = (redrivePolicy: string): string => {
  return redrivePolicy.split(',')[0].split('\\')[3];
};

const hasExistingDeadLetterQueue = (
  redrivePolicy: string | undefined,
  deadLetterQueuesArn: string[],
): boolean => {
  if (
    redrivePolicy === undefined ||
    deadLetterQueuesArn.includes(getArnFromRedrivePolicy(redrivePolicy))
  ) {
    return false;
  }

  return true;
};

const run = async (
  resourceArns: ARN[],
): Promise<{
  results: CheckResult[];
}> => {
  const queuesAttributesByArn = await fetchAllQueuesAttributes(resourceArns);
  const deadLetterQueuesArn: string[] = [];
  queuesAttributesByArn.forEach(queue => {
    const redrivePolicy = queue.attributes.Attributes?.RedrivePolicy;
    if (redrivePolicy !== undefined) {
      const deadLetterTargetArn = JSON.parse(redrivePolicy).deadLetterTargetArn;
      deadLetterQueuesArn.push(deadLetterTargetArn);
    }
  });

  const results = queuesAttributesByArn
    .filter(queue => !deadLetterQueuesArn.includes(build(queue.arn)))
    .map(queue => ({
      arn: build(queue.arn),
      success: hasExistingDeadLetterQueue(
        queue.attributes.Attributes?.RedrivePolicy,
        deadLetterQueuesArn,
      ),
    }));

  return { results };
};

export default {
  ruleName: RuleDisplayNames.SPECIFY_DLQ_ON_SQS,
  errorMessage: ErrorMessages.SPECIFY_DLQ_ON_SQS,
  run,
} as Rule;
