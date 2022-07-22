import { ARN } from '@aws-sdk/util-arn-parser';

export const filterSQSFromResources = (resourceArns: ARN[]): ARN[] =>
  resourceArns.filter(({ service }) => service === 'sqs');
