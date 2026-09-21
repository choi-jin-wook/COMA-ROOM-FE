import { FormEvent, ReactNode, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CalendarClock, FileText, Plus } from "lucide-react";
import { apiFetch } from "@/api/client";
import { AppBottomNav, AppHeader } from "@/components/AppChrome";

const inputClass = "h-11 w-full rounded-lg border border-[#D1FAE5] bg-white px-3 text-sm text-[#0F4C3A] outline-none placeholder:text-[#94A3B8] focus:border-[#10B981]";
const textareaClass = "min-h-24 w-full resize-none rounded-lg border border-[#D1FAE5] bg-white px-3 py-3 text-sm text-[#0F4C3A] outline-none placeholder:text-[#94A3B8] focus:border-[#10B981]";

function PageShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  return (
    <div className="min-h-screen bg-[#F8FFFE]">
      <AppHeader admin={admin} />
      <main className="mx-auto w-full max-w-[392px] px-[26px] py-4 pb-24">{children}</main>
      <AppBottomNav admin={admin} active={admin ? "dashboard" : ""} />
    </div>
  );
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="mb-3 text-sm font-medium text-[#0F4C3A]">‹ {label}</button>;
}

function Heading({ title, description }: { title: string; description?: string }) {
  return <div className="mb-4"><h1 className="text-[22px] font-bold text-[#0F4C3A]">{title}</h1>{description && <p className="mt-1 text-xs text-[#6B7280]">{description}</p>}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-[#0F4C3A]">{label}</span>{children}</label>;
}

function FormActions({ cancel, submitLabel, busy = false }: { cancel: () => void; submitLabel: string; busy?: boolean }) {
  return <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={cancel} className="rounded-lg border border-[#D1FAE5] bg-white py-2.5 text-sm font-medium text-[#6B7280]">취소</button><button disabled={busy} type="submit" className="rounded-lg bg-[#10B981] py-2.5 text-sm font-medium text-white disabled:opacity-50">{busy ? "저장 중..." : submitLabel}</button></div>;
}

export function AdminStudyCreate() {
  const navigate = useNavigate();
  const [studyName, setStudyName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/admin/study", {
        method: "POST",
        body: JSON.stringify({ studyName: studyName.trim(), managerId: Number(managerId) }),
      });
      navigate("/study");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "스터디를 생성하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PageShell admin>
      <BackButton label="스터디 관리" onClick={() => navigate("/admin")} />
      <Heading title="스터디 생성" description="새 스터디 정보를 입력하고 스터디장을 지정합니다" />
      <form onSubmit={submit}>
        <section className="space-y-4 rounded-[14px] border border-[#D1FAE5] bg-white p-4">
          <Field label="스터디명"><input required value={studyName} onChange={(event) => setStudyName(event.target.value)} className={inputClass} placeholder="스터디명을 입력하세요" /></Field>
          <Field label="스터디장"><input required value={managerId} onChange={(event) => setManagerId(event.target.value)} className={inputClass} inputMode="numeric" placeholder="부원 ID를 입력하세요" /></Field>
        </section>
        <div className="mt-3 rounded-[10px] bg-[#F0FDF4] px-3 py-2.5 text-[11px] leading-4 text-[#6B7280]">입력한 부원의 ID가 스터디장으로 지정됩니다.</div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <FormActions busy={busy} cancel={() => navigate("/admin")} submitLabel="스터디 생성" />
      </form>
    </PageShell>
  );
}

export function StudyWeeks() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const [searchParams] = useSearchParams();
  const leader = searchParams.get("role") === "leader";
  const roleQuery = leader ? "?role=leader" : "?role=member";
  return (
    <PageShell>
      <BackButton label="내 스터디" onClick={() => navigate("/study")} />
      <Heading title="스터디 주차 관리" description="LMS 형태로 1~16주차 학습 계획을 관리합니다" />
      <div className="mb-3 inline-flex rounded-full bg-[#D1FAE5] px-3 py-1.5 text-xs font-medium text-[#047857]">{leader ? "스터디장" : "스터디원"}</div>
      {leader && <button onClick={() => navigate("/study/" + studyId + "/weeks/new?role=leader")} className="mb-4 flex w-full items-center justify-center gap-1 rounded-lg bg-[#10B981] py-2.5 text-sm font-medium text-white"><Plus className="h-4 w-4" />주차 계획 생성</button>}
      <h2 className="mb-3 text-lg font-bold text-[#0F4C3A]">주차 학습</h2>
      <div className="space-y-3">
        {Array.from({ length: 16 }, (_, index) => index + 1).map((week) => (
          <button key={week} onClick={() => navigate("/study/" + studyId + "/weeks/" + week + roleQuery)} className="flex h-[68px] w-full items-center justify-between rounded-[10px] border border-[#D1FAE5] bg-[#F8FFFE] px-4 text-left">
            <span><strong className="block text-sm text-[#0F4C3A]">{week}주차</strong><span className="mt-1 block text-xs text-[#94A3B8]">계획 미등록</span></span>
            <span className="text-xs text-[#64748B]">상세보기 ›</span>
          </button>
        ))}
      </div>
    </PageShell>
  );
}

