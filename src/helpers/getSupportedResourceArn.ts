import { StackResourceSummary } from '@aws-sdk/client-cloudformation';
import { ARN } from '@aws-sdk/util-arn-parser';

const getS3ResourceArn = (
  region: string,
  accountId: string,
  resource: string,
): ARN => {
  return {
    partition: 'aws',
    service: 's3',
    region,
    accountId,
    resource,
  };
};

const getLambdaResourceArn = (
  region: string,
  accountId: string,
  resource: string,
): ARN => {
  return {
    partition: 'aws',
    service: 'lambda',
    region,
    accountId,
    resource: `function:${resource}`,
  };
};

export const getSupportedResourceArn = (
  { ResourceType, PhysicalResourceId }: StackResourceSummary,
  region: string,
  account: string | undefined,
): ARN[] => {
  const resourceARN = [];

  if (ResourceType === 'AWS::Lambda::Function') {
    resourceARN.push(
      getLambdaResourceArn(region, account ?? '', PhysicalResourceId ?? ''),
    );
  }

  if (ResourceType === 'AWS::S3::Bucket') {
    resourceARN.push(
      getS3ResourceArn(region, account ?? '', PhysicalResourceId ?? ''),
    );
  }

  return resourceARN;
};
