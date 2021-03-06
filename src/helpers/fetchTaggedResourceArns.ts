import {
  paginateGetResources,
  ResourceGroupsTaggingAPIClient,
  ResourceTagMapping,
} from '@aws-sdk/client-resource-groups-tagging-api';
import { ARN, parse } from '@aws-sdk/util-arn-parser';
import { Tag } from '../types';

export const fetchTaggedResourceArns = async (tags: Tag[]): Promise<ARN[]> => {
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

  return taggedResources.map(resource => parse(resource.ResourceARN as string));
};
