import {
  GetFunctionEventInvokeConfigCommand,
  GetFunctionEventInvokeConfigCommandOutput,
} from '@aws-sdk/client-lambda';
import { ARN, build } from '@aws-sdk/util-arn-parser';
import { lambdaClient } from '../clients';
import { filterLambdaFromResources } from './filterLambdaFromResources';

const fetchLambdaInvokeEventConfigByArn = async (
  arn: ARN,
): Promise<GetFunctionEventInvokeConfigCommandOutput | undefined> => {
  try {
    return await lambdaClient.send(
      new GetFunctionEventInvokeConfigCommand({ FunctionName: build(arn) }),
    );
  } catch (e) {
    return;
  }
};

export const fetchAllLambdaInvokeEventConfigs = async (
  resourceArns: ARN[],
): Promise<
  {
    arn: string;
    config: GetFunctionEventInvokeConfigCommandOutput | undefined;
  }[]
> => {
  const lambdas = filterLambdaFromResources(resourceArns);

  return await Promise.all(
    lambdas.map(async arn => ({
      arn: build(arn),
      config: await fetchLambdaInvokeEventConfigByArn(arn),
    })),
  );
};
