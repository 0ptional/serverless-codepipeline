import { PipelineConfig, CodeCommitSourceConfig, GitHubSourceConfig, SourceConfig, S3SourceConfig } from "./PluginConfig";
import { PipelineStage, S3ActionId, S3SourceAction } from "../types/CodePipeline";
import { artifactName, logicalProjectName } from "./util";
import { GitHubSourceAction, CodeCommitSourceAction, CodeCommitActionId, GitHubActionId } from "../types/CodePipeline";

export function buildStages(config: PipelineConfig): PipelineStage[] {
    return [sourceStage(config.source), ...customStages(config)];
}

function customStages(config: PipelineConfig): PipelineStage[] {
    return config.stages.map((stage, index): PipelineStage => {
        return {
            Name: stage.name,
            Actions: [{
                Name: 'BuildAction',
                ActionTypeId: {
                    Category: 'Build',
                    Owner: 'AWS',
                    Provider: 'CodeBuild',
                    Version: 1
                },
                InputArtifacts: stage.inputs.map(input => ({ Name: artifactName(input) })),
                OutputArtifacts: [{ Name: artifactName(stage.name) }],
                Configuration: {
                    ProjectName: { Ref: logicalProjectName(index) },
                    PrimarySource: artifactName('source')
                }
            }]
        };
    })
}

function sourceStage(config: SourceConfig): PipelineStage {
    let action;
    if (!config.type || config.type === 'codecommit') {
        action = codecommitSourceAction(config);
    } else if (config.type === 'github') {
        action = githubSourceAction(config);
    } else if (config.type === 's3') {
        action = s3SourceAction(config);
    } else {
        throw new Error('unknown source type. Only "codecommit", "github" and "s3" are supported.');
    }

    return {
        Name: 'Source',
        Actions: [action]
    };
}

/**
 * see https://docs.aws.amazon.com/codepipeline/latest/userguide/appendix-github-oauth.html
 */
function githubSourceAction(config: GitHubSourceConfig): GitHubSourceAction {
    if (!config.githubToken) {
        throw new Error('missing github token')
    }

    const repoSplits = config.repository.split('/');
    if (repoSplits.length !== 2) {
        throw new Error(`github repository must be specified as 'owner/repo-name'`);
    }
    const owner = repoSplits[0];
    const repo = repoSplits[1];

    return {
        Name: 'SourceAction',
        ActionTypeId: gitHubActionId(),
        Configuration: {
            Branch: config.branch || 'master',
            PollForSourceChanges: config.trigger !== undefined ? config.trigger : true,
            Repo: repo,
            OAuthToken: config.githubToken,
            Owner: owner
        },
        InputArtifacts: [],
        OutputArtifacts: [{ Name: artifactName('source') }]
    };
}

function codecommitSourceAction(config: CodeCommitSourceConfig): CodeCommitSourceAction {
    return {
        Name: 'SourceAction',
        ActionTypeId: codeCommitActionId(),
        Configuration: {
            BranchName: config.branch || 'master',
            PollForSourceChanges: config.trigger !== undefined ? config.trigger : true,
            RepositoryName: config.repository
        },
        InputArtifacts: [],
        OutputArtifacts: [{ Name: artifactName('source') }],
    };
}

function s3SourceAction(config: S3SourceConfig): S3SourceAction {
    return {
        Name: 'SourceAction',
        ActionTypeId: s3ActionId(),
        Configuration: {
            S3Bucket: config.s3Bucket,
            S3ObjectKey: config.s3Key,
            PollForSourceChanges: config.trigger !== undefined ? config.trigger : true,
        },
        InputArtifacts: [],
        OutputArtifacts: [{ Name: artifactName('source') }],
    };
}

function codeCommitActionId(): CodeCommitActionId {
    return {
        Category: 'Source',
        Owner: 'AWS',
        Provider: 'CodeCommit',
        Version: 1
    };
}

function gitHubActionId(): GitHubActionId {
    return {
        Category: 'Source',
        Owner: 'ThirdParty',
        Provider: 'GitHub',
        Version: 1
    };
}

function s3ActionId(): S3ActionId {
    return {
        Category: 'Source',
        Owner: 'AWS',
        Provider: 'S3',
        Version: 1
    };
}