import { useNavigate } from "react-router-dom";
import { Bell, CalendarDays, ClipboardCheck, Home, Images, LayoutDashboard, Megaphone, Menu, Sparkles, User, UserCircle, Users } from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type NavItem = { key: string; label: string; path: string; icon: typeof Home };

const USER_NAV: NavItem[] = [
  { key: "home", label: "홈", path: "/main", icon: Home },
  { key: "plan", label: "일정", path: "/schedule", icon: CalendarDays },
  { key: "notice", label: "공지", path: "/notice", icon: Megaphone },
  { key: "profile", label: "마이", path: "/profile", icon: UserCircle },
];

const ADMIN_NAV: NavItem[] = [
  { key: "dashboard", label: "대시보드", path: "/admin", icon: LayoutDashboard },
  { key: "members", label: "부원", path: "/admin/members", icon: Users },
  { key: "xp", label: "XP", path: "/admin/xp", icon: Sparkles },
  { key: "attendance", label: "출석", path: "/admin/attendance", icon: ClipboardCheck },
  { key: "notice", label: "공지", path: "/admin/notice", icon: Megaphone },
];

export function AppHeader({ admin = false }: { admin?: boolean }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 px-4 py-3 shadow-lg" style={{ background: "linear-gradient(90deg,#91C8C4 0%,rgba(27,111,104,.95) 100%)" }}>
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2" onClick={() => navigate(admin ? "/admin" : "/main")}>
          <ComaLogo size="sm" /><span className="font-bold text-lg text-white">COMA-ROOM</span>
        </button>
        <div className="flex items-center gap-4">
          <button aria-label="알림" onClick={() => navigate(admin ? "/admin/notice" : "/notifications")}><Bell className="w-5 h-5 text-white" /></button>
          <button aria-label="프로필" onClick={() => navigate(admin ? "/admin" : "/profile")}><User className="w-5 h-5 text-white" /></button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button aria-label="메뉴"><Menu className="w-5 h-5 text-white" /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-white">
              {admin && <>
                <DropdownMenuItem onClick={() => navigate("/admin/events")}><CalendarDays className="mr-2 w-4 h-4" />이벤트 관리</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/albums")}><Images className="mr-2 w-4 h-4" />앨범 승인</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/studies/new")}><Users className="mr-2 w-4 h-4" />스터디 생성</DropdownMenuItem>
              </>}
              <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}><User className="mr-2 w-4 h-4" />로그아웃</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {admin && <span className="mt-1 ml-[50px] inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs text-white" style={{ backgroundColor: "#FE9A00" }}><span className="w-1.5 h-1.5 rounded-full border border-white" />관리자 모드</span>}
    </header>
  );
}

export function AppBottomNav({ admin = false, active }: { admin?: boolean; active: string }) {
  const navigate = useNavigate();
  const nav = admin ? ADMIN_NAV : USER_NAV;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t py-2" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
      {nav.map((item) => {
        const Icon = item.icon;
        const selected = item.key === active;
        return <button key={item.key} className="min-w-11 flex flex-col items-center gap-1" onClick={() => navigate(item.path)}>
          <Icon className="w-4 h-4" style={{ color: selected ? "#10B981" : "#6B7280" }} />
          <span className={selected ? "text-[10px] font-medium" : "text-[10px]"} style={{ color: selected ? "#10B981" : "#6B7280" }}>{item.label}</span>
        </button>;
      })}
    </nav>
  );
}
