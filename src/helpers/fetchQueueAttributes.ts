import {
  GetQueueAttributesCommand,
  GetQueueAttributesCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { ARN } from '@aws-sdk/util-arn-parser';
import { filterSQSFromResources } from './filterSQSFromResources';

type QueueAttributes = {
  arn: ARN;
  attributes: GetQueueAttributesCommandOutput;
};
export const fetchQueueAttributesByArn = async (
  arn: ARN,
  client: SQSClient,
): Promise<QueueAttributes> => {
  return {
    arn: arn,
    attributes: await client.send(
      new GetQueueAttributesCommand({
        QueueUrl: arn.resource,
        AttributeNames: ['RedrivePolicy'],
      }),
    ),
  };
};

export const fetchAllQueuesAttributes = async (
  resourceArns: ARN[],
): Promise<QueueAttributes[]> => {
  const sqsClient = new SQSClient({});

  const queues = filterSQSFromResources(resourceArns);

  const AttributesByArn = await Promise.all(
    queues.map(arn => fetchQueueAttributesByArn(arn, sqsClient)),
  );

  return AttributesByArn;
};
