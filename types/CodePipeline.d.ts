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
        DisableInboundStageTransitions?: Array<{Reason: string, StageName: string}>
    }
}

export type PipelineStage = {
    Name: string;
    Actions: StageAction[];
}

export type StageAction = SourceAction | BuildAction;


export type SourceAction = {
    Name: 'SourceAction';
    ActionTypeId: {
        Category: 'Source';
        Owner: 'AWS';
        Provider: 'CodeCommit';
        Version: 1;
    };
    Configuration: {
        BranchName: string;
        PollForSourceChanges: boolean;
        RepositoryName: string;
    };
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