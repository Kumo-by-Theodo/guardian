## Installation

- `yarn add -D @kumo-by-theodo/guardian`

## Usage

If you already have a default aws profile configured specifying a default region, simply look for the name of the Cloud Formation stack you wish to audit. To find stack names, log on to AWS cloudformation. It is shown in the overview section of stack info. It may not be what you expected e.g. it might have `-dev` on the end, so worth checking if the tool is not working.

Then, simply run:

- `yarn guardian -c {YOUR_AWS_STACK_NAME}`

If you want to specify your AWS profile and region manually, then run:

- `yarn guardian -p {YOUR_AWS_PROFILE} -c {YOUR_AWS_STACK_NAME} -r {YOUR_AWS_REGION}`

---

## Other CLI options

Here is the full list of available options:

| Option                                       | Effect                                                          |
| -------------------------------------------- | --------------------------------------------------------------- |
| -p, --aws-profile \<profile\>                | Aws profile name to use                                         |
| -r, --aws-region \<region\>                  | Manually set AWS region                                         |
| -c, --cloudformations \[cloudformations...\] | Filter checked account resources by cloudformation stacks names |
| -t, --tags \<key_value...\>                  | Filter checked account resources by tags                        |
| -s, --short                                  | Short output: only display checks results overview              |
| --noFail                                     | Exit with success status, even if some checks failed            |
