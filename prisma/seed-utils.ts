import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface SeedImageData {
  publicId: string;
  version: number;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAndUploadImage(
  width: number,
  height: number,
  subFolder: string
): Promise<SeedImageData> {
  const picsumUrl = `https://picsum.photos/${width}/${height}`;

  const result = await cloudinary.uploader.upload(picsumUrl, {
    folder: `gants-meleciens/${subFolder}`,
    resource_type: "image",
  });

  return {
    publicId: result.public_id,
    version: result.version,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}

export async function fetchAndUploadImageThrottled(
  width: number,
  height: number,
  subFolder: string,
  retries = 3,
  delayMs = 500
): Promise<SeedImageData> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fetchAndUploadImage(width, height, subFolder);
      await delay(delayMs);
      return result;
    } catch (error) {
      console.warn(
        `  Upload attempt ${attempt}/${retries} failed:`,
        error instanceof Error ? error.message : error
      );
      if (attempt === retries) throw error;
      await delay(delayMs * attempt);
    }
  }
  throw new Error("Unreachable");
}

export async function cleanupSeedImages() {
  const prefixes = [
    "gants-meleciens/seed/gallery",
    "gants-meleciens/seed/coaches",
    "gants-meleciens/seed/disciplines",
    "gants-meleciens/seed/actualites",
  ];
  for (const prefix of prefixes) {
    try {
      await cloudinary.api.delete_resources_by_prefix(prefix);
    } catch {
      // ignore — folder may not exist yet
    }
  }
}
