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
    resource,
  };
};

const getSQSResourceArn = (
  region: string,
  accountId: string,
  resource: string,
): ARN => {
  return {
    partition: 'aws',
    service: 'sqs',
    region,
    accountId,
    resource,
  };
};

export const getSupportedResourceArn = (
  {
    ResourceType,
    PhysicalResourceId,
  }: {
    ResourceType: string;
    PhysicalResourceId: string;
  },
  region: string,
  account: string,
): ARN[] => {
  const resourceARN = [];
  switch (ResourceType) {
    case 'AWS::Lambda::Function':
      resourceARN.push(
        getLambdaResourceArn(region, account, PhysicalResourceId),
      );
      break;
    case 'AWS::S3::Bucket':
      resourceARN.push(getS3ResourceArn(region, account, PhysicalResourceId));
      break;
    case 'AWS::SQS::Queue':
      resourceARN.push(getSQSResourceArn(region, account, PhysicalResourceId));
      break;
  }

  return resourceARN;
};
