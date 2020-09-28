import { PipelineConfig } from "./PluginConfig";
import { CodePipeline, BuildAction, SourceAction } from "../types/CodePipeline";
import { CodeBuildProject } from "../types/CodeBuildProject";
import { IAMRole } from "../types/IAMRole";


export type PipelineResources = {
    readonly CodePipeline: CodePipeline;
    readonly CodePipelineRole: IAMRole;
    readonly [key: string]: unknown;
};

export class PipelineBuilder {

    public static build(config: PipelineConfig): PipelineResources {
        return {
            CodePipelineRole: this.iamRole(config),
            CodePipeline: this.pipeline(config),
            ...this.buildProjects(config).reduce((all, project, index) => {
                all[this.logicalProjectName(index)] = project;
                return all;
            }, {} as Record<string, CodeBuildProject>)
        };
    }

    public static sourceAction(config: PipelineConfig): SourceAction {
        return {
            Name: 'SourceAction',
            ActionTypeId: {
                Category: 'Source',
                Owner: 'AWS',
                Provider: 'CodeCommit',
                Version: 1
            },
            Configuration: {
                BranchName: config.source.branch || 'master',
                PollForSourceChanges: config.source.trigger !== undefined ? config.source.trigger : true,
                RepositoryName: config.source.repository
            },
            InputArtifacts: [],
            OutputArtifacts: [{ Name: this.artifactName('source') }],
        };
    }

    public static buildActions(config: PipelineConfig): BuildAction[] {
        return config.stages.map((stage, index): BuildAction => {
            return {
                Name: 'BuildAction',
                ActionTypeId: {
                    Category: 'Build',
                    Owner: 'AWS',
                    Provider: 'CodeBuild',
                    Version: 1
                },
                InputArtifacts: stage.inputs.map(input => ({ Name: this.artifactName(input) })),
                OutputArtifacts: [{ Name: this.artifactName(stage.name) }],
                Configuration: {
                    ProjectName: { Ref: this.logicalProjectName(index) },
                    PrimarySource: this.artifactName('source')
                }
            };
        })
    }

    public static buildProjects(config: PipelineConfig): CodeBuildProject[] {
        return config.stages.map((stage): CodeBuildProject => {
            return {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Name: this.projectName(config.name, stage.name),
                    Source: {
                        Type: 'CODEPIPELINE',
                        BuildSpec: stage.spec
                    },
                    Environment: {
                        Type: 'LINUX_CONTAINER',
                        ComputeType: stage.computeType,
                        Image: stage.image,
                        EnvironmentVariables: this.environmentVariables(stage.env)
                    },
                    Artifacts: {
                        Type: 'CODEPIPELINE'
                    },
                    ServiceRole: { Ref: 'CodePipelineRole' }
                }
            }
        });
    }

    public static environmentVariables(env: {[key: string]: string}): Array<{ Name: string; Value: string }> {
        return Object.keys(env).map(name => ({ Name: name, Value: env[name] }));
    }

    private static artifactName(stageName: string): string {
        return `${stageName.replace(' ', '_').replace('-', '_')}_artifact`;
    }

    private static logicalProjectName(index: number): string {
        return `CodeBuildTask${index}`;
    }
    
    private static projectName(pipelineName: string, stageName: string): string {
        return `${pipelineName}-${stageName.replace(' ', '-')}`;
    }

    public static pipeline(config: PipelineConfig): CodePipeline {
        return {
            Type: 'AWS::CodePipeline::Pipeline',
            Properties: {
                Name: config.name,
                RoleArn: {
                    'Fn::GetAtt': ['CodePipelineRole', 'Arn']
                },
                ArtifactStore: {
                    Type: 'S3',
                    Location: config.artifactBucket
                },
                Stages: [
                    {
                        Name: 'Source',
                        Actions: [this.sourceAction(config)]
                    },
                    ...this.buildActions(config).map((action, index) => ({Name: config.stages[index].name, Actions: [action]}))
                ],
                DisableInboundStageTransitions: config.stages.filter(stage => stage.manualExecution).map(stage => ({Reason: 'Waiting for approval', StageName: stage.name}))
            }
        }
    }

    public static iamRole(config: PipelineConfig): IAMRole {
        return {
            Type: 'AWS::IAM::Role',
            Properties: {
                AssumeRolePolicyDocument: {
                    Statement: [
                        {
                            Action: ['sts:AssumeRole'],
                            Effect: 'Allow',
                            Principal: {
                                Service: [
                                    'codepipeline.amazonaws.com',
                                    'codebuild.amazonaws.com'
                                ]
                            }
                        }
                    ]
                },
                Policies: [
                    {
                        PolicyName: 'CodePipelineFullAccess',
                        PolicyDocument: {
                            Statement: [
                                {
                                    Action: '*',
                                    Effect: 'Allow',
                                    Resource: '*'
                                }
                            ]
                        }
                    }
                ]
            }
        }
    }

}