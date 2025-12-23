export const DECART_IMAGE_MODELS = ["lucy-pro-t2i"] as const;
export type DecartImageModel = (typeof DECART_IMAGE_MODELS)[number];

export const DECART_VIDEO_MODELS = ["lucy-pro-t2v"] as const;
export type DecartVideoModel = (typeof DECART_VIDEO_MODELS)[number];
