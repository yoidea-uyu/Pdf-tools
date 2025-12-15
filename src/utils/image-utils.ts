import { generateUUID } from "./uuid";
import type { ImageTaskItem } from "./types";

export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export async function processImageFile(
  file: File,
  id: string
): Promise<ImageTaskItem> {
  const previewUrl = createImagePreviewUrl(file);

  return {
    id,
    file,
    previewUrl,
    rotation: 0,
  };
}

