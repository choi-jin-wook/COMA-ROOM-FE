import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import {
  createAdminEvent,
  EVENT_CATEGORIES,
  getAdminEvent,
  getEventCategory,
  updateAdminEvent,
  type AdminEvent,
  type EventCategory,
} from "@/api/events";

function initialDateParts(event?: AdminEvent | null) {
  const [date = "", time = ""] = event?.eventDate?.split("T") ?? [];
  return { date, time: time.slice(0, 5) };
}

export default function Admin_Event_Form() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const editing = Boolean(id);
  const stateEvent = (location.state as { event?: AdminEvent } | null)?.event;
  const [sourceEvent, setSourceEvent] = useState<AdminEvent | null>(stateEvent ?? null);
  const [loading, setLoading] = useState(editing && !stateEvent);
  const [title, setTitle] = useState(stateEvent?.title ?? "");
  const [date, setDate] = useState(() => initialDateParts(stateEvent).date);
  const [time, setTime] = useState(() => initialDateParts(stateEvent).time);
  const [locationName, setLocationName] = useState(stateEvent?.location ?? "");
  const [category, setCategory] = useState<EventCategory>(() => stateEvent ? getEventCategory(stateEvent) as EventCategory : "REGULAR_MEETING");
  const [rewardXp, setRewardXp] = useState(String(stateEvent?.rewardXp ?? 3));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing || stateEvent || !id) return;
    getAdminEvent(Number(id))
      .then((event) => {
        const parts = initialDateParts(event);
        setSourceEvent(event);
        setTitle(event.title);
        setDate(parts.date);
        setTime(parts.time);
        setLocationName(event.location ?? "");
        setCategory(getEventCategory(event) as EventCategory);
        setRewardXp(String(event.rewardXp));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "행사 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [editing, id, stateEvent]);

  const validationMessage = useMemo(() => {
    if (!title.trim()) return "행사명을 입력해 주세요.";
    if (!date || !time) return "날짜와 시간을 입력해 주세요.";
    if (!locationName.trim()) return "장소를 입력해 주세요.";
    const xp = Number(rewardXp);
    if (!Number.isFinite(xp) || xp < 0) return "지급 XP는 0 이상의 숫자로 입력해 주세요.";
    return null;
  }, [date, locationName, rewardXp, time, title]);

  const handleCategoryChange = (value: EventCategory) => {
    setCategory(value);
    const config = EVENT_CATEGORIES.find((item) => item.value === value);
    if (config) setRewardXp(String(config.defaultXp));
  };

  const handleSubmit = async () => {
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload = {
      title: title.trim(),
      eventDate: `${date}T${time}:00`,
      location: locationName.trim(),
      eventCategory: category,
      rewardXp: Number(rewardXp),
    };
    try {
      if (editing && id) {
        await updateAdminEvent(Number(id), payload);
      } else {
        await createAdminEvent(payload);
      }
      navigate("/admin/events", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : `행사를 ${editing ? "수정" : "등록"}하지 못했습니다.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <button className="mb-4 flex items-center gap-1 text-xs font-medium text-[#0F4C3A]" onClick={() => navigate(editing && sourceEvent ? `/admin/events/${sourceEvent.eventId}` : "/admin/events", { state: sourceEvent ? { event: sourceEvent } : undefined })}>
        <ArrowLeft className="h-3.5 w-3.5" /> 행사 관리
      </button>
      <h1 className="text-2xl font-bold text-[#0F4C3A]">행사 {editing ? "수정" : "만들기"}</h1>
      <p className="mb-4 text-xs text-[#6B7280]">{editing ? "행사 정보를 수정합니다" : "새 행사를 등록합니다"}</p>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-[#10B981]" /></div> : (
        <>
          <div className="space-y-4 rounded-[14px] border border-[#D1FAE5] bg-white p-4">
            <label className="block text-xs font-medium text-[#0F4C3A]">행사명
              <input className="mt-1.5 h-11 w-full rounded-lg border border-[#D1FAE5] bg-white px-3 text-sm outline-none focus:border-[#10B981]" placeholder="행사명을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <div className="grid grid-cols-[1fr_110px] gap-2">
              <label className="block text-xs font-medium text-[#0F4C3A]">날짜
                <input type="date" className="mt-1.5 h-11 w-full rounded-lg border border-[#D1FAE5] bg-white px-3 text-sm outline-none focus:border-[#10B981]" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="block text-xs font-medium text-[#0F4C3A]">시간
                <input type="time" className="mt-1.5 h-11 w-full rounded-lg border border-[#D1FAE5] bg-white px-3 text-sm outline-none focus:border-[#10B981]" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
            </div>
            <label className="block text-xs font-medium text-[#0F4C3A]">장소
              <input className="mt-1.5 h-11 w-full rounded-lg border border-[#D1FAE5] bg-white px-3 text-sm outline-none focus:border-[#10B981]" placeholder="장소를 입력하세요" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-[#0F4C3A]">카테고리
              <select className="mt-1.5 h-11 w-full rounded-lg border border-[#D1FAE5] bg-white px-3 text-sm outline-none focus:border-[#10B981]" value={category} onChange={(e) => handleCategoryChange(e.target.value as EventCategory)}>
                {EVENT_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-[#0F4C3A]">지급 XP
              <input type="number" min="0" className="mt-1.5 h-11 w-full rounded-lg border border-[#D1FAE5] bg-white px-3 text-sm outline-none focus:border-[#10B981]" value={rewardXp} onChange={(e) => setRewardXp(e.target.value)} />
            </label>
          </div>

          <p className="mt-3 rounded-[10px] bg-[#F0FDF4] px-3 py-3 text-[11px] text-[#6B7280]">기본 XP 참고: 정기회의 3 · 행사/스터디/Lab 5 · 스태프 2</p>
          {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</p>}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-lg border border-[#D1FAE5] bg-white py-3 text-sm font-medium text-[#6B7280]" onClick={() => navigate("/admin/events")} disabled={submitting}>취소</button>
            <button className="flex items-center justify-center rounded-lg bg-[#10B981] py-3 text-sm font-medium text-white disabled:opacity-60" onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "수정 저장" : "행사 등록"}
            </button>
          </div>
        </>
      )}
    </AdminShell>
  );
}
