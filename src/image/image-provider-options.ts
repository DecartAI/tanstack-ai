export interface DecartImageProviderOptions {
  seed?: number;
  resolution?: "720p" | "480p";
  orientation?: "portrait" | "landscape";
}

export function validatePrompt(prompt: string): void {
  if (!prompt || prompt.length === 0) {
    throw new Error("Prompt cannot be empty.");
  }
  if (prompt.length > 1000) {
    throw new Error(`Prompt must be 1000 characters or less. Got: ${prompt.length}`);
  }
}
