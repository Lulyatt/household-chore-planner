import { put } from "@vercel/blob";

/** Maximum completion photo size (5 MiB). */
export const COMPLETION_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type CompletionPhotoValidationResult =
  | { ok: true; contentType: string }
  | { ok: false; message: string };

/** Validates MIME type and size for a completion proof photo. */
export function validateCompletionPhoto(input: {
  contentType: string;
  sizeBytes: number;
}): CompletionPhotoValidationResult {
  const contentType = input.contentType.trim().toLowerCase();
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return {
      ok: false,
      message: "Photo must be JPEG, PNG, WebP, or GIF.",
    };
  }
  if (input.sizeBytes <= 0) {
    return { ok: false, message: "Photo file is empty." };
  }
  if (input.sizeBytes > COMPLETION_PHOTO_MAX_BYTES) {
    return {
      ok: false,
      message: "Photo must be at most 5 MB.",
    };
  }
  return { ok: true, contentType };
}

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

/** Uploads a validated photo to Vercel Blob; requires `BLOB_READ_WRITE_TOKEN`. */
export async function uploadCompletionPhoto(input: {
  householdId: string;
  occurrenceId: string;
  body: Buffer;
  contentType: string;
}): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return {
      ok: false,
      message:
        "Photo upload is not configured. Set BLOB_READ_WRITE_TOKEN or complete with a note only.",
    };
  }

  const ext = extensionForContentType(input.contentType);
  const pathname = `completions/${input.householdId}/${input.occurrenceId}-${Date.now()}.${ext}`;

  try {
    const blob = await put(pathname, input.body, {
      access: "public",
      contentType: input.contentType,
      token,
    });
    return { ok: true, url: blob.url };
  } catch {
    return { ok: false, message: "Photo upload failed. Try again or use a note." };
  }
}
