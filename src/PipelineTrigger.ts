import { EventRule } from "../types/EventRule";
import { IAMRole } from "../types/IAMRole";
import { PipelineConfig } from "./PluginConfig";
import { mapToTags } from "./util";

export function triggerIAMRole(config: PipelineConfig): IAMRole {
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
                'events.amazonaws.com'
              ]
            }
          }
        ]
      },
      Policies: [
        {
          PolicyName: 'CodePipelineEventBridgeTrigger',
          PolicyDocument: {
            Statement: [
              {
                Action: 'codepipeline:StartPipelineExecution',
                Effect: 'Allow',
                Resource: {
                  'Fn::Join': [
                    '',
                    [
                      'arn:aws:codepipeline:', { Ref: 'AWS::Region' }, ':', { Ref: 'AWS::AccountId' }, ':', { Ref: 'CodePipeline' }
                    ]
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
}

export function triggerEventRule(repository: string, branch: string): EventRule {
  return {
    Type: 'AWS::Events::Rule',
    Properties: {
      EventPattern: {
        source: ['aws.codecommit'],
        "detail-type": ['CodeCommit Repository State Change'],
        resources: [{
          "Fn::Join": [
            "",
            [
              "arn:aws:codecommit:",
              {
                "Ref": "AWS::Region"
              },
              ":",
              {
                "Ref": "AWS::AccountId"
              },
              ":",
              repository
            ]
          ]
        }],
        detail: {
          event: [
            "referenceCreated",
            "referenceUpdated"
          ],
          referenceType: ["branch"],
          referenceName: [branch]
        }
      },
      Targets: [{
        Arn: {
          "Fn::Join": [
            "",
            [
              "arn:aws:codepipeline:",
              { Ref: "AWS::Region" },
              ":",
              { Ref: "AWS::AccountId" },
              ":",
              { Ref: "CodePipeline" }
            ]
          ]
        },
        RoleArn: {
          "Fn::GetAtt": [
            "TriggerEventRole",
            "Arn"
          ]
        },
        Id: "codepipeline-target"
      }],
    }
  }
}

