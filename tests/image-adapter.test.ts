import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDecartImage, DecartImageAdapter, decartImage } from "../src/adapters/image";
import { validatePrompt } from "../src/image/image-provider-options";

vi.mock("@decartai/sdk", () => ({
  createDecartClient: vi.fn(() => ({
    process: vi.fn(async () => new Blob(["fake-image-data"], { type: "image/png" })),
    queue: { submit: vi.fn(), status: vi.fn(), result: vi.fn() },
    realtime: {},
    tokens: {},
  })),
  models: {
    image: vi.fn((model: string) => ({
      name: model,
      urlPath: `/v1/generate/${model}`,
    })),
    video: vi.fn((model: string) => ({
      name: model,
      queueUrlPath: `/v1/jobs/${model}`,
    })),
  },
}));

describe("DecartImageAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an adapter with valid config", () => {
    const adapter = new DecartImageAdapter({ apiKey: "test-key" }, "lucy-pro-t2i");

    expect(adapter.kind).toBe("image");
    expect(adapter.name).toBe("decart");
    expect(adapter.model).toBe("lucy-pro-t2i");
  });

  it("should generate an image with valid prompt", async () => {
    const adapter = new DecartImageAdapter({ apiKey: "test-key" }, "lucy-pro-t2i");

    const result = await adapter.generateImages({
      model: "lucy-pro-t2i",
      prompt: "A beautiful sunset",
    });

    expect(result.id).toMatch(/^decart-/);
    expect(result.model).toBe("lucy-pro-t2i");
    expect(result.images).toHaveLength(1);
    expect(result.images[0].b64Json).toBeDefined();
  });

  it("should handle size parameter", async () => {
    const adapter = new DecartImageAdapter({ apiKey: "test-key" }, "lucy-pro-t2i");

    const result = await adapter.generateImages({
      model: "lucy-pro-t2i",
      prompt: "A sunset",
      size: "1280x720",
    });

    expect(result.images).toHaveLength(1);
  });

  it("should handle modelOptions", async () => {
    const adapter = new DecartImageAdapter({ apiKey: "test-key" }, "lucy-pro-t2i");

    const result = await adapter.generateImages({
      model: "lucy-pro-t2i",
      prompt: "A sunset",
      modelOptions: { seed: 42, resolution: "720p" },
    });

    expect(result.images).toHaveLength(1);
  });
});

describe("createDecartImage", () => {
  it("should create an adapter with explicit API key", () => {
    const adapter = createDecartImage("lucy-pro-t2i", "my-api-key");

    expect(adapter.model).toBe("lucy-pro-t2i");
    expect(adapter.name).toBe("decart");
  });
});

describe("decartImage", () => {
  it("should throw error when DECART_API_KEY is not set", () => {
    const originalEnv = process.env.DECART_API_KEY;
    delete process.env.DECART_API_KEY;

    expect(() => decartImage("lucy-pro-t2i")).toThrow("DECART_API_KEY is required");

    process.env.DECART_API_KEY = originalEnv;
  });

  it("should create adapter when DECART_API_KEY is set", () => {
    const originalEnv = process.env.DECART_API_KEY;
    process.env.DECART_API_KEY = "env-api-key";

    const adapter = decartImage("lucy-pro-t2i");
    expect(adapter.model).toBe("lucy-pro-t2i");

    process.env.DECART_API_KEY = originalEnv;
  });
});

describe("validatePrompt", () => {
  it("should throw on empty prompt", () => {
    expect(() => validatePrompt("")).toThrow("Prompt cannot be empty");
  });

  it("should throw on prompt over 1000 chars", () => {
    const longPrompt = "a".repeat(1001);
    expect(() => validatePrompt(longPrompt)).toThrow("1000 characters or less");
  });

  it("should accept valid prompt", () => {
    expect(() => validatePrompt("A beautiful sunset")).not.toThrow();
  });
});
