import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

export interface SeedImageData {
  publicId: string;
  version: number;
  format: string;
  width: number;
  height: number;
  bytes: number;
  blurDataUrl: string;
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

  const blurUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_30,e_blur:1000,q_1,f_auto/v${result.version}/${result.public_id}.${result.format}`;
  let blurDataUrl = '';
  try {
    const res = await fetch(blurUrl);
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') || 'image/webp';
      blurDataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
    }
  } catch {
    // non-critical — fallback to URL blur at runtime
  }

  return {
    publicId: result.public_id,
    version: result.version,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    blurDataUrl,
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
