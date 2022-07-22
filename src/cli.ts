#!/usr/bin/env node
import { Command, InvalidArgumentError, program } from 'commander';

import { runGuardianChecks } from './index';
import {
  displayChecksStarting,
  displayFailedChecksDetails,
  displayResultsSummary,
} from './display';
import { Options, Tag } from './types/CliOptions';

const hasKeyAndValue = (
  groups: Record<string, string> | undefined,
): groups is Tag => {
  // ts-config is loosely assuming all keys exist, type guard to be updated when Typescript config is updated
  return groups !== undefined;
};

const parseTags = (
  tagOption: string,
  previousTags: Tag[] | undefined,
): Tag[] => {
  const [{ groups: tag }] = [
    ...tagOption.matchAll(
      /^Key=(?<key>[\p{L}\p{Z}\p{N}_.:/=+\-@]*),Value=(?<value>[\p{L}\p{Z}\p{N}_.:/=+\-@]*)$/gu,
    ),
  ];
  if (!hasKeyAndValue(tag)) {
    throw new InvalidArgumentError('Invalid flag parameters');
  }

  if (!previousTags) {
    return [tag];
  }

  return [...previousTags, tag];
};

export const handleGuardianChecksCommand = async (
  options: Options,
): Promise<void> => {
  displayChecksStarting();
  const results = await runGuardianChecks(options);
  displayResultsSummary(results);

  const atLeastOneFailed = results.some(
    ({ result }) => result.filter(resource => !resource.success).length > 0,
  );

  if (!options.short && atLeastOneFailed) {
    displayFailedChecksDetails(results);
  }
  const processExit = !options.noFail && atLeastOneFailed ? 1 : 0;
  process.exit(processExit);
};

const setAwsProfile = (command: Command): void => {
  const awsProfile = command.opts<Options>().awsProfile;
  if (awsProfile !== undefined) {
    process.env.AWS_PROFILE = awsProfile;
  }
};

const setAwsRegion = (command: Command): void => {
  const awsRegion = command.opts<Options>().awsRegion;
  if (awsRegion !== undefined) {
    process.env.AWS_REGION = awsRegion;
  }
};

program
  .name('guardian')
  .version(process.env.npm_package_version ?? '0.0.0')
  .option(
    '-s, --short',
    'Short output: only display checks results overview',
    false,
  )
  .option('-p, --aws-profile <profile>', 'AWS profile to use')
  .option('-r, --aws-region <region>', 'Specify region')
  .option(
    '-t, --tags <key_value...>',
    'Filter checked account resources by tags',
    parseTags,
  )
  .option(
    '-c, --cloudformations [cloudformations...]',
    'Filter checked account resources by cloudformation stacks names',
  )
  .option(
    '--noFail',
    'Exit with success status, even if some checks failed',
    false,
  )
  .action(handleGuardianChecksCommand)
  .hook('preAction', setAwsProfile)
  .hook('preAction', setAwsRegion)
  .parse();
