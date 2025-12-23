import { createDecartClient, models } from "@decartai/sdk";

export interface DecartClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export function createClient(config: DecartClientConfig) {
  return createDecartClient({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
  });
}

export function getDecartApiKeyFromEnv(): string {
  const key = typeof process !== "undefined" ? process.env.DECART_API_KEY : undefined;

  if (!key) {
    throw new Error(
      "DECART_API_KEY is required. Set it in environment variables or use createDecartImage/createDecartVideo with an explicit API key.",
    );
  }

  return key;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

export function mapSizeToResolution(size?: string): "720p" | "480p" | undefined {
  if (!size) return undefined;

  const [width, height] = size.split("x").map(Number);
  if (!width || !height) return undefined;

  return Math.max(width, height) >= 720 ? "720p" : "480p";
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  const base64 = await blobToBase64(blob);
  return `data:${blob.type || "video/mp4"};base64,${base64}`;
}

export { models };
