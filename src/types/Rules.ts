import { AWS_HISTORICAL_MAX_MEMORY } from '../constants';
export enum Rules {
  NO_DEFAULT_MEMORY = 'NO_DEFAULT_MEMORY',
  LIGHT_BUNDLE = 'LIGHT_BUNDLE',
  LIMITED_NUMBER_OF_LAMBDA_VERSIONS = 'LIMITED_NUMBER_OF_LAMBDA_VERSIONS',
  NO_MAX_TIMEOUT = 'NO_MAX_TIMEOUT',
  NO_SHARED_IAM_ROLES = 'NO_SHARED_IAM_ROLES',
  USE_ARM_ARCHITECTURE = 'USE_ARM_ARCHITECTURE',
  UNDER_MAX_MEMORY = 'UNDER_MAX_MEMORY',
  NO_IDENTICAL_CODE = 'NO_IDENTICAL_CODE',
  INTELLIGENT_TIERING = 'INTELLIGENT_TIERING',
  ASYNC_SPECIFY_FAILURE_DESTINATION = 'ASYNC_NO_FAILURE_DESTINATION',
  SPECIFY_DLQ_ON_SQS = 'SPECIFY_DLQ_ON_SQS',
}

export const RuleDisplayNames = {
  [Rules.NO_DEFAULT_MEMORY]: 'No default memory',
  [Rules.LIGHT_BUNDLE]: 'Light Bundle',
  [Rules.LIMITED_NUMBER_OF_LAMBDA_VERSIONS]:
    'Limited Number of Lambda Versions',
  [Rules.NO_MAX_TIMEOUT]: 'No max timeout',
  [Rules.NO_SHARED_IAM_ROLES]: 'No shared IAM roles',
  [Rules.USE_ARM_ARCHITECTURE]: 'Using an ARM Architecture',
  [Rules.UNDER_MAX_MEMORY]: 'Memory under maximum memory limit',
  [Rules.USE_ARM_ARCHITECTURE]: 'Not using Arm Architecture',
  [Rules.NO_IDENTICAL_CODE]: 'No identical code',
  [Rules.INTELLIGENT_TIERING]: 'Use Intelligent Tiering',
  [Rules.ASYNC_SPECIFY_FAILURE_DESTINATION]:
    'Async Lambdas: specify a failure destination',
  [Rules.SPECIFY_DLQ_ON_SQS]: 'Specifying a DLQ on SQS',
} as const;

export const ErrorMessages = {
  [Rules.NO_DEFAULT_MEMORY]:
    'The following functions have their memory set as default.',
  [Rules.LIGHT_BUNDLE]:
    'The following functions have bundles that weight more than 5 Mb.\nSee (https://m33.notion.site/Serverless-Sustainability-Audit-a36847289fd64339a60e40bc5aa63092) for impact.',
  [Rules.LIMITED_NUMBER_OF_LAMBDA_VERSIONS]:
    'The following functions have a number of deployed versions greater than 3',
  [Rules.NO_MAX_TIMEOUT]:
    'The following functions have their timeout set as the maximum.\nSee (https://theodo-uk.github.io/sls-dev-tools/docs/no-max-timeout) for impact and how to to resolve.',
  [Rules.NO_SHARED_IAM_ROLES]:
    'The following functions have roles used by 1 or more other functions.\nSee (https://theodo-uk.github.io/sls-dev-tools/docs/no-shared-roles) for impact and how to to resolve.',
  [Rules.USE_ARM_ARCHITECTURE]:
    "The function's architecture is not set as ARM. See (https://github.com/Kumo-by-Theodo/guardian/blob/master/src/rules/useArm/useArm.md) for impact and how to to resolve.",
  [Rules.UNDER_MAX_MEMORY]: `The function's memory is set to the historical maximum limit of ${AWS_HISTORICAL_MAX_MEMORY} MB or higher. See (https://github.com/Kumo-by-Theodo/guardian/blob/master/src/rules/underMaxMemory/underMaxMemory.md) for impact and how to to resolve.`,
  [Rules.NO_IDENTICAL_CODE]:
    "The function's code is identical to other functions. See (https://github.com/Kumo-by-Theodo/guardian/blob/master/src/rules/noIdenticalCode/noIdenticalCode.md) for impact and how to to resolve.",
  [Rules.INTELLIGENT_TIERING]:
    'Intelligent Tiering is not enabled on this S3 bucket. See (https://github.com/Kumo-by-Theodo/guardian/blob/master/src/rules/useIntelligentTiering/useIntelligentTiering.md) for impact and how to to resolve.',
  [Rules.ASYNC_SPECIFY_FAILURE_DESTINATION]:
    'The function is asynchronous but has no failure destination set. See (https://github.com/Kumo-by-Theodo/guardian/blob/master/src/rules/asyncSpecifyFailureDestination/asyncSpecifyFailureDestination.md) for impact and how to to resolve.',
  [Rules.SPECIFY_DLQ_ON_SQS]:
    'The queue does not have a specified Dead Letter Queue. See (https://github.com/Kumo-by-Theodo/guardian/blob/master/src/rules/specifyDlqOnSqs/specifyDlqOnSqs.md)',
} as const;
