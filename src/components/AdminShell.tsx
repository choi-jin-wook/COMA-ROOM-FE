import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  Megaphone,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import figmaLogo from "@/assets/figma-coma-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AdminSection = "dashboard" | "members" | "xp" | "attendance" | "notice";

interface AdminShellProps {
  children: ReactNode;
  active?: AdminSection;
  designHeader?: boolean;
}

const navItems = [
  { key: "dashboard", label: "대시보드", path: "/admin", icon: LayoutDashboard },
  { key: "members", label: "부원", path: "/admin/members", icon: Users },
  { key: "xp", label: "XP", path: "/admin/xp", icon: Sparkles },
  { key: "attendance", label: "출석", path: "/admin/attendance", icon: ClipboardCheck },
  { key: "notice", label: "공지", path: "/admin/notice", icon: Megaphone },
] as const;

export default function AdminShell({ children, active = "dashboard", designHeader = false }: AdminShellProps) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[392px] flex-col bg-[#F8FFFE] shadow-xl">
      <header className="sticky top-0 z-50 h-[78px] bg-gradient-to-r from-[#91C8C4] to-[rgba(27,111,104,0.95)] px-4 shadow-lg">
        <div className="flex h-16 items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate("/admin")}>
            {designHeader ? <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[7px]"><img src={figmaLogo} alt="COMA" className="absolute left-[-24.92%] top-[-19.77%] h-[142.88%] w-[151.22%] max-w-none" /></span> : <ComaLogo size="sm" />}
            <span className={`font-bold text-white ${designHeader ? "text-lg" : "text-base"}`}>COMA-ROOM</span>
          </button>
          <div className="flex items-center gap-1 text-white">
            <button className="flex h-9 w-9 items-center justify-center" onClick={() => navigate("/admin/notice")} aria-label="공지 관리">
              <Bell className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center" onClick={() => navigate("/admin")} aria-label="관리자 프로필">
              <User className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center" aria-label="관리자 메뉴">
                  <Menu className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => navigate("/admin/events")}>행사 관리</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/vote")}>투표 관리</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/studies/new")}>스터디 관리</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/albums")}>앨범 승인 관리</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <span className="absolute bottom-[6px] left-[66px] inline-flex h-5 items-center gap-2 rounded-lg bg-[#FE9A00] px-3 text-[11px] font-medium text-white">
          <span className="h-1.5 w-1.5 rounded-full border border-white" />
          관리자 모드
        </span>
      </header>

      <main className="flex-1 px-[26px] pb-24 pt-[26px]">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-50 flex h-[69px] w-full max-w-[392px] -translate-x-1/2 items-center justify-around border-t border-[#D1FAE5] bg-white px-4 shadow-lg">
        {navItems.map(({ key, label, path, icon: Icon }) => {
          const selected = active === key;
          return (
            <button key={key} className="flex min-w-11 flex-col items-center gap-1" onClick={() => navigate(path)}>
              <Icon className="h-4 w-4" style={{ color: selected ? "#10B981" : "#6B7280" }} />
              <span className={`text-xs ${selected ? "font-semibold" : "font-normal"}`} style={{ color: selected ? "#10B981" : "#6B7280" }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
