import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Images, Loader2 } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { getEventPosts, type AlbumApprovalStatus, type EventPostApproval } from "@/api/eventPosts";

const statusConfig: Record<AlbumApprovalStatus, { label: string; badge: string; card: string }> = {
  PENDING: { label: "승인 대기", badge: "bg-[#FE9A00] text-white", card: "border-[#FEE685] bg-[rgba(255,251,235,0.3)]" },
  APPROVED: { label: "승인 완료", badge: "bg-[#D1FAE5] text-[#008236]", card: "border-[#D1FAE5] bg-white" },
  REJECTED: { label: "거절", badge: "bg-[#FFC9C9] text-[#E7000B]", card: "border-[#FFC9C9] bg-white" },
};

const filters: { value: AlbumApprovalStatus; label: string }[] = [
  { value: "PENDING", label: "승인 대기" },
  { value: "APPROVED", label: "승인 완료" },
  { value: "REJECTED", label: "거절" },
];

function formatCreatedAt(value: string) {
  return value ? value.replace("T", " ").slice(0, 16) : "";
}

export default function Admin_AlbumApproval() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<EventPostApproval[]>([]);
  const [status, setStatus] = useState<AlbumApprovalStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEventPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setPosts([]);
      setError(e instanceof Error ? e.message : "앨범 요청을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const counts = useMemo(() => ({
    PENDING: posts.filter((post) => post.approvalStatus === "PENDING").length,
    APPROVED: posts.filter((post) => post.approvalStatus === "APPROVED").length,
    REJECTED: posts.filter((post) => post.approvalStatus === "REJECTED").length,
  }), [posts]);
  const filteredPosts = posts.filter((post) => post.approvalStatus === status);

  return (
    <AdminShell>
      <div className="mb-3 flex items-center gap-2">
        <Images className="h-6 w-6 text-[#10B981]" />
        <h1 className="text-2xl font-bold text-[#0F4C3A]">앨범 승인 관리</h1>
      </div>
      <p className="mb-4 text-xs text-[#6B7280]">부원들이 업로드한 앨범 요청을 검토하고 승인하세요</p>

      <div className="mb-4 grid grid-cols-3 gap-3">
        {filters.map((item) => {
          const color = item.value === "PENDING" ? "#FE9A00" : item.value === "APPROVED" ? "#00A63E" : "#E7000B";
          return (
            <button key={item.value} className="rounded-[14px] border border-[#D1FAE5] bg-white p-3 text-center shadow-sm" onClick={() => setStatus(item.value)}>
              <strong className="block text-2xl" style={{ color }}>{counts[item.value]}</strong>
              <span className="text-[11px] text-[#6B7280]">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            className={`rounded-lg border px-2.5 py-1 text-xs ${status === item.value ? "border-[#10B981] bg-[#10B981] text-white" : "border-[#D1FAE5] bg-transparent text-[#0F4C3A]"}`}
            onClick={() => setStatus(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-[#0F4C3A]">{statusConfig[status].label} 요청 {filteredPosts.length}건</h2>

      {loading && <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-[#10B981]" /></div>}
      {!loading && error && <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-600">{error}</div>}
      {!loading && !error && filteredPosts.length === 0 && (
        <div className="rounded-xl border border-[#D1FAE5] bg-white p-8 text-center text-sm text-[#6B7280]">해당 상태의 앨범 요청이 없습니다.</div>
      )}

      <div className="space-y-3">
        {filteredPosts.map((post) => {
          const config = statusConfig[post.approvalStatus];
          const thumbnail = post.photoUrls?.[0];
          return (
            <article key={post.postId} className={`rounded-[14px] border p-4 shadow-sm ${config.card}`}>
              <div className="flex gap-3">
                <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#F0FDF4]">
                  {thumbnail ? <img src={thumbnail} alt="" className="h-full w-full object-cover" /> : <Image className="h-8 w-8 text-[#A7F3D0]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-[#0F4C3A]">{post.title}</h3>
                    <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium ${config.badge}`}>{config.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B7280]">{post.authorName || post.authorNickname}{post.authorStudentId && ` · ${post.authorStudentId}`}</p>
                  <p className="mt-1 text-[11px] text-[#6B7280]">{formatCreatedAt(post.createdAt)}</p>
                  <p className="mt-1 text-xs font-medium text-[#0F4C3A]">사진 {post.photoUrls?.length ?? 0}장</p>
                </div>
              </div>
              <button className="mt-3 h-8 w-full rounded-lg bg-[#10B981] text-sm font-medium text-white" onClick={() => navigate(`/admin/albums/${post.postId}`, { state: { post } })}>상세보기</button>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}
