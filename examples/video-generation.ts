import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { decartVideo } from "@decartai/tanstack-ai";
import { generateVideo, getVideoJobStatus } from "@tanstack/ai";

const { jobId } = await generateVideo({
  adapter: decartVideo("lucy-pro-t2v"),
  prompt: "A beautiful sunset over the ocean",
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

if (!videoUrl) {
  throw new Error("Video URL not available");
}

const output = await fetch(videoUrl).then((res) => res.bytes());

const outDir = path.join(import.meta.dirname, "output");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "video.mp4"), output);

console.log("Video saved to", path.join(outDir, "video.mp4"));
