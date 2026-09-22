import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { deleteAdminEvent, getAdminEvent, getEventCategory, getEventCategoryLabel, type AdminEvent } from "@/api/events";
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

export default function Admin_Event_Detail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const stateEvent = (location.state as { event?: AdminEvent } | null)?.event;
  const [event, setEvent] = useState<AdminEvent | null>(stateEvent ?? null);
  const [loading, setLoading] = useState(!stateEvent);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (stateEvent || !id) return;
    const eventId = Number(id);
    if (!Number.isFinite(eventId)) {
      setError("잘못된 행사 번호입니다.");
      setLoading(false);
      return;
    }
    getAdminEvent(eventId)
      .then(setEvent)
      .catch((e) => setError(e instanceof Error ? e.message : "행사 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id, stateEvent]);

  const handleDelete = async () => {
    if (!event) return;
    setDeleting(true);
    try {
      await deleteAdminEvent(event.eventId);
      navigate("/admin/events", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "행사를 삭제하지 못했습니다.");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const [date, rawTime = ""] = event?.eventDate?.split("T") ?? [];

  return (
    <AdminShell>
      <button className="mb-4 flex items-center gap-1 text-xs font-medium text-[#0F4C3A]" onClick={() => navigate("/admin/events")}>
        <ArrowLeft className="h-3.5 w-3.5" /> 행사 목록
      </button>
      <h1 className="text-2xl font-bold text-[#0F4C3A]">행사 상세</h1>
      <p className="mb-4 text-xs text-[#6B7280]">월별 조회 결과에서 선택한 행사 정보입니다</p>

      {loading && <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-[#10B981]" /></div>}
      {error && <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {event && (
        <>
          <article className="rounded-[14px] border border-[#D1FAE5] bg-white p-[18px]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0F4C3A]">{event.title}</h2>
              <span className="rounded-full bg-[#F0FDF4] px-3 py-1.5 text-xs text-[#10B981]">{getEventCategoryLabel(getEventCategory(event))}</span>
            </div>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-[#6B7280]">일시</dt><dd className="text-right font-medium text-[#0F4C3A]">{date?.replaceAll("-", ".")}{rawTime && ` ${rawTime.slice(0, 5)}`}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#6B7280]">장소</dt><dd className="text-right font-medium text-[#0F4C3A]">{event.location || "미정"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#6B7280]">지급 XP</dt><dd className="text-right font-medium text-[#0F4C3A]">{event.rewardXp} XP</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#6B7280]">주최자</dt><dd className="text-right font-medium text-[#0F4C3A]">{event.hostNickname || "-"}</dd></div>
            </dl>
          </article>
          <button className="mt-4 w-full rounded-lg border border-[#10B981] bg-[#F0FDF4] py-3 text-sm font-medium text-[#047857]" onClick={() => navigate(`/admin/events/${event.eventId}/attendance`, { state: { event } })}>출석 만들기</button>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-lg bg-[#10B981] py-3 text-sm font-medium text-white" onClick={() => navigate(`/admin/events/${event.eventId}/edit`, { state: { event } })}>수정하기</button>
            <button className="rounded-lg bg-[#FFC9C9] py-3 text-sm font-medium text-[#E7000B]" onClick={() => setDeleteOpen(true)}>삭제하기</button>
          </div>
        </>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>행사를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>삭제한 행사 정보는 복구할 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-[#FF6A6A] hover:bg-[#ef5656]" onClick={(clickEvent) => { clickEvent.preventDefault(); void handleDelete(); }} disabled={deleting}>{deleting ? "삭제 중..." : "삭제"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
