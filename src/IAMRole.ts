import { PipelineConfig } from "./PluginConfig";
import { IAMRole } from "../types/IAMRole";
import { mapToTags } from "./util";

export function buildIAMRole(config: PipelineConfig): IAMRole {
    return {
        Type: 'AWS::IAM::Role',
        Properties: {
            Tags: mapToTags(config.tags),
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