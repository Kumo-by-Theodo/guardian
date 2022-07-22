import {
  GetQueueAttributesCommand,
  GetQueueAttributesCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { ARN } from '@aws-sdk/util-arn-parser';
import { Resource } from '../types';
import { filterSQSFromResources } from './filterLambdaFromResources';
export const filterSQSFromResources = (resources: Resource[]): Resource[] =>
  resources.filter(({ arn }) => arn.service === 'sqs');

type QueueAttributes = {
  arn: ARN;
  attributes: GetQueueAttributesCommandOutput;
};
export const fetchQueueAttributesByArn = async (
  arn: ARN,
  client: SQSClient,
): Promise<QueueAttributes> => {
  const queueUrl = `https://sqs.{$arn.region}.amazonaws.com/{$arn.accountId}/{$arn.resource}`;

  return {
    arn: arn,

    attributes: await client.send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ['RedrivePolicy'],
      }),
    ),
  };
};

export const fetchAllQueuesAttributes = async (
  resources: Resource[],
): Promise<QueueAttributes[]> => {
  const sqsClient = new SQSClient({});

  const queues = filterSQSFromResources(resources);
  const AttributesByArn = await Promise.all(
    queues.map(({ arn }) => fetchQueueAttributesByArn(arn, sqsClient)),
  );
  console.log(AttributesByArn);

  return AttributesByArn;
};
