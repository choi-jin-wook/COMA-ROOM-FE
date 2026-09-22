import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Edit3, Image, Loader2, Save, Trash2, X } from "lucide-react";
import { apiFetch } from "@/api/client";
import { AppBottomNav, AppHeader } from "@/components/AppChrome";

type Status = "PENDING" | "APPROVED" | "REJECTED";
type Post = { postId: number; title: string; authorNickname: string; approvalStatus: Status; photoUrls: string[]; createdAt: string };
type PageData = { content: Post[] };
const meta: Record<Status, { label: string; color: string; soft: string }> = {
  PENDING: { label: "승인 대기", color: "#FE9A00", soft: "#FFFBEB" },
  APPROVED: { label: "승인 완료", color: "#00A63E", soft: "#F0FDF4" },
  REJECTED: { label: "거절", color: "#E7000B", soft: "#FFF1F2" },
};
const dateText = (value: string) => value ? value.replace("T", " ").slice(0, 16) : "-";

export function AdminAlbumApprovalList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Status>("PENDING");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { apiFetch<PageData>("/api/event-posts?page=0&size=100&sort=createdAt,desc").then((data) => setPosts(data?.content ?? [])).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }, []);
  const counts = useMemo(() => ({ PENDING: posts.filter((post) => post.approvalStatus === "PENDING").length, APPROVED: posts.filter((post) => post.approvalStatus === "APPROVED").length, REJECTED: posts.filter((post) => post.approvalStatus === "REJECTED").length }), [posts]);
  const visible = posts.filter((post) => post.approvalStatus === tab);
  return <div className="min-h-screen bg-[#F8FFFE]"><AppHeader admin /><main className="mx-auto max-w-[392px] px-5 py-6 pb-24">
    <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0F4C3A]"><Image className="h-6 w-6 text-[#10B981]" />앨범 승인 관리</h1><p className="mt-2 text-sm text-gray-500">{tab === "PENDING" ? "부원들이 업로드한 앨범 요청을 검토하고 승인하세요" : "처리된 앨범 요청을 상태별로 확인하세요"}</p>
    <div className="mt-4 grid grid-cols-3 gap-2">{(Object.keys(meta) as Status[]).map((key) => <div key={key} className="rounded-xl border border-[#D1FAE5] bg-white py-4 text-center shadow-sm"><p className="text-2xl font-bold" style={{ color: meta[key].color }}>{counts[key]}</p><p className="text-xs text-gray-500">{meta[key].label}</p></div>)}</div>
    <div className="mt-4 flex gap-2">{(Object.keys(meta) as Status[]).map((key) => <button key={key} onClick={() => setTab(key)} className="rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: tab === key ? meta[key].color : "#D1FAE5", backgroundColor: tab === key ? meta[key].color : "white", color: tab === key ? "white" : "#0F4C3A" }}>{meta[key].label}</button>)}</div>
    <h2 className="mt-4 font-bold text-[#0F4C3A]">{meta[tab].label} {counts[tab]}건</h2>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    <div className="mt-3 space-y-3">{loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#10B981]" /></div> : visible.length === 0 ? <Empty text={meta[tab].label + " 요청이 없습니다."} /> : visible.map((post) => <article key={post.postId} className="rounded-xl border p-3 shadow-sm" style={{ borderColor: tab === "PENDING" ? "#FDE68A" : tab === "REJECTED" ? "#FECACA" : "#D1FAE5", backgroundColor: meta[tab].soft }}><div className="flex gap-3"><div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#ECFDF5]">{post.photoUrls?.[0] ? <img src={post.photoUrls[0]} alt="" className="h-full w-full object-cover" /> : <Image className="h-8 w-8 text-[#A7F3D0]" />}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><h3 className="truncate text-sm font-bold text-[#0F4C3A]">{post.title}</h3><Badge status={post.approvalStatus} /></div><p className="mt-1 text-xs text-gray-500">{post.authorNickname}</p><p className="mt-1 text-[11px] text-gray-500">{dateText(post.createdAt)}</p><p className="mt-1 text-xs font-medium text-[#0F4C3A]">사진 {post.photoUrls?.length ?? 0}장</p></div></div><button onClick={() => navigate("/admin/albums/" + post.postId)} className="mt-3 w-full rounded-lg bg-[#10B981] py-2 text-sm text-white">상세보기</button></article>)}</div>
  </main><AppBottomNav admin active="dashboard" /></div>;
}

export function AdminAlbumApprovalDetail() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  useEffect(() => { if (!postId) return; apiFetch<Post>("/api/event-posts/" + postId).then(setPost).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }, [postId]);
  const change = async (approvalStatus: Status) => { if (!post) return; setBusy(true); setError(""); try { setPost(await apiFetch<Post>("/api/admin/event-posts/" + post.postId + "/status", { method: "PATCH", body: JSON.stringify({ approvalStatus }) })); } catch (reason) { setError(reason instanceof Error ? reason.message : "상태를 변경하지 못했습니다."); } finally { setBusy(false); } };
  const startEditing = () => { if (!post) return; setEditTitle(post.title); setEditing(true); setError(""); };
  const updatePost = async () => {
    if (!post || !editTitle.trim()) return;
    setBusy(true);
    setError("");
    try {
      const updated = await apiFetch<Post>(`/api/admin/event-posts/${post.postId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: editTitle.trim(), photoUrls: post.photoUrls }),
      });
      setPost(updated);
      setEditing(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "앨범 요청을 수정하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };
  const deletePost = async () => {
    if (!post || !window.confirm("이 앨범 요청을 삭제하시겠습니까?")) return;
    setBusy(true);
    setError("");
    try {
      await apiFetch<void>(`/api/admin/event-posts/${post.postId}`, { method: "DELETE" });
      navigate("/admin/albums");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "앨범 요청을 삭제하지 못했습니다.");
      setBusy(false);
    }
  };
  return <div className="min-h-screen bg-[#F8FFFE]"><AppHeader admin /><main className="mx-auto max-w-[392px] px-5 py-5 pb-24"><button onClick={() => navigate("/admin/albums")} className="flex items-center gap-1 text-xs text-[#047857]"><ChevronLeft className="h-4 w-4" />앨범 승인 관리</button><h1 className="mt-2 text-2xl font-bold text-[#0F4C3A]">앨범 요청 상세</h1><p className="mt-1 text-xs text-gray-500">업로드된 사진과 정보를 확인한 뒤 승인 여부를 결정하세요</p>
    {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#10B981]" /></div> : !post ? <div className="mt-4"><Empty text="앨범 요청을 불러오지 못했습니다." /></div> : <><div className="mt-4 flex gap-2"><button disabled={busy} onClick={editing ? updatePost : startEditing} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#10B981] bg-white py-2 text-sm text-[#047857] disabled:opacity-50">{editing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}{editing ? "수정 저장" : "제목 수정"}</button><button disabled={busy} onClick={deletePost} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 py-2 text-sm text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" />삭제</button></div>{editing && <div className="mt-3 flex gap-2"><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#D1FAE5] bg-white px-3 py-2 text-sm" aria-label="앨범 제목" /><button onClick={() => setEditing(false)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">취소</button></div>}<section className="mt-4 rounded-xl border border-[#D1FAE5] bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><h2 className="font-bold text-[#0F4C3A]">{post.title}</h2><Badge status={post.approvalStatus} /></div><p className="mt-3 text-sm font-semibold text-[#0F4C3A]">{post.authorNickname}</p><p className="mt-2 text-xs text-gray-500">업로드 일시 · {dateText(post.createdAt)}</p><p className="mt-1 text-xs text-gray-500">사진 수 · {post.photoUrls?.length ?? 0}장</p></section><h2 className="mt-5 text-lg font-bold text-[#0F4C3A]">사진 미리보기</h2>{post.photoUrls?.length ? <div className="mt-3 grid grid-cols-2 gap-2">{post.photoUrls.slice(0, 4).map((url, index) => <img key={url + index} src={url} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />)}</div> : <div className="mt-3"><Empty text="등록된 사진이 없습니다." /></div>}<p className="mt-2 text-xs text-gray-500">대표 4장 미리보기 · 전체 {post.photoUrls?.length ?? 0}장</p><section className="mt-4 rounded-xl border p-3" style={{ borderColor: meta[post.approvalStatus].color + "44", backgroundColor: meta[post.approvalStatus].soft }}><p className="text-sm font-semibold" style={{ color: meta[post.approvalStatus].color }}>{post.approvalStatus === "PENDING" ? "검토 안내" : meta[post.approvalStatus].label + " 처리 완료"}</p><p className="mt-1 text-xs text-gray-600">{post.approvalStatus === "PENDING" ? "요청 상태를 승인 또는 거절로 변경합니다." : post.approvalStatus === "APPROVED" ? "이 요청은 승인 처리되어 앨범에 공개되었습니다." : "이 요청은 운영진 검토 후 거절 처리되었습니다."}</p></section>{post.approvalStatus === "PENDING" ? <div className="mt-3 grid grid-cols-2 gap-2"><button disabled={busy} onClick={() => change("REJECTED")} className="flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white py-2.5 text-sm text-red-600"><X className="h-4 w-4" />거절</button><button disabled={busy} onClick={() => change("APPROVED")} className="flex items-center justify-center gap-1 rounded-lg bg-[#10B981] py-2.5 text-sm text-white"><CheckCircle2 className="h-4 w-4" />승인</button></div> : <button disabled className="mt-3 w-full rounded-lg py-2.5 text-sm text-white" style={{ backgroundColor: meta[post.approvalStatus].color }}>{meta[post.approvalStatus].label} 처리됨</button>}{error && <p className="mt-3 text-sm text-red-600">{error}</p>}</>}
  </main><AppBottomNav admin active="dashboard" /></div>;
}

function Badge({ status }: { status: Status }) { return <span className="shrink-0 rounded-full px-2 py-1 text-[10px] text-white" style={{ backgroundColor: meta[status].color }}>{meta[status].label}</span>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-[#D1FAE5] bg-white p-8 text-center text-sm text-gray-500">{text}</div>; }
