import {
  CloudFormationClient,
  paginateListStackResources,
  StackResourceSummary,
} from '@aws-sdk/client-cloudformation';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { ARN } from '@aws-sdk/util-arn-parser';
import { getSupportedResourceArn } from './getSupportedResourceArn';

export const fetchCloudFormationResourceArns = async (
  cloudformation: string,
): Promise<ARN[]> => {
  const cloudFormationClient = new CloudFormationClient({});
  const stsClient = new STSClient({});

  const resources: StackResourceSummary[] = [];
  for await (const page of paginateListStackResources(
    { client: cloudFormationClient },
    { StackName: cloudformation },
  )) {
    resources.push(...(page.StackResourceSummaries ?? []));
  }

  const { Account } = await stsClient.send(new GetCallerIdentityCommand({}));
  if (Account === undefined) {
    return [];
  }
  const region =
    process.env.AWS_REGION ?? (await cloudFormationClient.config.region());

  return resources.flatMap(({ ResourceType, PhysicalResourceId }) =>
    PhysicalResourceId !== undefined && ResourceType !== undefined
      ? getSupportedResourceArn(
          { ResourceType, PhysicalResourceId },
          region,
          Account,
        )
      : [],
  );
};
