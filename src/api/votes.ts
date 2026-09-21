import { apiFetch } from "@/api/client";

export type VoteStatus = "IN_PROGRESS" | "CLOSED";

export type VoteOption = {
  voteOptionId: number;
  content: string;
  count: number;
};

export type Vote = {
  voteId: number;
  title: string;
  status: VoteStatus;
  isMultiple: boolean;
  options: VoteOption[];
};

export type CreateVoteRequest = {
  title: string;
  isMultiple: boolean;
  deadline: string; // "2026-02-20T12:00:00"
  options: { content: string }[];
};

export type UpdateVoteRequest = {
  title?: string;
  isMultiple?: boolean;
  deadline?: string;
};

export function createVote(payload: CreateVoteRequest) {
  return apiFetch<Vote>("/api/admin/votes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateVote(voteId: number, payload: UpdateVoteRequest) {
  return apiFetch<Vote>(`/api/admin/votes/${voteId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function addVoteOption(voteId: number, content: string) {
  return apiFetch<Vote>(`/api/admin/votes/${voteId}/options`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function deleteVoteOption(voteId: number, optionId: number) {
  return apiFetch<void>(`/api/admin/votes/${voteId}/options/${optionId}`, {
    method: "DELETE",
  });
}

export function deleteVote(voteId: number) {
  return apiFetch<void>(`/api/admin/votes/${voteId}`, {
    method: "DELETE",
  });
}

export function closeVote(voteId: number) {
  return apiFetch<Vote>(`/api/admin/votes/${voteId}/close`, {
    method: "PATCH",
  });
}

export function cancelVote(voteId: number) {
  return apiFetch<void>(`/api/vote/votes/${voteId}/participate`, {
    method: "DELETE",
  });
}