export function StudyWeekDetail() {
  const navigate = useNavigate();
  const { studyId, week } = useParams();
  const [searchParams] = useSearchParams();
  const leader = searchParams.get("role") === "leader";
  return (
    <PageShell>
      <BackButton label="주차 목록" onClick={() => navigate("/study/" + studyId + "/weeks?role=" + (leader ? "leader" : "member"))} />
      <Heading title={(week ?? "-") + "주차"} description="등록된 주차 계획을 확인합니다" />
      <section className="rounded-xl border border-[#D1FAE5] bg-white p-4">
        <h2 className="text-[15px] font-bold text-[#0F4C3A]">주차 계획</h2>
        <div className="mt-4 rounded-lg bg-[#F8FFFE] p-5 text-center text-sm text-[#94A3B8]">등록된 주차 계획이 없습니다.</div>
      </section>
      <section className="mt-4 rounded-xl border border-[#D1FAE5] bg-white p-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0F4C3A]"><FileText className="h-4 w-4 text-[#10B981]" />학습 자료</h2>
        <div className="mt-4 rounded-lg bg-[#F8FFFE] p-5 text-center text-sm text-[#94A3B8]">등록된 학습 자료가 없습니다.</div>
      </section>
      {leader && <section className="mt-4 rounded-xl border border-[#D1FAE5] bg-white p-4"><h2 className="text-[15px] font-bold text-[#0F4C3A]">스터디장 관리</h2><p className="mt-1 text-xs text-[#64748B]">출석 생성은 해당 주차 상세에서 진행합니다.</p><button onClick={() => navigate("/study/" + studyId + "/weeks/" + week + "/attendance/new?role=leader")} className="mt-3 w-full rounded-lg bg-[#10B981] py-2 text-sm font-medium text-white">출석 생성</button></section>}
    </PageShell>
  );
}

export function StudyWeekPlanCreate() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const [activityName, setActivityName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!studyId) return;
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/admin/study/" + studyId + "/activities", {
        method: "POST",
        body: JSON.stringify({ activityName: activityName.trim() }),
      });
      navigate("/study/" + studyId + "/weeks?role=leader");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "주차 계획을 생성하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PageShell>
      <BackButton label="주차 목록" onClick={() => navigate("/study/" + studyId + "/weeks?role=leader")} />
      <Heading title="주차 계획 생성" description="1~16주차 중 선택하고 주차 계획을 입력합니다" />
      <form onSubmit={submit}>
        <section className="space-y-4 rounded-[14px] border border-[#D1FAE5] bg-white p-4">
          <Field label="주차"><select className={inputClass} defaultValue=""><option value="" disabled>주차를 선택하세요</option>{Array.from({ length: 16 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}주차</option>)}</select></Field>
          <Field label="학습 주제"><input required value={activityName} onChange={(event) => setActivityName(event.target.value)} className={inputClass} placeholder="학습 주제를 입력하세요" /></Field>
          <Field label="설명"><textarea className={textareaClass} placeholder="학습 내용을 입력하세요" /></Field>
          <Field label="학습 자료"><input className={inputClass} type="file" /></Field>
        </section>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <FormActions busy={busy} cancel={() => navigate("/study/" + studyId + "/weeks?role=leader")} submitLabel="계획 생성" />
      </form>
    </PageShell>
  );
}

export function StudyAttendanceCreate() {
  const navigate = useNavigate();
  const { studyId, week } = useParams();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [expirationTime, setExpirationTime] = useState("");
  const [qrCodeId, setQrCodeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await apiFetch<{ eventId: number }>("/api/admin/event", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          eventDate: `${date}T${time || "00:00"}:00`,
          rewardXp: 5,
          location: `스터디 ${week ?? "-"}주차`,
          eventCategory: "STUDY",
        }),
      });
      const attendance = await apiFetch<{ qrCodeId: string }>("/api/admin/event/attendances", {
        method: "POST",
        body: JSON.stringify({ eventId: created.eventId, expirationTime: Number(expirationTime) }),
      });
      setQrCodeId(attendance.qrCodeId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "출석을 생성하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PageShell>
      <BackButton label={(week ?? "-") + "주차 상세"} onClick={() => navigate("/study/" + studyId + "/weeks/" + week + "?role=leader")} />
      <Heading title="출석 생성" description="해당 주차의 출석 세션 정보를 입력합니다" />
      <form onSubmit={submit}>
        <section className="space-y-4 rounded-[14px] border border-[#D1FAE5] bg-white p-4">
          <div className="flex items-center gap-2 rounded-lg bg-[#F0FDF4] p-3 text-sm font-medium text-[#047857]"><CalendarClock className="h-4 w-4" />{week ?? "-"}주차 출석</div>
          <Field label="출석명"><input required value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} placeholder="출석명을 입력하세요" /></Field>
          <div className="grid grid-cols-2 gap-2"><Field label="날짜"><input required value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} type="date" /></Field><Field label="시간"><input required value={time} onChange={(event) => setTime(event.target.value)} className={inputClass} type="time" /></Field></div>
          <Field label="인증 유효시간"><input required value={expirationTime} onChange={(event) => setExpirationTime(event.target.value)} className={inputClass} type="number" min="1" placeholder="분 단위로 입력하세요" /></Field>
        </section>
        {qrCodeId && <div className="mt-3 rounded-lg border border-[#D1FAE5] bg-white p-4 text-center"><p className="text-xs text-[#64748B]">출석 코드</p><p className="mt-1 break-all text-sm font-semibold text-[#0F4C3A]">{qrCodeId}</p></div>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <FormActions busy={busy} cancel={() => navigate("/study/" + studyId + "/weeks/" + week + "?role=leader")} submitLabel="출석 생성" />
      </form>
    </PageShell>
  );
}
