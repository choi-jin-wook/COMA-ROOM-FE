import { apiFetch } from "@/api/client";

export type AlbumApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface EventPostApproval {
  postId: number;
  title: string;
  description?: string;
  authorNickname: string;
  authorName?: string;
  authorStudentId?: string;
  approvalStatus: AlbumApprovalStatus;
  photoUrls: string[];
  createdAt: string;
}

export function getEventPosts() {
  return apiFetch<EventPostApproval[]>("/api/event-posts");
}

export function getEventPost(postId: number) {
  return apiFetch<EventPostApproval>(`/api/event-posts/${postId}`);
}

export function updateEventPostStatus(postId: number, approvalStatus: Exclude<AlbumApprovalStatus, "PENDING">) {
  return apiFetch<EventPostApproval>(`/api/admin/event-posts/${postId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ approvalStatus }),
  });
}
