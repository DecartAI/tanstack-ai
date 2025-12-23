import type { ImageModels } from "@decartai/sdk";
import type { GeneratedImage, ImageGenerationOptions, ImageGenerationResult } from "@tanstack/ai";
import { BaseImageAdapter } from "@tanstack/ai/adapters";
import type { DecartImageProviderOptions } from "../image/image-provider-options";
import { validatePrompt } from "../image/image-provider-options";
import type { DecartImageModel } from "../model-meta";
import { blobToBase64, createClient, generateId, getDecartApiKeyFromEnv, mapSizeToResolution, models } from "../utils";

export interface DecartImageConfig {
  apiKey: string;
  baseUrl?: string;
}

export class DecartImageAdapter extends BaseImageAdapter<DecartImageModel, DecartImageProviderOptions> {
  readonly kind = "image" as const;
  readonly name = "decart" as const;

  private client: ReturnType<typeof createClient>;

  constructor(config: DecartImageConfig, model: DecartImageModel) {
    super(config, model);
    this.client = createClient(config);
  }

  async generateImages(options: ImageGenerationOptions<DecartImageProviderOptions>): Promise<ImageGenerationResult> {
    const { prompt, size, modelOptions = {} } = options;

    validatePrompt(prompt);

    const sdkModel = models.image(this.model as ImageModels);
    const resolution = mapSizeToResolution(size) ?? modelOptions.resolution ?? "720p";

    const blob = await this.client.process({
      model: sdkModel,
      prompt,
      resolution,
      ...modelOptions,
    });

    const b64Json = await blobToBase64(blob);

    const images: GeneratedImage[] = [{ b64Json, revisedPrompt: undefined }];

    return {
      id: generateId(this.name),
      model: this.model,
      images,
      usage: undefined,
    };
  }
}

export function createDecartImage(
  model: DecartImageModel,
  apiKey: string,
  config?: Omit<DecartImageConfig, "apiKey">,
): DecartImageAdapter {
  return new DecartImageAdapter({ apiKey, ...config }, model);
}

export function decartImage(model: DecartImageModel, config?: Omit<DecartImageConfig, "apiKey">): DecartImageAdapter {
  const apiKey = getDecartApiKeyFromEnv();
  return createDecartImage(model, apiKey, config);
}
