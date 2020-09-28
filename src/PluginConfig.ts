import Service from "serverless/classes/Service";

type PipelineConfigParams = {
    readonly name?: string;
    readonly enabled?: boolean;
    readonly image: string;
    readonly computeType?: string;
    readonly artifactBucket: string;
    readonly env?: EnvironmentVariables;
    readonly source: SourceConfig;
    readonly stages: StageConfigParams[];
}

export type SourceConfig = {
    readonly repository: string;
    readonly branch: string;
    readonly trigger?: boolean;
}

export type StageConfigParams = {
    readonly name: string;
    readonly spec: string;
    readonly env?: EnvironmentVariables;
    readonly manualExecution?: boolean;
    readonly inputs?: string[];
    readonly image?: string;
    readonly computeType?: string;
}

type EnvironmentVariables = { [key: string]: string };

export class PipelineConfig {
    
    readonly name: string;
    readonly artifactBucket: string;
    readonly source: SourceConfig;
    readonly stages: StageConfig[];
    readonly enabled: boolean;

    constructor(params: PipelineConfigParams, service: Service) {
        this.source = params.source;
        this.name = params.name || service.getServiceName();
        this.artifactBucket = params.artifactBucket;
        this.stages = params.stages.map(stage => new StageConfig(stage, params));
        this.enabled = params.enabled === undefined ? true : params.enabled;
    }

}

export class StageConfig {

    readonly name: string;
    readonly spec: string;
    readonly env: EnvironmentVariables;
    readonly manualExecution: boolean;
    readonly inputs: string[];
    readonly computeType: string;
    readonly image: string;
    
    constructor(params: StageConfigParams, globalParams: PipelineConfigParams) {
        this.name = params.name;
        this.spec = params.spec;
        this.computeType = params.computeType || globalParams.computeType || 'BUILD_GENERAL1_SMALL';
        this.env = {...globalParams.env || {}, ...params.env || {}};
        this.manualExecution = params.manualExecution === undefined ? false : params.manualExecution;
        this.inputs = ['source'].concat(params.inputs || []);
        this.image = params.image || globalParams.image;
    }
}
