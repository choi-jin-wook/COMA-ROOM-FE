import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Image, Loader2, X } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { getEventPost, updateEventPostStatus, type AlbumApprovalStatus, type EventPostApproval } from "@/api/eventPosts";

const statusStyle: Record<AlbumApprovalStatus, { label: string; className: string }> = {
  PENDING: { label: "승인 대기", className: "bg-[#FE9A00] text-white" },
  APPROVED: { label: "승인 완료", className: "bg-[#D1FAE5] text-[#008236]" },
  REJECTED: { label: "거절", className: "bg-[#FFC9C9] text-[#E7000B]" },
};

export default function Admin_AlbumApproval_Detail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const statePost = (location.state as { post?: EventPostApproval } | null)?.post;
  const [post, setPost] = useState<EventPostApproval | null>(statePost ?? null);
  const [loading, setLoading] = useState(!statePost);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<"APPROVED" | "REJECTED" | null>(null);

  useEffect(() => {
    if (statePost || !id) return;
    getEventPost(Number(id))
      .then(setPost)
      .catch((e) => setError(e instanceof Error ? e.message : "앨범 요청을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id, statePost]);

  const updateStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!post) return;
    setUpdating(status);
    setError(null);
    try {
      const updated = await updateEventPostStatus(post.postId, status);
      setPost(updated ?? { ...post, approvalStatus: status });
    } catch (e) {
      setError(e instanceof Error ? e.message : "앨범 요청 상태를 변경하지 못했습니다.");
    } finally {
      setUpdating(null);
    }
  };

  const createdAt = post?.createdAt ? post.createdAt.replace("T", " ").slice(0, 16) : "";

  return (
    <AdminShell>
      <div className="mb-3 flex items-center gap-2">
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0FDF4]" onClick={() => navigate("/admin/albums")} aria-label="앨범 승인 목록">
          <ArrowLeft className="h-4 w-4 text-[#10B981]" />
        </button>
        <h1 className="text-xl font-bold text-[#0F4C3A]">앨범 요청 상세</h1>
      </div>
      <p className="mb-4 text-xs text-[#6B7280]">업로더 사진과 정보를 확인한 뒤 승인 여부를 결정하세요</p>

      {loading && <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-[#10B981]" /></div>}
      {error && <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {post && (
        <>
          <article className="rounded-[14px] border border-[#D1FAE5] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold text-[#0F4C3A]">{post.title}</h2>
              <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium ${statusStyle[post.approvalStatus].className}`}>{statusStyle[post.approvalStatus].label}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#0F4C3A]">
              <span>{post.authorName || post.authorNickname}</span>
              {post.authorStudentId && <span className="rounded-lg border border-[#D1FAE5] px-2 py-0.5 text-[11px] font-normal">{post.authorStudentId}</span>}
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-[#6B7280]">
              <p>업로드 일시 · {createdAt}</p>
              <p>사진 수 · {post.photoUrls?.length ?? 0}장</p>
            </div>
            {post.description && (
              <div className="mt-3 rounded-lg bg-[#F0FDF4] p-3">
                <p className="mb-1 text-xs font-semibold text-[#0F4C3A]">앨범 설명</p>
                <p className="whitespace-pre-wrap text-xs leading-5 text-[#6B7280]">{post.description}</p>
              </div>
            )}
          </article>

          <section className="mt-4">
            <h2 className="mb-3 text-lg font-semibold text-[#0F4C3A]">사진 미리보기</h2>
            {post.photoUrls?.length ? (
              <div className="grid grid-cols-2 gap-2">
                {post.photoUrls.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`${post.title} ${index + 1}`} className="aspect-[4/3] h-full w-full rounded-[10px] object-cover" />)}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl bg-[#F0FDF4]"><Image className="h-8 w-8 text-[#A7F3D0]" /></div>
            )}
            <p className="mt-2 text-[11px] text-[#6B7280]">전체 {post.photoUrls?.length ?? 0}장</p>
          </section>

          <div className="mt-4 rounded-[14px] border border-[#D1FAE5] bg-[#F0FDF4] p-3 text-xs">
            <strong className="text-[#10B981]">검토 안내</strong>
            <p className="mt-1 text-[#6B7280]">요청 상태를 승인 또는 거절로 변경합니다.</p>
          </div>

          {post.approvalStatus === "PENDING" && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#FFC9C9] bg-[#F8FFFE] text-sm font-medium text-[#E7000B] disabled:opacity-60" onClick={() => void updateStatus("REJECTED")} disabled={Boolean(updating)}>
                {updating === "REJECTED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} 거절
              </button>
              <button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#10B981] text-sm font-medium text-white disabled:opacity-60" onClick={() => void updateStatus("APPROVED")} disabled={Boolean(updating)}>
                {updating === "APPROVED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} 승인
              </button>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
