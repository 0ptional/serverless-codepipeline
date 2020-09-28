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
      - repository: my-repository
    stages:
      - name: build
        spec: ci/build.yml
      - name: deploy-dev
        spec: ci/deploy-dev.yml
      - name: deploy-prod
        spec: ci/deploy-prod.yml
```


#### General Properties

Property | Type | Required | Description
---|---|---|---
`computeType` | string | false | Defaults to `BUILD_GENERAL1_SMALL`. See [Allowed Values](https://)
`enabled` | boolean | false | Set to `false` if pipeline should not be deployed. This is useful for stage dependent creation of pipeline. Defaults to true.
`image` | string | true | Provide a docker image name.
`artifactBucket` | string | true | Bucket name for stored artifacts
`env` | Record<string, string> | false | Map of environment variables that are made available to each stage.
`source` | Source Object | true | Configuration for source. 
`stages` | Array<Stage> | true | List of stages.

#### Source Properties

Property | Type | Required | Description
---|---|---|---
`repository` | string | true | Name of repository in AWS CodeCommit.
`branch` | string | false | Branch that should be checked out. Defaults to `master`.
`trigger` | boolean | false | Set to `false` if the pipeline should not be triggered on source changes. Defaults to `true`.

#### Stage Properties

Property | Type | Required | Description
---|---|---|---
`name` | string | true | Stage name. Output names are also based on stage name.
`spec` | string | true | Location of the CodeBuild spec file within the primary input (source).
`inputs` | string[] | false | Specify all stage names from which a stage should receive additional input. The source input is always the primary.
`image` | string | false | Specify a docker image if this stage should use a different image.
`env` | Record<string, string> | false | Adds stage specifc environment variables. Stage variables are merged with global variables.
`computeType` | string | false | Specify if this stage should run with a different compute type than provided in general config.
`manualExecution` | boolean | false | Set to true, if this stage should not run automatically. Defaults to `false`.

```yaml
custom:
  codepipeline:
    # global config
    computeType: BUILD_GENERAL1_SMALL
    enabled: ${self:custom.${self:provider.stage}.deployPipeline} # use this for stage dependent deployments
    image: aws/cli
    artifactBucket: my-bucket
    env:
      VAR1: hello

    # source config
    source:
      - repository: my-repository
        branch: master
        trigger: true

    # stage config
    stages:
      - name: build
        spec: ci/build.yml
        image: aws/cli
        computeType: BUILD_GENERAL1_SMALL
        env:
          VAR2: world
      - name: deploy-dev
        spec: ci/deploy-dev.yml
        inputs: [ build ]
      - name: deploy-prod
        manualExecution: true
        spec: ci/deploy-prod.yml
        inputs: [ build ]
```
