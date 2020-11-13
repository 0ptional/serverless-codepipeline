import { PipelineConfig } from "./PluginConfig";
import { CodeBuildProject } from "../types/CodeBuildProject";
import { projectName, mapToEnvs, mapToTags } from "./util";

export function buildProjects(config: PipelineConfig): CodeBuildProject[] {
    return config.stages.map((stage): CodeBuildProject => {
        return {
            Type: 'AWS::CodeBuild::Project',
            Properties: {
                Name: projectName(config.name, stage.name),
                Source: {
                    Type: 'CODEPIPELINE',
                    BuildSpec: stage.spec
                },
                Environment: {
                    Type: 'LINUX_CONTAINER',
                    ComputeType: stage.computeType,
                    Image: stage.image,
                    EnvironmentVariables: mapToEnvs(stage.env)
                },
                Artifacts: {
                    Type: 'CODEPIPELINE'
                },
                ServiceRole: { Ref: 'CodePipelineRole' },
                Tags: mapToTags(config.tags)
            }
        }
    });
}