import { Tag } from "./Common";

export type CodeBuildProject = {
    Type: 'AWS::CodeBuild::Project';
    Properties: {
        Name: string;
        Source: {
            Type: 'CODEPIPELINE',
            BuildSpec: string;
        };
        Environment: {
            ComputeType: string;
            Image: string;
            Type: 'LINUX_CONTAINER';
            EnvironmentVariables: Array<{ Name: string; Value: string }>;
        };
        Artifacts: {
            Type: 'CODEPIPELINE';
        };
        ServiceRole: string | { Ref: string };
        Tags?: Tag[];
        VpcConfig?: {
            SecurityGroupIds: string[];
            Subnets: string[];
            VpcId: string;
        };
    };
};
