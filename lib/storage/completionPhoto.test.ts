import { describe, expect, it } from "vitest";
import {
  COMPLETION_PHOTO_MAX_BYTES,
  validateCompletionPhoto,
} from "./completionPhoto";

describe("validateCompletionPhoto", () => {
  it("accepts allowed image types within size limit", () => {
    expect(
      validateCompletionPhoto({
        contentType: "image/jpeg",
        sizeBytes: 1024,
      }).ok,
    ).toBe(true);
    expect(
      validateCompletionPhoto({
        contentType: "image/png",
        sizeBytes: COMPLETION_PHOTO_MAX_BYTES,
      }).ok,
    ).toBe(true);
  });

  it("rejects disallowed types", () => {
    const result = validateCompletionPhoto({
      contentType: "application/pdf",
      sizeBytes: 100,
    });
    expect(result).toEqual({
      ok: false,
      message: "Photo must be JPEG, PNG, WebP, or GIF.",
    });
  });

  it("rejects empty and oversized files", () => {
    expect(
      validateCompletionPhoto({ contentType: "image/jpeg", sizeBytes: 0 }),
    ).toEqual({ ok: false, message: "Photo file is empty." });
    expect(
      validateCompletionPhoto({
        contentType: "image/jpeg",
        sizeBytes: COMPLETION_PHOTO_MAX_BYTES + 1,
      }),
    ).toEqual({ ok: false, message: "Photo must be at most 5 MB." });
  });
});
