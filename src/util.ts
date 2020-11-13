import { Tag, EnvironmentVariable } from "../types/Common";

export function artifactName(stageName: string): string {
    return `${stageName.replace(' ', '_').replace('-', '_')}_artifact`;
}

export function logicalProjectName(index: number): string {
    return `CodeBuildTask${index}`;
}

export function projectName(pipelineName: string, stageName: string): string {
    return `${pipelineName}-${stageName.replace(' ', '-')}`;
}

export function logGroupName(projectName: string): string {
    return `/aws/codebuild/${projectName}`
}

export function mapToEnvs(env: {[key: string]: string}): EnvironmentVariable[] {
    return Object.keys(env).map(name => ({ Name: name, Value: env[name] }));
}

export function mapToTags(tags: Record<string, string>): Tag[] {
    return Object.keys(tags).map(key => ({ Key: key, Value: tags[key] }));
}