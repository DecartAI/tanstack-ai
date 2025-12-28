import type { VideoModels } from "@decartai/sdk";
import type { VideoGenerationOptions, VideoJobResult, VideoStatusResult, VideoUrlResult } from "@tanstack/ai";
import { BaseVideoAdapter } from "@tanstack/ai/adapters";
import type { DecartVideoModel } from "../model-meta";
import { blobToDataUrl, createClient, getDecartApiKeyFromEnv, mapSizeToResolution, models } from "../utils";
import type { DecartVideoProviderOptions } from "../video/video-provider-options";
import { validatePrompt } from "../video/video-provider-options";

export interface DecartVideoConfig {
  apiKey: string;
  baseUrl?: string;
}

export class DecartVideoAdapter<
  TModel extends DecartVideoModel,
> extends BaseVideoAdapter<TModel, DecartVideoProviderOptions> {
  readonly kind = "video" as const;
  readonly name = "decart" as const;

  private client: ReturnType<typeof createClient>;

  constructor(config: DecartVideoConfig, model: TModel) {
    super(config, model);
    this.client = createClient(config);
  }

  async createVideoJob(options: VideoGenerationOptions<DecartVideoProviderOptions>): Promise<VideoJobResult> {
    const { prompt, size, modelOptions = {} } = options;

    validatePrompt(prompt);

    const sdkModel = models.video(this.model as VideoModels);
    const resolution = mapSizeToResolution(size) ?? modelOptions.resolution ?? "720p";

    const job = await this.client.queue.submit({
      model: sdkModel,
      prompt,
      resolution,
      ...modelOptions,
    });

    return {
      jobId: job.job_id,
      model: this.model,
    };
  }

  async getVideoStatus(jobId: string): Promise<VideoStatusResult> {
    const status = await this.client.queue.status(jobId);

    return {
      jobId,
      status: status.status,
      progress: undefined,
      error: undefined,
    };
  }

  async getVideoUrl(jobId: string): Promise<VideoUrlResult> {
    const blob = await this.client.queue.result(jobId);
    const dataUrl = await blobToDataUrl(blob);

    return {
      jobId,
      url: dataUrl,
      expiresAt: undefined,
    };
  }
}

export function createDecartVideo<TModel extends DecartVideoModel>(
  model: TModel,
  apiKey: string,
  config?: Omit<DecartVideoConfig, "apiKey">,
): DecartVideoAdapter<TModel> {
  return new DecartVideoAdapter({ apiKey, ...config }, model);
}

export function decartVideo<TModel extends DecartVideoModel>(
  model: TModel,
  config?: Omit<DecartVideoConfig, "apiKey">,
): DecartVideoAdapter<TModel> {
  const apiKey = getDecartApiKeyFromEnv();
  return createDecartVideo(model, apiKey, config);
}
