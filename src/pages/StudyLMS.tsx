import { useState, type FormEvent } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import MemberShell from "@/components/MemberShell";
import { toast } from "sonner";

const card = "rounded-[10px] border border-border bg-card p-4";
const field = "h-[46px] w-full rounded-lg border border-border bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-primary";
const primary = "rounded-lg bg-[#10B981] px-4 py-2 text-[13px] font-medium text-white";
interface StudyPlan { title: string; topic: string; description: string; file: string }
interface StudyDetails { id: number; title: string; role: "멤버" | "리더"; plans?: Record<number, StudyPlan> }

export default function StudyLMS({ view = "list" }: { view?: "list" | "detail" | "create" | "attendance" }) {
  const { id, week: rawWeek } = useParams();
  const location = useLocation();
  const study = (location.state as { study?: StudyDetails } | null)?.study;
  const [search] = useSearchParams();
  const leader = study?.role === "리더";
  const title = study?.title ?? "스터디";
  const base = `/study/${id}/weeks`;
  const week = Number(rawWeek ?? search.get("week") ?? 1);
  const plans = study?.plans ?? {};
  const plan = plans[week];
  const [selectedWeek, setSelectedWeek] = useState(String(week));
  const [planTitle, setPlanTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const submit = (event: FormEvent) => { event.preventDefault(); toast.info("주차 계획 저장 기능은 준비 중입니다. 입력한 내용은 유지됩니다."); };

  if (!study || String(study.id) !== id || !Number.isInteger(week) || week < 1 || week > 16) return <MemberShell><div className="space-y-4"><h1 className="text-2xl font-bold">스터디</h1><p className="rounded-[14px] border bg-card p-6 text-center text-sm text-muted-foreground">스터디 정보를 불러오지 못했습니다.</p><Link state={{ study }} to="/study" className="block text-sm">‹ 내 스터디로 돌아가기</Link></div></MemberShell>;
  if ((view === "create" || view === "attendance") && !leader) return <MemberShell><p>스터디장만 이용할 수 있는 화면입니다.</p><Link state={{ study }} to={base}>주차 목록으로 돌아가기</Link></MemberShell>;

  return <MemberShell><div className={view === "list" ? "space-y-3" : "space-y-4"}>
    <Link state={{ study }} className="block text-sm font-medium" to={view === "list" ? "/study" : view === "attendance" ? `${base}/${week}` : base}>‹ {view === "list" ? "내 스터디" : view === "attendance" ? `${week}주차 상세` : view === "create" ? title : "주차 목록"}</Link>
    {view === "list" ? <>
      <h1 className="text-2xl font-bold">{title}</h1><p className="text-[13px] text-[#4B6B63]">LMS 형태로 1~16주차 학습 계획을 관리합니다</p>
      <span className="inline-flex h-7 items-center rounded-full border border-[#A7F3D0] bg-muted px-3 text-xs text-[#047857]">{leader ? "스터디장" : "스터디원"}</span>
      {leader && <div><Link state={{ study }} to={`${base}/new`} className={`inline-block ${primary}`}>+ 주차 계획 추가</Link></div>}
      <h2 className="text-lg font-bold">주차 학습</h2>
      {Array.from({ length: 16 }, (_, i) => <div key={i} className={`relative h-[68px] rounded-[10px] border px-4 py-2.5 ${plans[i + 1] ? "bg-card" : "bg-background"}`}>
        <h3 className="text-sm font-bold">{i + 1}주차</h3><div className="mt-2 flex items-center justify-between gap-2"><p className={`text-xs ${plans[i + 1] ? "text-[#334155]" : "text-[#94A3B8]"}`}>{plans[i + 1]?.title ?? "계획 미등록"}</p>
          {(plans[i + 1] || leader) && <Link state={{ study }} aria-label={`${i + 1}주차 ${plans[i + 1] ? "상세보기" : "계획 추가"}`} className={`text-[11px] ${plans[i + 1] ? "text-[#10B981]" : "text-muted-foreground"}`} to={plans[i + 1] ? `${base}/${i + 1}` : `${base}/new?week=${i + 1}`}>{plans[i + 1] ? "상세보기" : "계획 추가"} ›</Link>}
        </div></div>)}
    </> : view === "create" ? <form onSubmit={submit} className="space-y-[14px]">
      <div><h1 className="text-[22px] font-bold">주차 계획 생성</h1><p className="text-xs text-muted-foreground">1~16주차 중 선택하고 주차 계획을 입력합니다</p></div>
      <div className={`${card} space-y-[14px] rounded-[14px]`}>
        <label className="block space-y-1.5 text-xs">주차 계획명<input required value={planTitle} onChange={e => setPlanTitle(e.target.value)} placeholder="예: 3주차 - REST API 구현" className={field} /></label>
        <label className="block space-y-1.5 text-xs">주차 선택<select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)} className={field}>{Array.from({ length: 16 }, (_, i) => <option value={i + 1} key={i}>{i + 1}주차</option>)}</select></label>
      </div>
      <div><label htmlFor="study-material" className="text-xs">강의자료</label><div className="mt-1 flex items-center gap-2 rounded-lg border bg-card p-3"><span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{file?.name ?? "파일을 선택해주세요"}</span><label htmlFor="study-material" className={`${primary} cursor-pointer`}>파일 선택</label><input id="study-material" type="file" className="sr-only" onChange={e => setFile(e.target.files?.[0] ?? null)} /></div><p className="mt-1 text-[10px] text-muted-foreground">주차 계획과 함께 사용할 강의자료를 첨부할 수 있습니다.</p></div>
      <p className="rounded-[10px] bg-muted p-3 text-[11px] text-muted-foreground">주차 번호를 선택하고 계획명을 입력하세요.</p>
      <div className="grid grid-cols-2 gap-2"><Link state={{ study }} to={base} className="rounded-lg border bg-card py-2 text-center text-xs text-muted-foreground">취소</Link><button className={primary}>주차 계획 생성</button></div>
    </form> : view === "attendance" ? <>
      <div><h1 className="text-[22px] font-bold">출석 생성</h1><p className="text-xs text-muted-foreground">{week}주차 상세에서 이어지는 출석 생성 단계입니다</p></div>
      <div className={card}><p className="mb-1 text-xs">선택된 주차</p><p className="rounded-lg border p-3 text-xs text-muted-foreground">{week}주차 · {plan?.title ?? "계획 미등록"}</p></div>
      <p className="rounded-[10px] bg-muted p-3 text-[11px] text-muted-foreground">스터디 출석 생성 기능을 준비 중입니다.</p><Link state={{ study }} to={`${base}/${week}`} className="block rounded-lg border bg-card py-2 text-center text-xs text-muted-foreground">돌아가기</Link>
    </> : plan ? <>
      <h1 className="text-2xl font-bold">{week}주차 · {plan.title}</h1><p className="text-[13px] text-[#4B6B63]">{title}</p>
      <section className={card}><h2 className="mb-4 text-[15px] font-bold">주차 계획</h2><dl className="space-y-1"><dt className="text-xs text-muted-foreground">학습 주제</dt><dd className="text-sm">{plan.topic}</dd><dt className="pt-2 text-xs text-muted-foreground">설명</dt><dd className="text-[13px] text-[#334155]">{plan.description}</dd></dl></section>
      <section className={card}><h2 className="mb-4 text-[15px] font-bold">학습 자료</h2><p className="rounded-lg border bg-background p-3 text-[13px] text-[#334155]">{plan.file || "등록된 자료가 없습니다"}</p>{plan.file && <button onClick={() => toast.info("자료 다운로드는 스터디 자료 연동 후 이용할 수 있습니다.")} className="mt-3 w-full rounded-lg border border-[#10B981] bg-muted py-2 text-xs text-[#047857]">자료 다운로드</button>}</section>
      {leader && <section className={card}><h2 className="text-[15px] font-bold">스터디장 관리</h2><p className="my-2 text-xs text-muted-foreground">출석 생성은 해당 주차 상세에서 진행합니다</p><Link state={{ study }} to={`${base}/${week}/attendance`} className={`block text-center ${primary}`}>출석 생성</Link></section>}
    </> : <p>등록된 주차 계획이 없습니다.</p>}
  </div></MemberShell>;
}
