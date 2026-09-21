import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { apiFetch } from "@/api/client";
import { AppBottomNav, AppHeader } from "@/components/AppChrome";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type EventItem = { eventId: number; title: string; eventDate: string; rewardXp: number; location: string; category: string; hostname: string; hostNickname?: string };
const labels: Record<string, string> = { ALL: "전체", REGULAR_MEETING: "정기회의", EVENT: "행사", STUDY: "스터디", LAB: "Lab", STAFF: "스태프" };
const splitDate = (value = "") => { const [date = "", time = ""] = value.split("T"); return { date, time: time.slice(0, 5) }; };

function DeleteDialog({ event, open, busy, close, confirm }: { event: EventItem | null; open: boolean; busy: boolean; close: () => void; confirm: () => void }) {
  return <AlertDialog open={open} onOpenChange={(value) => !value && close()}><AlertDialogContent className="w-[calc(100%-2rem)] max-w-[316px] rounded-2xl"><AlertDialogHeader><AlertDialogTitle className="text-left text-xl text-[#0F4C3A]">행사를 삭제할까요?</AlertDialogTitle><AlertDialogDescription className="text-left">{event?.title} 행사를 삭제하시겠습니까?<br />삭제된 행사는 복구할 수 없습니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="grid grid-cols-2 gap-2"><button onClick={close} className="rounded-lg bg-gray-100 py-2.5 text-sm text-gray-500">취소</button><button disabled={busy} onClick={confirm} className="rounded-lg bg-red-600 py-2.5 text-sm text-white">{busy ? "삭제 중..." : "삭제하기"}</button></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export function AdminEventList() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("ALL");
  const [viewDate, setViewDate] = useState(() => new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<EventItem | null>(null);
  const [busy, setBusy] = useState(false);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  useEffect(() => {
    setLoading(true);
    apiFetch<EventItem[]>("/api/event/monthly?year=" + year + "&month=" + month)
      .then((data) => setEvents((data ?? []).map((item) => ({ ...item, hostNickname: item.hostname })))).catch((reason: Error) => { setEvents([]); setError(reason.message); }).finally(() => setLoading(false));
  }, [year, month]);
  const visible = useMemo(() => events.filter((item) => category === "ALL" || item.category === category), [category, events]);
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try { await apiFetch<void>("/api/admin/event/" + deleting.eventId, { method: "DELETE" }); setEvents((items) => items.filter((item) => item.eventId !== deleting.eventId)); setDeleting(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "행사를 삭제하지 못했습니다."); }
    finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-[#F8FFFE]"><AppHeader admin /><main className="mx-auto max-w-[392px] px-5 py-5 pb-24">
    <div className="flex items-start justify-between"><div><h1 className="text-2xl font-bold text-[#0F4C3A]">이벤트 관리</h1><p className="text-xs text-gray-500">월별 이벤트를 조회하고 생성·수정·삭제하세요</p></div><button onClick={() => navigate("/admin/events/new")} className="flex items-center gap-1 rounded-lg bg-[#10B981] px-3 py-2 text-xs text-white"><Plus className="h-4 w-4" />이벤트 생성</button></div>
    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#D1FAE5] bg-white px-3 py-3"><button onClick={() => setViewDate(new Date(year, month - 2, 1))}><ChevronLeft className="h-4 w-4" /></button><strong className="text-[#0F4C3A]">{year}년 {month}월</strong><button onClick={() => setViewDate(new Date(year, month, 1))}><ChevronRight className="h-4 w-4" /></button></div>
    <div className="mt-3 flex gap-2">{["ALL", "REGULAR_MEETING", "EVENT", "STUDY"].map((key) => <button key={key} onClick={() => setCategory(key)} className="rounded-full px-3 py-1.5 text-xs" style={{ backgroundColor: category === key ? "#10B981" : "transparent", color: category === key ? "white" : "#6B7280" }}>{labels[key]}</button>)}</div>
    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    <div className="mt-3 space-y-3">{loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#10B981]" /></div> : visible.length === 0 ? <Empty text="등록된 이벤트가 없습니다." /> : visible.map((item) => { const date = splitDate(item.eventDate); return <article key={item.eventId} className="rounded-xl border border-[#D1FAE5] bg-white p-3"><div className="flex justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><h2 className="truncate font-bold text-[#0F4C3A]">{item.title}</h2><span className="rounded-full bg-[#F0FDF4] px-2 py-1 text-[10px] text-[#10B981]">{labels[item.category] ?? item.category}</span></div><strong className="text-sm text-[#10B981]">+{item.rewardXp} XP</strong></div><div className="mt-2 space-y-1 text-xs text-gray-500"><p>{date.date} {date.time}</p><p>장소 · {item.location || "-"}</p><p>주최 · {item.hostNickname || "-"}</p></div><div className="mt-3 grid grid-cols-3 gap-2"><button onClick={() => navigate("/admin/events/" + item.eventId, { state: { event: item } })} className="rounded-lg border border-[#10B981] py-2 text-xs text-[#10B981]">상세</button><button onClick={() => navigate("/admin/events/" + item.eventId + "/edit", { state: { event: item } })} className="rounded-lg bg-[#F0FDF4] py-2 text-xs text-[#10B981]">수정</button><button onClick={() => setDeleting(item)} className="rounded-lg bg-red-200 py-2 text-xs text-red-600">삭제</button></div></article>; })}</div>
  </main><AppBottomNav admin active="dashboard" /><DeleteDialog event={deleting} open={Boolean(deleting)} busy={busy} close={() => setDeleting(null)} confirm={remove} /></div>;
}

export function AdminEventDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams();
  const event = (location.state as { event?: EventItem } | null)?.event ?? null;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const remove = async () => { if (!eventId) return; setBusy(true); try { await apiFetch<void>("/api/admin/event/" + eventId, { method: "DELETE" }); navigate("/admin/events"); } finally { setBusy(false); } };
  return <div className="min-h-screen bg-[#F8FFFE]"><AppHeader admin /><main className="mx-auto max-w-[392px] px-6 py-5 pb-24"><button onClick={() => navigate("/admin/events")} className="text-xs text-[#0F4C3A]">‹ 이벤트 목록</button><h1 className="mt-3 text-2xl font-bold text-[#0F4C3A]">이벤트 상세</h1><p className="text-xs text-gray-500">선택한 이벤트를 기준으로 출석을 생성하거나 정보를 수정할 수 있습니다</p>
    {!event ? <div className="mt-4"><Empty text="이벤트 목록에서 항목을 선택해 주세요." /></div> : <><section className="mt-4 rounded-2xl border border-[#D1FAE5] bg-white p-4"><div className="flex justify-between"><h2 className="text-lg font-bold text-[#0F4C3A]">{event.title}</h2><span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs text-[#10B981]">{labels[event.category] ?? event.category}</span></div><dl className="mt-4 space-y-4">{[["일시", event.eventDate.replace("T", " ").slice(0, 16)], ["장소", event.location || "-"], ["지급 XP", event.rewardXp + " XP"], ["주최자", event.hostNickname || "-"]].map(([key, value]) => <div key={key} className="flex justify-between text-sm"><dt className="text-gray-500">{key}</dt><dd className="font-medium text-[#0F4C3A]">{value}</dd></div>)}</dl></section><button onClick={() => navigate("/admin/attendance")} className="mt-4 w-full rounded-lg bg-[#10B981] py-3 text-sm text-white">출석 생성</button><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => navigate("/admin/events/" + event.eventId + "/edit", { state: { event } })} className="rounded-lg bg-[#10B981] py-2.5 text-sm text-white">수정하기</button><button onClick={() => setOpen(true)} className="rounded-lg bg-red-200 py-2.5 text-sm text-red-600">삭제하기</button></div></>}
  </main><AppBottomNav admin active="dashboard" /><DeleteDialog event={event} open={open} busy={busy} close={() => setOpen(false)} confirm={remove} /></div>;
}

export function AdminEventForm({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const source = (location.state as { event?: EventItem } | null)?.event;
  const date = splitDate(source?.eventDate);
  const [form, setForm] = useState({ title: source?.title ?? "", date: date.date, time: date.time, place: source?.location ?? "", category: source?.category ?? "REGULAR_MEETING", xp: source?.rewardXp ?? 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = (key: string, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => { event.preventDefault(); if (edit && !source) return; setBusy(true); setError(""); try { await apiFetch("/api/admin/event" + (edit ? "/" + source?.eventId : ""), { method: edit ? "PATCH" : "POST", body: JSON.stringify({ title: form.title.trim(), eventDate: form.date + "T" + (form.time || "00:00") + ":00", rewardXp: form.xp, location: form.place.trim(), eventCategory: form.category }) }); navigate("/admin/events"); } catch (reason) { setError(reason instanceof Error ? reason.message : "이벤트를 저장하지 못했습니다."); } finally { setBusy(false); } };
  return <div className="min-h-screen bg-[#F8FFFE]"><AppHeader admin /><main className="mx-auto max-w-[392px] px-6 py-5 pb-24"><button onClick={() => navigate("/admin/events")} className="text-xs text-[#0F4C3A]">‹ 이벤트 관리</button><h1 className="mt-3 text-2xl font-bold text-[#0F4C3A]">이벤트 {edit ? "수정" : "생성"}</h1><p className="text-xs text-gray-500">{edit ? "등록된 행사 정보를 수정합니다" : "새 이벤트 정보를 입력하고 등록합니다"}</p><form onSubmit={submit} className="mt-4"><section className="space-y-4 rounded-2xl border border-[#D1FAE5] bg-white p-4"><Field label="이벤트명"><input required value={form.title} onChange={(e) => update("title", e.target.value)} /></Field><div className="grid grid-cols-[1.7fr_1fr] gap-2"><Field label="날짜"><input required type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></Field><Field label="시간"><input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} /></Field></div><Field label="장소"><input required value={form.place} onChange={(e) => update("place", e.target.value)} /></Field><Field label="카테고리"><select value={form.category} onChange={(e) => update("category", e.target.value)}>{["REGULAR_MEETING", "EVENT", "STUDY", "LAB", "STAFF"].map((key) => <option key={key} value={key}>{labels[key]}</option>)}</select></Field><Field label="지급 XP"><input type="number" min={0} value={form.xp} onChange={(e) => update("xp", Number(e.target.value))} /></Field></section><div className="mt-3 rounded-xl bg-[#F0FDF4] p-3 text-xs text-gray-500">기본 XP 참고: 정기회의 3 · 행사/스터디/Lab 5 · 스태프 2</div>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}<div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => navigate("/admin/events")} className="rounded-lg border border-[#D1FAE5] bg-white py-3 text-sm text-gray-500">취소</button><button disabled={busy || (edit && !source)} className="rounded-lg bg-[#10B981] py-3 text-sm text-white disabled:opacity-50">{busy ? "저장 중..." : edit ? "수정 저장" : "이벤트 생성"}</button></div></form></main><AppBottomNav admin active="dashboard" /></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-1 block text-xs font-medium text-[#0F4C3A]">{label}</span><div className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[#D1FAE5] [&_input]:px-3 [&_select]:h-11 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-[#D1FAE5] [&_select]:px-3">{children}</div></label>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-[#D1FAE5] bg-white p-8 text-center text-sm text-gray-500">{text}</div>; }
