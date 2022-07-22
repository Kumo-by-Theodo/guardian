import intersectionWith from 'lodash/intersectionWith';
import { displayProgress } from './display';
import {
  fetchCloudFormationResourceArns,
  fetchTaggedResourceArns,
} from './helpers';
import {
  AsyncSpecifyFailureDestination,
  LightBundleRule,
  LimitedAmountOfLambdaVersions,
  noDefaultMemory,
  NoIdenticalCode,
  NoMaxTimeout,
  NoSharedIamRoles,
  UnderMaxMemory,
  UseArm,
  UseIntelligentTiering,
} from './rules';
import { ChecksResults, Options, Rule, Tag } from './types';

const fetchResourceArns = async (
  cloudformations: string[] | undefined,
  tags: Tag[] | undefined,
) => {
  const resourcesFetchedByTags = await fetchTaggedResourceArns(tags ?? []);

  if (cloudformations === undefined) {
    return resourcesFetchedByTags;
  }

  const resourcesFetchedByStack = await fetchCloudFormationResourceArns(
    cloudformations,
  );

  const resources = intersectionWith(
    resourcesFetchedByStack,
    resourcesFetchedByTags,
    (arnA, arnB) =>
      arnA.resource === arnB.resource && arnA.service === arnB.service,
  );

  return resources;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const runGuardianChecks = async ({
  cloudformations,
  tags,
}: Options): Promise<ChecksResults> => {
  const resourceArns = await fetchResourceArns(cloudformations, tags);
  const rules: Rule[] = [
    LightBundleRule,
    NoIdenticalCode,
    noDefaultMemory,
    NoMaxTimeout,
    NoSharedIamRoles,
    UseArm,
    UseIntelligentTiering,
    LimitedAmountOfLambdaVersions,
    UnderMaxMemory,
    AsyncSpecifyFailureDestination,
  ];

  let remaining = rules.length + 1;

  const decreaseRemaining = () => {
    remaining -= 1;
    const rate = (rules.length - remaining) / rules.length;
    displayProgress(rate);
  };

  decreaseRemaining();

  return await Promise.all(
    rules.map(async rule => {
      const ruleResult = (await rule.run(resourceArns)).results;
      decreaseRemaining();

      return { rule, result: ruleResult };
    }),
  );
};
