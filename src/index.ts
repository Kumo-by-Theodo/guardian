import {
  CloudFormationClient,
  paginateListStackResources,
  StackResourceSummary,
} from '@aws-sdk/client-cloudformation';
import {
  paginateGetResources,
  ResourceGroupsTaggingAPIClient,
  ResourceTagMapping,
} from '@aws-sdk/client-resource-groups-tagging-api';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';

import { parse } from '@aws-sdk/util-arn-parser';
import {
  LightBundleRule,
  LimitedNumberOfLambdaVersions,
  noDefaultMemory,
  NoDefaultTimeout,
  NoMaxTimeout,
  NoSharedIamRoles,
  UseArm,
} from './rules';
import { Options, Tag } from './cli';
import { Resource, Rule } from './types';

const fetchTaggedResources = async (tags: Tag[]): Promise<Resource[]> => {
  const tagClient = new ResourceGroupsTaggingAPIClient({});

  const taggedResources: ResourceTagMapping[] = [];
  for await (const page of paginateGetResources(
    { client: tagClient },
    {
      TagFilters: tags.map(({ key, value }) => {
        return { Key: key, Values: [value] };
      }),
    },
  )) {
    taggedResources.push(...(page.ResourceTagMappingList ?? []));
  }

  return taggedResources.map(resource => {
    return {
      arn: parse(resource.ResourceARN as string),
    };
  });
};

const fetchCloudFormationResources = async (
  cloudformation: string,
): Promise<Resource[]> => {
  const cloudFormationClient = new CloudFormationClient({});
  const stsClient = new STSClient({});

  const resources: StackResourceSummary[] = [];
  for await (const page of paginateListStackResources(
    { client: cloudFormationClient },
    { StackName: cloudformation },
  )) {
    resources.push(...(page.StackResourceSummaries ?? []));
  }
  const filteredResources = resources.filter(
    resource => resource.ResourceType === 'AWS::Lambda::Function',
  );

  const { Account } = await stsClient.send(new GetCallerIdentityCommand({}));
  const region =
    process.env.AWS_REGION ?? (await cloudFormationClient.config.region());

  return filteredResources.map(resource => {
    return {
      arn: parse(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `arn:aws:lambda:${region}:${Account}:function:${resource.PhysicalResourceId}`,
      ),
    };
  });
};

const fetchResources = async (
  cloudformation: string | undefined,
  tags: Tag[] | undefined,
) => {
  if (tags !== undefined) {
    return fetchTaggedResources(tags);
  }

  if (cloudformation !== undefined) {
    return fetchCloudFormationResources(cloudformation);
  }

  // Maybe replace with a check of all account on the specified region ?
  throw new Error('not enough argument specified');
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const runGuardianChecks = async ({
  cloudformation,
  tags,
}: Options): Promise<
  {
    rule: Rule;
    result: ({ arn: string; success: boolean } & Record<string, unknown>)[];
  }[]
> => {
  const resourcesArn = await fetchResources(cloudformation, tags);
  const rules: Rule[] = [
    LightBundleRule,
    noDefaultMemory,
    NoDefaultTimeout,
    NoMaxTimeout,
    NoSharedIamRoles,
    UseArm,
    LimitedNumberOfLambdaVersions,
  ];

  let remaining = rules.length + 1;
  const decreaseRemaining = () => {
    remaining -= 1;
    console.log(
      `${remaining} check${remaining > 1 ? 's' : ''} remaining${
        remaining > 0 ? '...' : ' !'
      }`,
    );
    if (remaining === 0) console.log('\n');
  };
  decreaseRemaining();

  return await Promise.all(
    rules.map(async rule => {
      const ruleResult = (await rule.run(resourcesArn)).results;
      decreaseRemaining();

      return { rule, result: ruleResult };
    }),
  );
};
