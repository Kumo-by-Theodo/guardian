import { GetPolicyCommand } from '@aws-sdk/client-lambda';

import { ARN, build } from '@aws-sdk/util-arn-parser';
import { lambdaClient } from '../clients';
import { filterLambdaFromResources } from './filterLambdaFromResources';

// Incomplete, update if needed
export type Policy = {
  Statement?: {
    Condition?: {
      ArnLike?: {
        'AWS:SourceArn'?: string;
      };
    };
  }[];
};

const fetchLambdaPolicyByArn = async (
  arn: ARN,
): Promise<Policy | undefined> => {
  try {
    const commandOutput = await lambdaClient.send(
      new GetPolicyCommand({ FunctionName: build(arn) }),
    );
    const policy = JSON.parse(commandOutput.Policy ?? '') as Policy;

    return policy;
  } catch (e) {
    return;
  }
};
export const fetchAllLambdaPolicies = async (
  resourceArns: ARN[],
): Promise<{ arn: string; policy: Policy | undefined }[]> => {
  const lambdas = filterLambdaFromResources(resourceArns);

  return Promise.all(
    lambdas.map(async arn => ({
      arn: build(arn),
      policy: await fetchLambdaPolicyByArn(arn),
    })),
  );
};
