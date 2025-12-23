# @decartai/tanstack-ai

Decart adapter for [TanStack AI](https://tanstack.com/ai) - image and video generation.

## Installation

```bash
npm install @decartai/tanstack-ai @tanstack/ai
```

## Setup

Set your Decart API key as an environment variable:

```bash
export DECART_API_KEY=your-api-key
```

Or pass it directly when creating adapters.

## Image Generation

```typescript
import { generateImage } from "@tanstack/ai";
import { decartImage } from "@decartai/tanstack-ai";

const result = await generateImage({
  adapter: decartImage("lucy-pro-t2i"),
  prompt: "A serene mountain landscape at sunset, cinematic lighting",
  size: "1280x720",
});

console.log(result.images[0].b64Json); // Base64 image data
```

### With Explicit API Key

```typescript
import { createDecartImage } from "@decartai/tanstack-ai";

const adapter = createDecartImage("lucy-pro-t2i", "your-api-key");
```

## Video Generation

Video generation uses an async job/polling pattern.

```typescript
import { setTimeout } from "node:timers/promises";
import { generateVideo, getVideoJobStatus } from "@tanstack/ai";
import { decartVideo } from "@decartai/tanstack-ai";

const { jobId } = await generateVideo({
  adapter: decartVideo("lucy-pro-t2v"),
  prompt: "A cat walking in a lego world",
});

let videoUrl: string | undefined;
while (true) {
  const status = await getVideoJobStatus({
    adapter: decartVideo("lucy-pro-t2v"),
    jobId,
  });

  if (status.status === "failed") {
    throw new Error("Video generation failed");
  }

  if (status.status === "completed") {
    videoUrl = status.url;
    break;
  }

  await setTimeout(2000);
}

console.log("Video ready:", videoUrl);
```

## Available Models

| Model          | Type          | Description        |
| -------------- | ------------- | ------------------ |
| `lucy-pro-t2i` | Text-to-image | Generate from text |
| `lucy-pro-t2v` | Text-to-video | Generate from text |

## Provider Options

| Option       | Type                 | Description             |
| ------------ | -------------------- | ----------------------- |
| `seed`       | `number`             | Reproducible generation |
| `resolution` | `"720p"` \| `"480p"` | Output resolution       |

## TypeScript

Full TypeScript support with model-specific type safety:

```typescript
import type { DecartImageModel, DecartVideoModel } from "@decartai/tanstack-ai";
```

## License

MIT
