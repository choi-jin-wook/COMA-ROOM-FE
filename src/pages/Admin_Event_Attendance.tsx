import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import AdminShell from "@/components/AdminShell";
import { apiFetch } from "@/api/client";
import { getAdminEvent, type AdminEvent } from "@/api/events";

export default function Admin_Event_Attendance() {
  const { id } = useParams();
  const location = useLocation();
  const stateEvent = (location.state as { event?: AdminEvent } | null)?.event;
  const [event, setEvent] = useState<AdminEvent | null>(stateEvent ?? null);
  const [minutes, setMinutes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!stateEvent);
  const [submitting, setSubmitting] = useState(false);
  const [qrCode, setQrCode] = useState("");
  useEffect(() => {
    if (stateEvent) return;
    if (!id || !Number.isInteger(Number(id)) || Number(id) < 1) { setError("잘못된 행사 번호입니다."); setLoading(false); return; }
    let active = true;
    getAdminEvent(Number(id)).then(data => { if (active) setEvent(data); }).catch(e => { if (active) setError(e instanceof Error ? e.message : "행사를 불러오지 못했습니다."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, stateEvent]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!event || submitting || qrCode) return;
    const expirationTime = Number(minutes);
    if (!Number.isInteger(expirationTime) || expirationTime < 1) { setError("QR 유효시간을 1분 이상의 정수로 입력해주세요."); return; }
    setSubmitting(true); setError("");
    try {
      const result = await apiFetch<{ qrCodeId: string }>("/api/admin/event/attendances", { method: "POST", body: JSON.stringify({ eventId: event.eventId, expirationTime }) });
      if (!result?.qrCodeId) throw new Error("QR 코드 정보를 받지 못했습니다.");
      setQrCode(result.qrCodeId);
    } catch (e) { setError(e instanceof Error ? e.message : "출석 생성에 실패했습니다."); }
    finally { setSubmitting(false); }
  };
  return <AdminShell active="attendance" designHeader><form onSubmit={submit} className="space-y-[14px]">
    <Link to={`/admin/events/${id}`} state={{ event }} className="block text-xs font-medium">‹ 이벤트 상세</Link>
    <div><h1 className="text-[22px] font-bold">출석 만들기</h1><p className="text-xs text-muted-foreground">선택한 이벤트의 출석 세션을 생성합니다</p></div>
    {loading && <p role="status" className="py-4 text-sm text-muted-foreground">행사를 불러오는 중...</p>}
    <div className="space-y-4 rounded-[14px] border bg-card p-4">
      <div><p className="mb-1.5 text-xs">선택된 이벤트</p><p className="rounded-lg border p-3 text-[13px] text-muted-foreground">{event ? `${event.title} · ${event.eventDate?.replace("T", " ").slice(0, 16)}` : "행사 정보가 없습니다"}</p></div>
      <div className="flex gap-1 text-[11px]"><Link to={`/admin/events/${id}`} state={{ event }} className="flex-1 rounded-lg bg-background py-2 text-center">이벤트 정보</Link><span className="flex-1 rounded-lg bg-[#10B981] py-2 text-center text-white">출석 생성</span><Link to="/admin/attendance" className="flex-1 rounded-lg bg-background py-2 text-center">출석 명단</Link></div>
      <label className="block text-xs">QR 유효시간(분)<input type="number" required min={1} step={1} value={minutes} disabled={!!qrCode || submitting} onChange={e => setMinutes(e.target.value)} placeholder="분 단위로 입력하세요" className="mt-1.5 h-[46px] w-full rounded-lg border bg-card px-3 text-[13px]" /></label>
    </div>
    <p className="rounded-[10px] bg-muted p-3 text-[11px] text-muted-foreground">선택한 이벤트에 출석 세션이 연결됩니다. QR 유효시간만 설정하세요.</p>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</p>}
    {qrCode ? <section className="space-y-3 rounded-[14px] border bg-card p-4 text-center"><h2 className="font-bold">출석 진행 중</h2><QRCodeSVG value={qrCode} size={220} className="mx-auto h-auto max-w-full" /><p className="text-xs text-muted-foreground">QR 코드를 스캔하여 출석해주세요 · 유효시간 {minutes}분</p></section> : <div className="grid grid-cols-2 gap-2"><Link to={`/admin/events/${id}`} state={{ event }} className="rounded-lg border bg-card py-2 text-center text-xs text-muted-foreground">취소</Link><button disabled={!event || submitting} className="rounded-lg bg-[#10B981] py-2 text-xs font-medium text-white disabled:opacity-50">{submitting ? "생성 중..." : "출석 생성"}</button></div>}
  </form></AdminShell>;
}
