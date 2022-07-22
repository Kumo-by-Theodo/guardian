import {
  FunctionConfiguration,
  GetFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';

import { ARN, build } from '@aws-sdk/util-arn-parser';
import { lambdaClient } from '../clients';
import { filterLambdaFromResources } from './filterLambdaFromResources';

const fetchLambdaConfigurationByArn = async (
  arn: ARN,
): Promise<FunctionConfiguration> =>
  await lambdaClient.send(
    new GetFunctionConfigurationCommand({ FunctionName: build(arn) }),
  );

export const fetchAllLambdaConfigurations = async (
  resources: ARN[],
): Promise<FunctionConfiguration[]> => {
  const lambdas = filterLambdaFromResources(resources);
  const lambdaConfigurations = await Promise.all(
    lambdas.map(arn => fetchLambdaConfigurationByArn(arn)),
  );

  return lambdaConfigurations;
};
