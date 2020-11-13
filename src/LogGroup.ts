import { logGroupName } from "./util";
import { CodeBuildProject } from "../types/CodeBuildProject";
import { CloudWatchLogGroup } from "../types/CloudWatchLogGroup";

export function buildLogGroups(projects: CodeBuildProject[], logRetention?: number): CloudWatchLogGroup[] {
    return projects.map(project => ({
        Type: 'AWS::Logs::LogGroup',
        Properties: {
            LogGroupName: logGroupName(project.Properties.Name),
            RetentionInDays: logRetention
        }
    }));
}