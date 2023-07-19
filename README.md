# serverless-codepipeline-plugin

Plugin for serverless to create a code pipeline.

## Installation

```
npm i serverless-codepipeline-plugin
```

## Usage

Minimal Example:
```yaml
custom:
  codePipeline:
    image: aws/cli
    artifactBucket: my-bucket
    source:
      repository: my-repository
    stages:
      - name: build
        spec: ci/build.yml
      - name: deploy-dev
        spec: ci/deploy-dev.yml
      - name: deploy-prod
        spec: ci/deploy-prod.yml
```


### General Properties

Property | Type | Required | Description
---|---|---|---
`computeType` | *string* | false | Defaults to `BUILD_GENERAL1_SMALL`. See [allowed values](https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-compute-types.html).
`enabled` | *boolean* | false | Set to `false` if pipeline should not be deployed. This is useful for stage dependent creation of pipeline. Defaults to true.
`enabledOn` | *string* | false | Specify name of stage during which the pipeline should be created. This overrides `enabled`.
`image` | *string* | true | Provide a docker image name.
`artifactBucket` | *string* | true | Bucket name for stored artifacts
`env` | *Record<string, string>* | false | Map of environment variables that are made available to each stage.
`source` | *Source Object* | true | Configuration for source. 
`stages` | *Array\<Stage>* | true | List of stages.
`logRetention` | *number* | false | Number of days for which codebuild logs are retained in cloudwatch. See [allowed values](https://docs.aws.amazon.com/de_de/AWSCloudFormation/latest/UserGuide/aws-resource-logs-loggroup.html). Defaults to no limit.
`tags` | *Record<string, string>* | false | Map of tags. Merged with tags defined in provider. The tags are applied to all created resources (IAM Role, CodeBuild Projects and Pipeline).
`vpc` | *VPCConfig Object* | false | Contains the configuration for a VPC. This will be used for all stages.

### Source Properties

Currently, the plugin supports CodeCommit, GitHub and S3 as sources.

#### CodeCommit Source Properties

Property | Type | Required | Description
---|---|---|---
`type` | *'codecommit'* | false | When no type is defined, it defaults to `codecommit`.
`repository` | *string* | true | Name of repository in codecommit.
`branch` | *string* | false | Branch that should be checked out. Defaults to `master`.
`trigger` | *boolean* | false | Set to `false` if the pipeline should not be triggered on source changes. Defaults to `true`.

*Note: With version 1.3.x and above the trigger is no longer polling. Instead, an event rule is created that triggers the pipeline.*

#### GitHub Source Properties

Property | Type | Required | Description
---|---|---|---
`type` | *'github'* | true | Type must be set to `github` to use it as a source.
`repository` | *string* | true | Name of repository with prepended owner (e.g. `0ptional/serverless-codepipeline`)
`branch` | *string* | false | Branch that should be checked out. Defaults to `master`.
`trigger` | *boolean* | false | Set to `false` if the pipeline should not be triggered on source changes. Defaults to `true`.
`githubToken` | *string* | true | To use repositories on GitHub you must provide an OAuth token for a GitHub user. For a guide on how to create the token, read [this](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token).

#### S3 Source Properties

Property | Type | Required | Description
---|---|---|---
`type` | *'s3'* | true | Type must be set to `s3` to use it as a source.
`s3Bucket` | *string* | true | Name of S3 Bucket.
`s3Key` | *string* | false | Key to object (must be zip archive).
`trigger` | *boolean* | false | Set to `false` if the pipeline should not be triggered on source changes. Defaults to `true`.

### Stage Properties

Property | Type | Required | Description
---|---|---|---
`name` | *string* | true | Stage name. Output names are also based on stage name.
`spec` | *string* | true | Location of the CodeBuild spec file within the primary input (source).
`inputs` | *string[]* | false | Specify all stage names from which a stage should receive additional input. The source input is always the primary.
`image` | *string* | false | Specify a docker image if this stage should use a different image.
`env` | *Record<string, string>* | false | Adds stage specifc environment variables. Stage variables are merged with global variables.
`computeType` | *string* | false | Specify if this stage should run with a different compute type than provided in general config.
`manualExecution` | *boolean* | false | Set to true, if this stage should not run automatically. Defaults to `false`.

### VPCConfig Properties

Property | Type | Required | Description
---|---|---|---
`id` | *string* | true | VPC ID.
`subnets` | *string[]* | true | List of VPC subnets to use.
`securityGroupIds` | *string[]* | true | List of security group ids.


## Full Example

```yaml
custom:
  codepipeline:
    # global config
    computeType: BUILD_GENERAL1_SMALL
    # enabled: ${self:custom.${self:provider.stage}.deployPipeline}
    enabledOn: staging # use this for a single stage dependent deployment
    image: aws/cli
    artifactBucket: my-bucket
    logRetention: 7
    tags:
      PipelineTag: value
    env:
      PIPELINE_ENV_VAR: hello

    # source config
    source:
      type: github
      repository: '0ptional/serverless-codepipeline'
      branch: master
      trigger: false
      githubToken: abc*******

    # stage config
    stages:
      - name: build
        spec: ci/build.yml
        image: aws/cli
        computeType: BUILD_GENERAL1_SMALL
        env:
          STAGE_ENV_VAR: world
      - name: deploy-dev
        spec: ci/deploy-dev.yml
        inputs: [ build ]
      - name: deploy-prod
        manualExecution: true
        spec: ci/deploy-prod.yml
        inputs: [ build ]
```

## Todos

* Support ECR as source