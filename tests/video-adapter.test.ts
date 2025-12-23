import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDecartVideo, DecartVideoAdapter, decartVideo } from "../src/adapters/video";
import { validatePrompt } from "../src/video/video-provider-options";

vi.mock("@decartai/sdk", () => ({
  createDecartClient: vi.fn(() => ({
    process: vi.fn(),
    queue: {
      submit: vi.fn(async () => ({ job_id: "job-123", status: "pending" })),
      status: vi.fn(async () => ({ job_id: "job-123", status: "completed" })),
      result: vi.fn(async () => new Blob(["fake-video-data"], { type: "video/mp4" })),
    },
    realtime: {},
    tokens: {},
  })),
  models: {
    image: vi.fn((model: string) => ({ name: model, urlPath: `/v1/generate/${model}` })),
    video: vi.fn((model: string) => ({ name: model, queueUrlPath: `/v1/jobs/${model}` })),
  },
}));

describe("DecartVideoAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an adapter with valid config", () => {
    const adapter = new DecartVideoAdapter({ apiKey: "test-key" }, "lucy-pro-t2v");

    expect(adapter.kind).toBe("video");
    expect(adapter.name).toBe("decart");
    expect(adapter.model).toBe("lucy-pro-t2v");
  });

  it("should create a job with valid prompt", async () => {
    const adapter = new DecartVideoAdapter({ apiKey: "test-key" }, "lucy-pro-t2v");

    const result = await adapter.createVideoJob({
      model: "lucy-pro-t2v",
      prompt: "A cat walking",
    });

    expect(result.jobId).toBe("job-123");
    expect(result.model).toBe("lucy-pro-t2v");
  });

  it("should handle size parameter", async () => {
    const adapter = new DecartVideoAdapter({ apiKey: "test-key" }, "lucy-pro-t2v");

    const result = await adapter.createVideoJob({
      model: "lucy-pro-t2v",
      prompt: "A cat walking",
      size: "1280x720",
    });

    expect(result.jobId).toBe("job-123");
  });

  it("should handle modelOptions", async () => {
    const adapter = new DecartVideoAdapter({ apiKey: "test-key" }, "lucy-pro-t2v");

    const result = await adapter.createVideoJob({
      model: "lucy-pro-t2v",
      prompt: "A cat walking",
      modelOptions: { seed: 42, resolution: "720p" },
    });

    expect(result.jobId).toBe("job-123");
  });

  it("should return status for a job", async () => {
    const adapter = new DecartVideoAdapter({ apiKey: "test-key" }, "lucy-pro-t2v");

    const result = await adapter.getVideoStatus("job-123");

    expect(result.jobId).toBe("job-123");
    expect(result.status).toBe("completed");
  });

  it("should return data URL for completed job", async () => {
    const adapter = new DecartVideoAdapter({ apiKey: "test-key" }, "lucy-pro-t2v");

    const result = await adapter.getVideoUrl("job-123");

    expect(result.jobId).toBe("job-123");
    expect(result.url).toMatch(/^data:video\/mp4;base64,/);
  });
});

describe("createDecartVideo", () => {
  it("should create an adapter with explicit API key", () => {
    const adapter = createDecartVideo("lucy-pro-t2v", "my-api-key");

    expect(adapter.model).toBe("lucy-pro-t2v");
    expect(adapter.name).toBe("decart");
  });
});

describe("decartVideo", () => {
  it("should throw error when DECART_API_KEY is not set", () => {
    const originalEnv = process.env.DECART_API_KEY;
    delete process.env.DECART_API_KEY;

    expect(() => decartVideo("lucy-pro-t2v")).toThrow("DECART_API_KEY is required");

    process.env.DECART_API_KEY = originalEnv;
  });

  it("should create adapter when DECART_API_KEY is set", () => {
    const originalEnv = process.env.DECART_API_KEY;
    process.env.DECART_API_KEY = "env-api-key";

    const adapter = decartVideo("lucy-pro-t2v");
    expect(adapter.model).toBe("lucy-pro-t2v");

    process.env.DECART_API_KEY = originalEnv;
  });
});

describe("validatePrompt", () => {
  it("should require prompt", () => {
    expect(() => validatePrompt(undefined)).toThrow("Prompt is required");
    expect(() => validatePrompt("")).toThrow("Prompt is required");
  });

  it("should throw on prompt over 1000 chars", () => {
    const longPrompt = "a".repeat(1001);
    expect(() => validatePrompt(longPrompt)).toThrow("1000 characters or less");
  });

  it("should accept valid prompt", () => {
    expect(() => validatePrompt("A cat walking")).not.toThrow();
  });
});
