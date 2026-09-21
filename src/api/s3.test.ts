import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/api/client";
import { uploadAlbumImage, uploadAlbumImages } from "@/api/s3";

vi.mock("@/api/client", () => ({
  apiFetch: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);

describe("S3 album upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("presigned URL로 PUT하고 만료되지 않는 객체 URL을 반환한다", async () => {
    mockedApiFetch.mockResolvedValue({
      presignedUrl: "https://bucket.s3.ap-northeast-2.amazonaws.com/albums/1/photo.jpg?X-Amz-Signature=test",
      imageKey: "albums/1/photo.jpg",
      contentType: "image/jpeg",
    });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["image"], "photo.jpg", { type: "image/jpeg" });

    const result = await uploadAlbumImage(file);

    expect(mockedApiFetch).toHaveBeenCalledWith(
      "/api/event-posts/files/presigned-url",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ filename: "photo.jpg" }),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("X-Amz-Signature=test"),
      {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: file,
      },
    );
    expect(result).toEqual({
      url: "https://bucket.s3.ap-northeast-2.amazonaws.com/albums/1/photo.jpg",
      imageKey: "albums/1/photo.jpg",
    });
  });

  it("여러 파일의 결과 순서와 진행 상태를 유지한다", async () => {
    mockedApiFetch.mockImplementation(async (_path, init) => {
      const { filename } = JSON.parse(String(init?.body));
      return {
        presignedUrl: `https://bucket.s3.amazonaws.com/albums/${filename}?signature=test`,
        imageKey: `albums/${filename}`,
        contentType: "image/png",
      };
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const progress = vi.fn();
    const files = [
      new File(["1"], "first.png", { type: "image/png" }),
      new File(["2"], "second.png", { type: "image/png" }),
    ];

    const results = await uploadAlbumImages(files, { concurrency: 2, onProgress: progress });

    expect(results.map((result) => result.imageKey)).toEqual([
      "albums/first.png",
      "albums/second.png",
    ]);
    expect(progress).toHaveBeenCalledTimes(2);
    expect(progress).toHaveBeenLastCalledWith(2, 2);
  });

  it("S3 PUT 실패를 호출자에게 전달한다", async () => {
    mockedApiFetch.mockResolvedValue({
      presignedUrl: "https://bucket.s3.amazonaws.com/albums/photo.png?signature=test",
      imageKey: "albums/photo.png",
      contentType: "image/png",
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));

    await expect(
      uploadAlbumImage(new File(["image"], "photo.png", { type: "image/png" })),
    ).rejects.toThrow("S3 사진 업로드에 실패했습니다. (403)");
  });
});
