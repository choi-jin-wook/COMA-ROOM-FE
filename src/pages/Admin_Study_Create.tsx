import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AdminShell from "@/components/AdminShell";
import { toast } from "sonner";

export default function Admin_Study_Create() {
  const [name, setName] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); toast.info("스터디 생성과 스터디장 지정 기능을 준비 중입니다."); };
  return <AdminShell designHeader><form onSubmit={submit} className="space-y-[14px]">
    <Link to="/admin" className="block text-xs font-medium">‹ 스터디 관리</Link>
    <div><h1 className="text-[22px] font-bold">스터디 생성</h1><p className="text-xs text-muted-foreground">새 스터디 정보를 입력하고 스터디장을 지정합니다</p></div>
    <div className="space-y-[14px] rounded-[14px] border bg-card p-4">
      <label className="block space-y-1.5 text-xs">스터디명<input required value={name} onChange={e => setName(e.target.value)} className="h-[46px] w-full rounded-lg border bg-card px-3 text-[13px]" placeholder="스터디명을 입력하세요" /></label>
      <label className="block space-y-1.5 text-xs">스터디장<select aria-describedby="manager-help" className="h-[46px] w-full rounded-lg border bg-card px-3 text-[13px] text-muted-foreground" defaultValue=""><option value="">부원을 선택하세요</option><option disabled>부원 목록 연동 준비 중</option></select></label>
    </div>
    <p id="manager-help" className="rounded-[10px] bg-muted p-3 text-[11px] text-muted-foreground">선택한 부원을 스터디장으로 지정합니다.</p>
    <div className="grid grid-cols-2 gap-2"><Link to="/admin" className="rounded-lg border bg-card py-2 text-center text-xs text-muted-foreground">취소</Link><button className="rounded-lg bg-[#10B981] py-2 text-xs font-medium text-white">스터디 생성</button></div>
  </form></AdminShell>;
}
