// ===================================================
// 출석 기록 페이지
// - 로그인한 사용자의 출석률, 출석/결석 횟수, 획득 XP, 순위 표시
// - 전체 이벤트별 출석 여부 내역 목록 표시
// - GET /api/member/main/attendance 로 데이터 조회
// ===================================================

import { useState, useEffect } from "react";
import {
  Bell,
  User,
  Menu,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  Sparkles,
  Award,
  Home,
  CalendarDays,
  Megaphone,
  UserCircle,
  CalendarCheck,
  Vote,
  BookOpen,
  Images,
  Settings,
  Loader2,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 개별 이벤트 출석 내역 타입 (백엔드 응답 기준)
interface AttendanceHistoryItem {
  title: string;
  scheduledDate: string;          // 행사 예정일
  location: string;
  actualArrivalTime: string | null; // 실제 출석 시각 (결석이면 null)
  status: string;                 // "출석" | "결석"
  rewardXp: number;
}

// GET /api/member/main/attendance 응답 타입
interface AttendanceData {
  attendanceRate: number;           // 출석률 (%)
  attendanceCount: number;          // 출석 횟수
  absenceCount: number;             // 결석 횟수
  totalEventCount: number;          // 전체 이벤트 수
  totalEarnedXp: number;            // 누적 획득 XP
  attendanceRank: number;           // 출석 순위
  attendanceHistory: AttendanceHistoryItem[];
}

const Attendance = () => {
  const navigate = useNavigate();

  // 서버에서 받아온 출석 데이터
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 마운트 시 출석 데이터 조회
  useEffect(() => {
    apiFetch<AttendanceData>("/api/member/main/attendance")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // null 안전 처리: 로딩 중에는 기본값 0 사용
  const attendanceRate = data?.attendanceRate ?? 0;
  const attended = data?.attendanceCount ?? 0;
  const absent = data?.absenceCount ?? 0;
  const totalMeetings = data?.totalEventCount ?? 0;
  const totalXP = data?.totalEarnedXp ?? 0;
  const rank = data?.attendanceRank ?? 0;
  const history = data?.attendanceHistory ?? [];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      <header className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#FFFFFF" }}>
        <button className="flex items-center gap-2" onClick={() => navigate("/main")}>
          <ComaLogo size="sm" />
          <span className="font-bold text-lg" style={{ color: "#0F4C3A" }}>COMA-ROOM</span>
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/notifications")}>
            <Bell className="w-5 h-5" style={{ color: "#6B7280" }} />
          </button>
          <User className="w-5 h-5" style={{ color: "#6B7280" }} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Menu className="w-5 h-5" style={{ color: "#6B7280" }} />
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
                <Settings className="w-4 h-4" style={{ color: "#6B7280" }} />
                <span style={{ color: "#0F4C3A" }}>설정</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-5">
        <button onClick={() => navigate("/main")} className="flex items-center gap-1 text-sm" style={{ color: "#10B981" }}>
          <ArrowLeft className="w-4 h-4" />
          메인으로
        </button>

        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F4C3A" }}>출석 기록</h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>나의 출석 현황을 확인해 보세요.</p>
        </div>

        {/* 로딩 스피너 */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#10B981" }} />
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFF1F2", border: "1px solid #FFE4E6" }}>
            <p className="text-sm" style={{ color: "#C70036" }}>데이터를 불러오지 못했습니다. {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 출석률 카드 - 출석률 % + 프로그레스바 + 출석/결석/전체 횟수 */}
            <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #10B981 0%, #0A6647 100%)" }}>
              <p className="text-sm opacity-90 mb-1">출석률</p>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-5xl font-bold">{attendanceRate}%</h2>
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                  <Trophy className="w-8 h-8" />
                </div>
              </div>
              <div className="w-full h-2 rounded-full mb-4" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
                <div className="h-full rounded-full" style={{ width: `${attendanceRate}%`, backgroundColor: "#FFFFFF" }} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{attended}</p>
                  <p className="text-xs opacity-80">출석</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{absent}</p>
                  <p className="text-xs opacity-80">결석</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalMeetings}</p>
                  <p className="text-xs opacity-80">전체</p>
                </div>
              </div>
            </div>

            {/* 획득 XP / 출석 순위 통계 카드 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                <div className="flex items-center gap-1 text-xs mb-1" style={{ color: "#6B7280" }}>
                  <Sparkles className="w-3 h-3" /> 획득 XP
                </div>
                <p className="text-3xl font-bold" style={{ color: "#10B981" }}>{totalXP}</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                <div className="flex items-center gap-1 text-xs mb-1" style={{ color: "#6B7280" }}>
                  <Award className="w-3 h-3" /> 출석 순위
                </div>
                <p className="text-3xl font-bold" style={{ color: "#0F4C3A" }}>#{rank}</p>
              </div>
            </div>

            {/* 출석 내역 목록 - 이벤트별로 출석/결석 표시 */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold" style={{ color: "#0F4C3A" }}>출석 내역</h2>
                {/* QR 출석 인증 페이지로 이동 */}
                <button
                  onClick={() => navigate("/attendance/verify")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: "#10B981" }}
                >
                  QR 출석 인증
                </button>
              </div>
              {history.length === 0 ? (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <p className="text-sm" style={{ color: "#6B7280" }}>출석 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => {
                    const isAttended = item.status === "출석";
                    const dateStr = item.scheduledDate
                      ? item.scheduledDate.replace("T", " ").slice(0, 16)
                      : "-";
                    return (
                      <div key={index} className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold" style={{ color: "#0F4C3A" }}>{item.title}</h3>
                          <div className="flex items-center gap-2">
                            {isAttended ? (
                              <span className="px-2 py-1 rounded-full text-xs flex items-center gap-1" style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}>
                                <CheckCircle className="w-3 h-3" /> 출석
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs flex items-center gap-1" style={{ backgroundColor: "#FFE4E6", color: "#C70036" }}>
                                <XCircle className="w-3 h-3" /> 결석
                              </span>
                            )}
                            {item.rewardXp > 0 && (
                              <span className="text-xs font-medium" style={{ color: "#10B981" }}>+{item.rewardXp} XP</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm" style={{ color: "#6B7280" }}>
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {dateStr}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {item.location || "-"}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /> 출석 시간: {item.actualArrivalTime || "-"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 출석 안내 문구 */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "#D1FAE5" }}>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1" style={{ color: "#0F4C3A" }}>
                출석 안내
              </h3>
              <ul className="text-sm space-y-1" style={{ color: "#0F4C3A" }}>
                <li>정시 출석 시 3 XP를 받을 수 있습니다.</li>
                <li>정기모임 출석은 QR 인증으로 체크합니다.</li>
                <li>꾸준한 출석으로 XP를 모아 보세요.</li>
              </ul>
            </div>
          </>
        )}
      </main>

      {/* 하단 네비게이션 바 */}
      <nav className="flex items-center justify-around py-3 border-t sticky bottom-0" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/main")}>
          <Home className="w-5 h-5" style={{ color: "#10B981" }} />
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>홈</span>
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
          <UserCircle className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>마이</span>
        </button>
      </nav>
    </div>
  );
};

export default Attendance;
