import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, Menu, Home, CalendarDays, Megaphone } from "lucide-react";
import comaLogo from "@/assets/figma-coma-logo.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function MemberShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const navigation = [["홈", "/main", Home], ["일정", "/schedule", CalendarDays], ["공지", "/notice", Megaphone], ["마이", "/profile", User]] as const;
  return <div className="mx-auto flex min-h-screen w-full max-w-[392px] flex-col bg-background text-foreground shadow-xl">
    <header className="sticky top-0 z-50 flex h-[70px] shrink-0 items-center justify-between bg-gradient-to-r from-[#91C8C4] to-[rgba(27,111,104,0.95)] px-[19px] shadow-lg">
      <button onClick={() => navigate("/main")} className="flex items-center gap-3 min-[380px]:gap-6"><span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[7px]"><img src={comaLogo} alt="COMA" className="absolute left-[-24.92%] top-[-19.77%] h-[142.88%] w-[151.22%] max-w-none" /></span><span className="whitespace-nowrap text-base font-semibold text-white min-[380px]:text-lg">COMA-ROOM</span></button>
      <div className="flex text-white">
        <button aria-label="알림" onClick={() => navigate("/notifications")} className="flex h-9 w-9 items-center justify-center"><Bell className="h-4 w-4" /></button>
        <button aria-label="내 프로필" onClick={() => navigate("/profile")} className="flex h-9 w-9 items-center justify-center"><User className="h-4 w-4" /></button>
        <DropdownMenu><DropdownMenuTrigger asChild><button aria-label="메뉴" className="flex h-9 w-9 items-center justify-center"><Menu className="h-4 w-4" /></button></DropdownMenuTrigger><DropdownMenuContent align="end">
          {[["일정", "/schedule"], ["투표", "/vote-list"], ["스터디", "/study"], ["앨범", "/album"], ["설정", "/settings"]].map(([label, path]) => <DropdownMenuItem key={path} onClick={() => navigate(path)}>{label}</DropdownMenuItem>)}
        </DropdownMenuContent></DropdownMenu>
      </div>
    </header>
    <main className="flex-1 px-[26px] pb-24 pt-[17px]">{children}</main>
    <nav className="fixed bottom-0 left-1/2 z-50 flex h-[69px] w-full max-w-[392px] -translate-x-1/2 items-center justify-around border-t bg-white px-4">
      {navigation.map(([label, path, Icon]) => <button key={path} onClick={() => navigate(path)} className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 text-xs text-muted-foreground"><Icon className="h-4 w-4" />{label}</button>)}
    </nav>
  </div>;
}
