import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import {
  deleteAdminEvent,
  EVENT_CATEGORIES,
  getEventCategory,
  getEventCategoryLabel,
  getEventsByMonth,
  type AdminEvent,
} from "@/api/events";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function splitEventDate(value: string) {
  const [date = value, rawTime = ""] = value.split("T");
  return { date: date.replaceAll("-", "."), time: rawTime.slice(0, 5) };
}

export default function Admin_Events() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEventsByMonth(month.getFullYear(), month.getMonth() + 1);
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setEvents([]);
      setError(e instanceof Error ? e.message : "행사 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(
    () => events.filter((event) => category === "ALL" || getEventCategory(event) === category),
    [category, events],
  );

  const moveMonth = (amount: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminEvent(deleteTarget.eventId);
      setDeleteTarget(null);
      await loadEvents();
    } catch (e) {
      setError(e instanceof Error ? e.message : "행사를 삭제하지 못했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F4C3A]">행사 관리</h1>
          <p className="mt-0.5 text-[11px] text-[#6B7280]">월별 행사를 조회하고 생성 · 수정 · 삭제하세요</p>
        </div>
        <button
          className="flex h-9 items-center gap-1 rounded-lg bg-[#10B981] px-2.5 text-xs font-medium text-white"
          onClick={() => navigate("/admin/events/new")}
        >
          <CalendarPlus className="h-3.5 w-3.5" /> 행사 만들기
        </button>
      </div>

      <div className="mb-3 flex h-12 items-center justify-between rounded-xl border border-[#D1FAE5] bg-white px-3">
        <button onClick={() => moveMonth(-1)} aria-label="이전 달"><ChevronLeft className="h-4 w-4 text-[#6B7280]" /></button>
        <strong className="text-sm text-[#0F4C3A]">{month.getFullYear()}년 {month.getMonth() + 1}월</strong>
        <button onClick={() => moveMonth(1)} aria-label="다음 달"><ChevronRight className="h-4 w-4 text-[#6B7280]" /></button>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {[{ value: "ALL", label: "전체" }, ...EVENT_CATEGORIES].map((item) => (
          <button
            key={item.value}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${category === item.value ? "bg-[#10B981] font-medium text-white" : "bg-white text-[#6B7280]"}`}
            onClick={() => setCategory(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-[#10B981]" /></div>}
      {!loading && error && <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-600">{error}</div>}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="rounded-xl border border-[#D1FAE5] bg-white p-8 text-center text-sm text-[#6B7280]">이 달에 등록된 행사가 없습니다.</div>
      )}

      <div className="space-y-3">
        {filteredEvents.map((event) => {
          const date = splitEventDate(event.eventDate);
          const eventCategory = getEventCategory(event);
          return (
            <article key={event.eventId} className="rounded-[14px] border border-[#D1FAE5] bg-white p-[14px]">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-bold text-[#0F4C3A]">{event.title}</h2>
                    <span className="shrink-0 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11px] text-[#10B981]">{getEventCategoryLabel(eventCategory)}</span>
                  </div>
                </div>
                <strong className="shrink-0 text-xs text-[#10B981]">+{event.rewardXp} XP</strong>
              </div>
              <div className="space-y-1 text-xs text-[#6B7280]">
                <p>{date.date}{date.time && ` ${date.time}`}</p>
                <p>장소 · {event.location || "미정"}</p>
                {event.hostNickname && <p>주최 · {event.hostNickname}</p>}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-medium">
                <button className="rounded-lg border border-[#10B981] py-2 text-[#10B981]" onClick={() => navigate(`/admin/events/${event.eventId}`, { state: { event } })}>상세</button>
                <button className="rounded-lg border border-[#D1FAE5] bg-[#F0FDF4] py-2 text-[#10B981]" onClick={() => navigate(`/admin/events/${event.eventId}/edit`, { state: { event } })}>수정</button>
                <button className="rounded-lg bg-[#FFC9C9] py-2 text-[#E7000B]" onClick={() => setDeleteTarget(event)}>삭제</button>
              </div>
            </article>
          );
        })}
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0F4C3A]">행사를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>“{deleteTarget?.title}” 행사 정보는 삭제 후 복구할 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-[#FF6A6A] hover:bg-[#ef5656]" onClick={(event) => { event.preventDefault(); void handleDelete(); }} disabled={deleting}>
              {deleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
