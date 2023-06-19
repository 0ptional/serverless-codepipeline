import { PipelineConfig } from "./PluginConfig";
import { CodePipeline } from "../types/CodePipeline";
import { CodeBuildProject } from "../types/CodeBuildProject";
import { IAMRole } from "../types/IAMRole";
import { buildStages } from "./Stages";
import { logicalProjectName, mapToTags } from "./util";
import { buildIAMRole } from "./IAMRole";
import { buildProjects } from "./Projects";
import { buildLogGroups } from "./LogGroup";
import { triggerEventRule, triggerIAMRole } from './PipelineTrigger';


export type PipelineResources = {
    readonly CodePipeline: CodePipeline;
    readonly CodePipelineRole: IAMRole;
    readonly [key: string]: unknown;
};

export class PipelineBuilder {

    public static build(config: PipelineConfig): PipelineResources {
        const projects = buildProjects(config);
        const projectEntries = projects.reduce<Record<string, CodeBuildProject>>((all, project, index) => {
            all[logicalProjectName(index)] = project;
            return all;
        }, {});

        const useEventBridgeTrigger = (config.source.type === 'codecommit' || config.source.type === undefined) && config.source.trigger !== false;

        const resources: PipelineResources = {
            CodePipelineRole: buildIAMRole(config),
            CodePipeline: this.pipeline(config),
            ...projectEntries,
            ...buildLogGroups(projects, config.logRetention),
            ...(useEventBridgeTrigger ? {
                TriggerEventRule: triggerEventRule(config.source.repository, config.source.branch),
                TriggerEventRole: triggerIAMRole(config),
            } : {})
        };

        return resources;
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
                Stages: buildStages(config),
                DisableInboundStageTransitions: config.stages.filter(stage => stage.manualExecution).map(stage => ({Reason: 'Waiting for approval', StageName: stage.name})),
                Tags: mapToTags(config.tags)
            }
        }
    }

}