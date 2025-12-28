export type DecartImageResolution = "720p";
export type DecartImageOrientation = "portrait" | "landscape";

export interface DecartImageProviderOptions {
  seed?: number;
  resolution?: DecartImageResolution;
  orientation?: DecartImageOrientation;
}

export type DecartImageModelProviderOptionsByName = {
  "lucy-pro-t2i": DecartImageProviderOptions;
};

export function validatePrompt(prompt: string): void {
  if (!prompt || prompt.length === 0) {
    throw new Error("Prompt cannot be empty.");
  }
  if (prompt.length > 1000) {
    throw new Error(`Prompt must be 1000 characters or less. Got: ${prompt.length}`);
  }
}
