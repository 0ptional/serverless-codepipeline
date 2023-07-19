import Service from "serverless/classes/Service";

type PipelineConfigParams = {
    readonly name?: string;
    readonly enabled?: boolean;
    readonly enabledOn?: string;
    readonly image: string;
    readonly computeType?: string;
    readonly artifactBucket: string;
    readonly env?: Variables;
    readonly source: SourceConfig;
    readonly stages: StageConfigParams[];
    readonly tags?: Variables;
    readonly logRetention?: number;
    readonly vpc?: VPCConfig;
}

export type SourceConfig = CodeCommitSourceConfig | GitHubSourceConfig | S3SourceConfig;

export type VPCConfig = {
    readonly id: string;
    readonly subnets: string[];
    readonly securityGroupIds: string[];
}

export type CodeCommitSourceConfig = {
    readonly type?: 'codecommit';
    readonly repository: string;
    readonly branch: string;
    readonly trigger?: boolean;
}
export type GitHubSourceConfig = {
    readonly type: 'github';
    readonly repository: string;
    readonly branch: string;
    readonly githubToken: string;
    readonly trigger?: boolean;
}
export type S3SourceConfig = {
    readonly type: 's3';
    readonly s3Bucket: string;
    readonly s3Key: string;
    readonly trigger?: boolean;
}

export type StageConfigParams = {
    readonly name: string;
    readonly spec: string;
    readonly env?: Variables;
    readonly manualExecution?: boolean;
    readonly inputs?: string[];
    readonly image?: string;
    readonly computeType?: string;
}

export type Variables = { [key: string]: string };

export class PipelineConfig {
    
    readonly name: string;
    readonly artifactBucket: string;
    readonly source: SourceConfig;
    readonly stages: StageConfig[];
    readonly enabled: boolean;
    readonly tags: Variables;
    readonly logRetention?: number;
    readonly vpc?: VPCConfig;

    constructor(params: PipelineConfigParams, service: Service) {
        this.name = params.name || service.getServiceName();
        this.artifactBucket = params.artifactBucket;
        this.stages = params.stages.map(stage => new StageConfig(stage, params));
        if (params.enabledOn) {
            this.enabled = service.provider.stage === params.enabledOn;
        } else {
            this.enabled = params.enabled === undefined ? true : params.enabled;
        }
        this.tags = { ...(service.provider as any).tags || {}, ...(params.tags ? params.tags : {}) };
        this.logRetention = params.logRetention;

        this.source = params.source;
        this.vpc = params.vpc;
    }

}

export class StageConfig {

    readonly name: string;
    readonly spec: string;
    readonly env: Variables;
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

        if (!this.image) {
            throw new Error('Must specifiy an image');
        }
    }
}
