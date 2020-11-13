import { Tag } from "./Common";

export type CodePipeline = {
    Type: 'AWS::CodePipeline::Pipeline',
    Properties: {
        ArtifactStore: {
            Type: 'S3',
            Location: string | { Ref: string }
        },
        RoleArn: {
            'Fn::GetAtt': string[],
        },
        Name: string,
        Stages: PipelineStage[],
        DisableInboundStageTransitions?: Array<{Reason: string, StageName: string}>,
        Tags?: Tag[]
    }
}

export type PipelineStage = {
    Name: string;
    Actions: StageAction[];
}

export type StageAction = SourceAction | BuildAction;


export type SourceAction = CodeCommitSourceAction | GitHubSourceAction | S3SourceAction;

export type CodeCommitActionId = {
    readonly Category: 'Source';
    readonly Owner: 'AWS';
    readonly Provider: 'CodeCommit';
    readonly Version: 1;
};

export type CodeCommitConfiguration = {
    readonly BranchName: string;
    readonly PollForSourceChanges: boolean;
    readonly RepositoryName: string;
}

export type GitHubActionId = {
    readonly Category: 'Source';
    readonly Owner: 'ThirdParty';
    readonly Provider: 'GitHub';
    readonly Version: 1;
};

export type GitHubConfiguration = {
    readonly Owner: string;
    readonly Repo: string;
    readonly PollForSourceChanges: boolean;
    readonly Branch: string;
    readonly OAuthToken?: string;
}

export type S3ActionId = {
    readonly Category: 'Source';
    readonly Owner: 'AWS';
    readonly Provider: 'S3';
    readonly Version: 1;
};

export type S3Configuration = {
    readonly S3Bucket: string;
    readonly S3ObjectKey: string;
    readonly PollForSourceChanges: boolean;
}

export type CodeCommitSourceAction = {
    Name: 'SourceAction';
    ActionTypeId: CodeCommitActionId;
    Configuration: CodeCommitConfiguration;
    OutputArtifacts: Array<{ Name: string }>;
    InputArtifacts: Array<{ Name: string }>;
}

export type GitHubSourceAction = {
    Name: 'SourceAction';
    ActionTypeId: GitHubActionId;
    Configuration: GitHubConfiguration;
    OutputArtifacts: Array<{ Name: string }>;
    InputArtifacts: Array<{ Name: string }>;
}

export type S3SourceAction = {
    Name: 'SourceAction';
    ActionTypeId: S3ActionId;
    Configuration: S3Configuration;
    OutputArtifacts: Array<{ Name: string }>;
    InputArtifacts: Array<{ Name: string }>;
}

export type BuildAction = {
    Name: 'BuildAction';
    ActionTypeId: {
        Category: 'Build';
        Owner: 'AWS';
        Provider: 'CodeBuild';
        Version: 1;
    };
    Configuration: {
        ProjectName: string | { Ref: string };
        PrimarySource: string;
    };
    InputArtifacts: Array<{ Name: string }>;
    OutputArtifacts: Array<{ Name: string }>;
}