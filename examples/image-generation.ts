import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { decartImage } from "@decartai/tanstack-ai";
import { generateImage } from "@tanstack/ai";

console.log("Generating image...");
const image = await generateImage({
  adapter: decartImage("lucy-pro-t2i"),
  prompt: "A beautiful sunset over the ocean",
});

const output = Buffer.from(image.images[0].b64Json!, "base64");

const outDir = path.join(import.meta.dirname, "output");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "image.png"), output);

console.log("Image saved to", path.join(outDir, "image.png"));
