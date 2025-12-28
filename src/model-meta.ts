import type { DecartImageProviderOptions } from "./image/image-provider-options";
import type { DecartVideoProviderOptions } from "./video/video-provider-options";

interface DecartModelMeta<TProviderOptions = unknown> {
  name: string;
  supports: {
    input: ReadonlyArray<"text" | "image" | "video">;
    output: ReadonlyArray<"image" | "video">;
    endpoints: ReadonlyArray<"image-generation" | "video">;
  };
  pricing: {
    resolution720p: number;
    resolution480p?: number;
    unit: "per-image" | "per-second";
  };
  providerOptions?: TProviderOptions;
}

/**
 * Lucy Pro T2I - Text-to-Image generation model.
 *
 * @see https://docs.platform.decart.ai/models/image/image-generation
 */
export const LUCY_PRO_T2I = {
  name: "lucy-pro-t2i",
  supports: {
    input: ["text"] as const,
    output: ["image"] as const,
    endpoints: ["image-generation"] as const,
  },
  pricing: {
    resolution720p: 0.02,
    unit: "per-image" as const,
  },
} as const satisfies DecartModelMeta<DecartImageProviderOptions>;

/**
 * Lucy Pro T2V - Text-to-Video generation model.
 *
 * @see https://docs.platform.decart.ai/models/video/video-generation
 */
export const LUCY_PRO_T2V = {
  name: "lucy-pro-t2v",
  supports: {
    input: ["text"] as const,
    output: ["video"] as const,
    endpoints: ["video"] as const,
  },
  pricing: {
    resolution720p: 0.08,
    resolution480p: 0.04,
    unit: "per-second" as const,
  },
} as const satisfies DecartModelMeta<DecartVideoProviderOptions>;

export const DECART_IMAGE_MODELS = [LUCY_PRO_T2I.name] as const;
export type DecartImageModel = (typeof DECART_IMAGE_MODELS)[number];

export const DECART_VIDEO_MODELS = [LUCY_PRO_T2V.name] as const;
export type DecartVideoModel = (typeof DECART_VIDEO_MODELS)[number];

export type DecartModelInputModalitiesByName = {
  [LUCY_PRO_T2I.name]: typeof LUCY_PRO_T2I.supports.input;
  [LUCY_PRO_T2V.name]: typeof LUCY_PRO_T2V.supports.input;
};
