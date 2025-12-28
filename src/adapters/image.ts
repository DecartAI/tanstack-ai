import type { ImageModels } from "@decartai/sdk";
import type { GeneratedImage, ImageGenerationOptions, ImageGenerationResult } from "@tanstack/ai";
import { BaseImageAdapter } from "@tanstack/ai/adapters";
import type {
  DecartImageModelProviderOptionsByName,
  DecartImageProviderOptions,
} from "../image/image-provider-options";
import { validatePrompt } from "../image/image-provider-options";
import type { DecartImageModel } from "../model-meta";
import { blobToBase64, createClient, generateId, getDecartApiKeyFromEnv, mapSizeToResolution, models } from "../utils";

export interface DecartImageConfig {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Decart Image Generation Adapter
 *
 * Tree-shakeable adapter for Decart image generation functionality.
 * Supports lucy-pro-t2i model.
 *
 * Features:
 * - Model-specific type-safe provider options
 * - Resolution and orientation configuration
 * - Seed support for reproducible generation
 */
export class DecartImageAdapter<
  TModel extends DecartImageModel,
> extends BaseImageAdapter<TModel, DecartImageProviderOptions, DecartImageModelProviderOptionsByName> {
  readonly kind = "image" as const;
  readonly name = "decart" as const;

  private client: ReturnType<typeof createClient>;

  constructor(config: DecartImageConfig, model: TModel) {
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

export function createDecartImage<TModel extends DecartImageModel>(
  model: TModel,
  apiKey: string,
  config?: Omit<DecartImageConfig, "apiKey">,
): DecartImageAdapter<TModel> {
  return new DecartImageAdapter({ apiKey, ...config }, model);
}

export function decartImage<TModel extends DecartImageModel>(
  model: TModel,
  config?: Omit<DecartImageConfig, "apiKey">,
): DecartImageAdapter<TModel> {
  const apiKey = getDecartApiKeyFromEnv();
  return createDecartImage(model, apiKey, config);
}
