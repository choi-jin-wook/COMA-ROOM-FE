import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Menu,
  Home,
  CalendarDays,
  Megaphone,
  UserCircle,
  Settings as SettingsIcon,
  ExternalLink,
  Images,
  Vote,
  Calendar,
  Lock,
  Monitor,
  CalendarCheck,
  BookOpen,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ComaLogo from "@/components/ComaLogo";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Settings = () => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const { logout } = useAuth();
  const [eventNotification, setEventNotification] = useState(true);
  const [voteNotification, setVoteNotification] = useState(true);
  const [attendanceNotification, setAttendanceNotification] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  const quickLinks = [
    { icon: Images, label: "코마 앨범", path: "/album" },
    { icon: Vote, label: "투표", path: "/vote-list" },
    { icon: Calendar, label: "일정", path: "/schedule" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      <header className="sticky top-0 z-50 px-4 py-3" style={{ backgroundColor: "#10B981" }}>
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate("/main")}>
            <ComaLogo size="sm" />
            <span className="text-white font-bold text-lg">COMA-ROOM</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/notifications")}>
              <Bell className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => navigate("/profile")}>
              <User className="w-5 h-5 text-white" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Menu className="w-5 h-5 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-[100]">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/schedule")}>
                  <CalendarCheck className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>일정</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/vote-list")}>
                  <Vote className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>투표</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/study")}>
                  <BookOpen className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>스터디</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/album")}>
                  <Images className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>앨범</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/settings")}>
                  <SettingsIcon className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>설정</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon className="w-5 h-5" style={{ color: "#0F4C3A" }} />
            <h1 className="text-xl font-bold" style={{ color: "#0F4C3A" }}>설정</h1>
          </div>
          <p className="text-sm" style={{ color: "#6B7280" }}>COMA-ROOM 앱의 설정을 관리합니다.</p>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: "#D1FAE5" }}>
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-5 h-5" style={{ color: "#10B981" }} />
            <h2 className="font-bold" style={{ color: "#10B981" }}>바로가기</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: "#0F4C3A" }}>주요 기능에 빠르게 접근해 보세요.</p>
          <div className="space-y-2">
            {quickLinks.map((link, index) => (
              <button key={index} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "#FFFFFF" }} onClick={() => navigate(link.path)}>
                <link.icon className="w-5 h-5" style={{ color: "#6B7280" }} />
                <span className="font-medium" style={{ color: "#0F4C3A" }}>{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5" style={{ color: "#10B981" }} />
            <h2 className="font-bold" style={{ color: "#10B981" }}>알림 설정</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: "#6B7280" }}>받고 싶은 알림을 설정해 보세요.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: "#0F4C3A" }}>행사 알림</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>새로운 행사가 등록되면 알림을 받습니다</p>
              </div>
              <Switch checked={eventNotification} onCheckedChange={setEventNotification} className="data-[state=checked]:bg-[#10B981]" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: "#0F4C3A" }}>투표 알림</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>새로운 투표가 시작되면 알림을 받습니다</p>
              </div>
              <Switch checked={voteNotification} onCheckedChange={setVoteNotification} className="data-[state=checked]:bg-[#10B981]" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: "#0F4C3A" }}>출석 알림</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>출석 체크 시간이 되면 알림을 받습니다</p>
              </div>
              <Switch checked={attendanceNotification} onCheckedChange={setAttendanceNotification} className="data-[state=checked]:bg-[#10B981]" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5" style={{ color: "#10B981" }} />
            <h2 className="font-bold" style={{ color: "#10B981" }}>개인정보 및 보안</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: "#6B7280" }}>계정 보안과 개인정보를 관리합니다.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: "#0F4C3A" }}>프로필 공개</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>다른 회원에게 프로필 정보를 공개합니다</p>
              </div>
              <Switch checked={profilePublic} onCheckedChange={setProfilePublic} className="data-[state=checked]:bg-[#10B981]" />
            </div>
            <button className="w-full py-3 rounded-xl text-left px-4" style={{ backgroundColor: "#F8FFFE", border: "1px solid #D1D5DB" }}>
              <span style={{ color: "#0F4C3A" }}>비밀번호 변경</span>
            </button>
            <button className="w-full py-3 rounded-xl text-left px-4" style={{ backgroundColor: "#F8FFFE", border: "1px solid #D1D5DB" }}>
              <span style={{ color: "#0F4C3A" }}>이메일 변경</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-5 h-5" style={{ color: "#10B981" }} />
            <h2 className="font-bold" style={{ color: "#10B981" }}>화면 설정</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: "#6B7280" }}>앱의 테마와 표시 옵션을 설정합니다.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: "#0F4C3A" }}>다크 모드</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>어두운 테마를 사용합니다</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} className="data-[state=checked]:bg-[#10B981]" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
          <div className="flex items-center gap-2 mb-2">
            <LogOut className="w-5 h-5" style={{ color: "#E7000B" }} />
            <h2 className="font-bold" style={{ color: "#E7000B" }}>계정</h2>
          </div>
          <button
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
            style={{ backgroundColor: "#FFC9C9", color: "#E7000B" }}
            onClick={() => { logout(); navigate("/"); }}
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/main")}>
          <Home className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>홈</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/schedule")}>
          <CalendarDays className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>일정</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/notice")}>
          <Megaphone className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>공지</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/profile")}>
          <UserCircle className="w-5 h-5" style={{ color: "#10B981" }} />
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>마이</span>
        </button>
      </nav>
    </div>
  );
};

export default Settings;
