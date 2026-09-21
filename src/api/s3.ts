import { apiFetch } from "@/api/client";

export interface S3UploadResult {
  url: string;
  imageKey: string;
}

interface PresignedUrlResponse {
  presignedUrl: string;
  imageKey: string;
  contentType?: string;
}

interface UploadFilesOptions {
  concurrency?: number;
  onProgress?: (completed: number, total: number) => void;
}

export function sortPhotoUrls(photoUrls: string[]): string[] {
  return photoUrls
    .map((url, index) => {
      const filename = decodeURIComponent(url.split("/").pop() ?? "");
      const order = Number(filename.match(/^(\d+)-/)?.[1]);
      return { url, index, order: Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER };
    })
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .map(({ url }) => url);
}

export async function uploadAlbumImage(file: File): Promise<S3UploadResult> {
  const upload = await apiFetch<PresignedUrlResponse>("/api/event-posts/files/presigned-url", {
    method: "POST",
    body: JSON.stringify({ filename: file.name }),
  });

  const response = await fetch(upload.presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": upload.contentType || file.type || "application/octet-stream" },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 사진 업로드에 실패했습니다. (${response.status})`);
  }

  return { url: upload.presignedUrl.split("?")[0], imageKey: upload.imageKey };
}

export async function uploadAlbumImages(files: File[], options: UploadFilesOptions = {}): Promise<S3UploadResult[]> {
  const results = new Array<S3UploadResult>(files.length);
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 3, files.length || 1));
  let nextIndex = 0;
  let completed = 0;

  const worker = async () => {
    while (nextIndex < files.length) {
      const index = nextIndex++;
      results[index] = await uploadAlbumImage(files[index]);
      completed += 1;
      options.onProgress?.(completed, files.length);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}
