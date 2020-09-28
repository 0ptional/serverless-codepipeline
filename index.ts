import Serverless, { Options } from 'serverless';
import { PipelineConfig } from './src/PluginConfig';
import { PipelineBuilder } from './src/PipelineBuilder';

type Hook = {
  'before:package:initialize': () => void;
};

class ServerlessPlugin {

  private readonly serverless: Serverless;
  private readonly options: Options;
  private readonly hooks: Hook;

  public constructor(serverless: Serverless, options: Options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'before:package:initialize': this.buildPipeline.bind(this),
    };
  }

  private async buildPipeline(): Promise<void> {
    const pipelineConfig = this.getPipelineConfig();

    if (pipelineConfig && pipelineConfig.enabled) {
      const resources = this.getResources();
      const createdResources = PipelineBuilder.build(pipelineConfig);
      Object.assign(resources, createdResources);
    }
  }

  private getPipelineConfig(): PipelineConfig | undefined {
    if (this.serverless.service.custom.codepipeline) {
      return new PipelineConfig(this.serverless.service.custom.codepipeline, this.serverless.service);
    }
  }

  private getResources(): any {
    const service = this.serverless.service as any;
    if (!service.resources)
      service.resources = { Resources: {} };

    if (!service.resources.Resources)
      service.resources.Resources = {};

    return service.resources.Resources;
  }

}

module.exports = ServerlessPlugin;
