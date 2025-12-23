export interface DecartVideoProviderOptions {
  seed?: number;
  resolution?: "720p" | "480p";
  orientation?: string;
}

export function validatePrompt(prompt: string | undefined): void {
  if (!prompt || prompt.length === 0) {
    throw new Error("Prompt is required");
  }
  if (prompt.length > 1000) {
    throw new Error(`Prompt must be 1000 characters or less. Got: ${prompt.length}`);
  }
}
