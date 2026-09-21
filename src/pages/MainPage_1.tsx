// ===================================================
// 일반 사용자 메인 페이지 (홈)
// - 로그인한 부원의 XP, 출석 횟수, 랭킹 등 대시보드 표시
// - 다가오는 일정 / 최근 공지 / 진행 중인 투표 미리보기
// - GET /api/member/main 으로 전체 데이터를 한 번에 조회
// ===================================================

import {
  Bell,
  User,
  Menu,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  MessageSquare,
  Vote,
  Home,
  CalendarDays,
  Megaphone,
  UserCircle,
  Mail,
  Github,
  CalendarCheck,
  BookOpen,
  Images,
  Settings,
} from "lucide-react";
import comaLogo from "@/assets/coma-logo.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UpcomingEvent = {
  title: string;
  date: string;
  dayOfWeek: string;
  time: string;
  location: string;
  rewardXp: number;
};

type Notice = {
  content: string;
  date: string;
  title: string;
};

type VotePoll = {
  description: string;
  remainingDays: number;
  rewardXp: number;
  title: string;
  voteId: number;
};

// GET /api/member/main 응답 타입
type MainData = {
  currentXp: number;
  myRank: number;
  notice: Notice | null;
  remainingXp: number;
  semester: string;
  statAttendanceCount: number;
  statEventCount: number;
  upcomingEvent: UpcomingEvent | null;
  userName?: string;
  name?: string;
  votePoll: VotePoll | null;
};

const MainPage = () => {
  const navigate = useNavigate();

  // 서버에서 받은 메인 대시보드 데이터
  const [mainData, setMainData] = useState<MainData | null>(null);
  // 데이터 로딩 중 여부 (스켈레톤/스피너 표시용)
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 메인 데이터 조회
  useEffect(() => {
    const fetchMain = async () => {
      try {
        const data = await apiFetch<MainData>("/api/member/main");
        setMainData(data);
      } catch (e) {
        console.error("메인 데이터 조회 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMain();
  }, []);

  // null 안전 처리: 데이터 로딩 전에는 기본값 사용
  const displayXP = mainData?.currentXp ?? 0;
  const displayRank = mainData?.myRank ?? 0;
  const attendanceCount = mainData?.statAttendanceCount ?? 0;
  const eventCount = mainData?.statEventCount ?? 0;
  const semester = mainData?.semester ?? "";
  const userName = mainData?.userName || mainData?.name || "";
  const remainingXp = mainData?.remainingXp ?? 0;

  // XP 프로그레스바 퍼센트 계산 (다음 등수까지 남은 XP 기준)
  const xpProgressPercent = remainingXp > 0
    ? Math.min(100, Math.round((displayXP / (displayXP + remainingXp)) * 100))
    : 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #D1FAE5" }}>
        <button className="flex items-center gap-2" onClick={() => navigate("/main")}>
          <img src={comaLogo} alt="COMA Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg" style={{ color: "#0F4C3A" }}>COMA-ROOM</span>
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/notifications")}>
            <Bell className="w-5 h-5" style={{ color: "#6B7280" }} />
          </button>
          <button onClick={() => navigate("/profile")}>
            <User className="w-5 h-5" style={{ color: "#6B7280" }} />
          </button>
          {/* 햄버거 메뉴 - 일정/투표/스터디/앨범/설정 이동 */}
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

      <main className="flex-1 px-4 py-4 pb-20 space-y-5">
        {/* 로딩 중 텍스트 표시 */}
        {loading ? (
          <div className="text-center py-10 text-sm" style={{ color: "#6B7280" }}>불러오는 중...</div>
        ) : (
          <>
            {/* XP 카드 - 현재 XP, 다음 등수까지 남은 XP, 출석 체크 버튼 */}
            <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #10B981 0%, #0A6647 100%)" }}>
              <p className="text-sm opacity-90 mb-1">{semester}</p>
              <h1 className="text-xl font-bold mb-3">안녕하세요, {userName}님</h1>

              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                  <Sparkles className="w-3 h-3" /> {displayXP} XP
                </span>
                <span className="text-sm opacity-90">현재 XP: {displayXP}</span>
              </div>

              <p className="text-xs opacity-80 mb-2">다음 등수까지 남은 XP: {remainingXp}</p>
              {/* XP 프로그레스바 */}
              <div className="w-full h-2 rounded-full mb-4" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
                <div className="h-full rounded-full" style={{ width: `${xpProgressPercent}%`, backgroundColor: "#FFFFFF" }} />
              </div>

              {/* 출석 체크 버튼 - /attendance 페이지로 이동 */}
              <button
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: "#0A6647", color: "#FFFFFF" }}
                onClick={() => navigate("/attendance")}
              >
                <Sparkles className="w-4 h-4" />
                오늘의 출석 체크
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs mt-3 opacity-80">출석하면 3XP를 받을 수 있어요.</p>
            </div>

            {/* 통계 카드 4개 - XP / 출석 횟수 / 행사 참여 / 현재 순위 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                <div className="flex items-center gap-1 text-xs mb-1" style={{ color: "#6B7280" }}>
                  <Sparkles className="w-3 h-3" /> 총 XP
                </div>
                <p className="text-3xl font-bold" style={{ color: "#10B981" }}>{displayXP}</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                <div className="flex items-center gap-1 text-xs mb-1" style={{ color: "#6B7280" }}>
                  출석 횟수
                </div>
                <p className="text-3xl font-bold" style={{ color: "#0F4C3A" }}>{attendanceCount}회</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                <div className="flex items-center gap-1 text-xs mb-1" style={{ color: "#6B7280" }}>
                  <Calendar className="w-3 h-3" /> 행사 참여
                </div>
                <p className="text-3xl font-bold" style={{ color: "#0F4C3A" }}>{eventCount}회</p>
              </div>
              {/* 순위 클릭 시 리더보드 페이지로 이동 */}
              <div
                className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
                onClick={() => navigate("/leaderboard")}
              >
                <div className="flex items-center gap-1 text-xs mb-1" style={{ color: "#6B7280" }}>
                  이번 학기 순위
                </div>
                <p className="text-3xl font-bold" style={{ color: "#0F4C3A" }}>#{displayRank}</p>
              </div>
            </div>

            {/* 다가오는 일정 섹션 - upcomingEvent가 있을 때만 표시 */}
            {mainData?.upcomingEvent && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold flex items-center gap-2" style={{ color: "#0F4C3A" }}>
                    <Calendar className="w-4 h-4" /> 다가오는 일정
                  </h2>
                  <button className="text-sm flex items-center gap-1" style={{ color: "#10B981" }} onClick={() => navigate("/schedule-list")}>
                    전체보기 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold" style={{ color: "#0F4C3A" }}>{mainData.upcomingEvent.title}</h3>
                    <span className="px-2 py-1 rounded-full text-xs flex items-center gap-1" style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}>
                      <Sparkles className="w-3 h-3" /> {mainData.upcomingEvent.rewardXp} XP
                    </span>
                  </div>
                  <div className="space-y-1 text-sm mb-3" style={{ color: "#6B7280" }}>
                    <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {mainData.upcomingEvent.date} ({mainData.upcomingEvent.dayOfWeek})</p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {mainData.upcomingEvent.time}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {mainData.upcomingEvent.location}</p>
                  </div>
                  <button
                    className="w-full py-3 rounded-xl font-semibold text-sm text-white"
                    style={{ backgroundColor: "#0F4C3A" }}
                    onClick={() => navigate("/schedule")}
                  >
                    일정 보기
                  </button>
                </div>
              </section>
            )}

            {/* 공지사항 미리보기 - notice가 있을 때만 표시 */}
            {mainData?.notice && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold flex items-center gap-2" style={{ color: "#10B981" }}>
                    <MessageSquare className="w-4 h-4" /> 공지사항
                  </h2>
                  <button className="text-sm flex items-center gap-1" style={{ color: "#10B981" }} onClick={() => navigate("/notice")}>
                    자세히 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#D1FAE5" }}>
                      <Megaphone className="w-5 h-5" style={{ color: "#10B981" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1" style={{ color: "#0F4C3A" }}>{mainData.notice.title}</h3>
                      <p className="text-xs mb-2" style={{ color: "#6B7280" }}>{mainData.notice.content}</p>
                      <p className="text-xs">
                        <span style={{ color: "#10B981" }}>운영진</span>
                        <span style={{ color: "#6B7280" }}> {mainData.notice.date}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 진행 중인 투표 미리보기 - votePoll이 있을 때만 표시 */}
            {mainData?.votePoll && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold flex items-center gap-2" style={{ color: "#2B7FFF" }}>
                    <Vote className="w-4 h-4" /> 진행 중인 투표
                  </h2>
                  <button className="text-sm flex items-center gap-1" style={{ color: "#10B981" }} onClick={() => navigate("/vote-list")}>
                    전체보기 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold" style={{ color: "#0F4C3A" }}>{mainData.votePoll.title}</h3>
                    <span className="px-2 py-1 rounded-full text-xs flex items-center gap-1" style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}>
                      <Sparkles className="w-3 h-3" /> +{mainData.votePoll.rewardXp} XP
                    </span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: "#6B7280" }}>{mainData.votePoll.description}</p>
                  <p className="text-xs mb-3 flex items-center gap-2" style={{ color: "#6B7280" }}>
                    <span>D-{mainData.votePoll.remainingDays}</span>
                  </p>
                  <button
                    className="px-4 py-2 rounded-lg font-semibold text-sm"
                    style={{ backgroundColor: "#0F4C3A", color: "#FFFFFF" }}
                    onClick={() => navigate("/vote-list")}
                  >
                    투표하러 가기
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        <div className="text-center py-4">
          <p className="text-sm" style={{ color: "#6B7280" }}>COMA-ROOM과 함께 활동을 기록하고</p>
          <p className="text-sm" style={{ color: "#6B7280" }}>즐거운 동아리 시간을 만들어 보세요.</p>
        </div>

        {/* 푸터 - 동아리 소개, 바로가기, 문의 */}
        <footer className="rounded-xl p-6 space-y-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={comaLogo} alt="COMA Logo" className="w-8 h-8 rounded-lg" />
              <span className="font-bold" style={{ color: "#0F4C3A" }}>COMA-ROOM</span>
            </div>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              COMA 동아리 부원들의 활동을 관리하고 소통하며 함께 성장하는 공간입니다.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-2" style={{ color: "#0F4C3A" }}>바로가기</h4>
            <ul className="space-y-1 text-sm" style={{ color: "#6B7280" }}>
              <li>공지사항</li>
              <li>자주 묻는 질문</li>
              <li>이용약관</li>
              <li>개인정보처리방침</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-2" style={{ color: "#0F4C3A" }}>문의하기</h4>
            <ul className="space-y-1 text-sm" style={{ color: "#6B7280" }}>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@coma-room.com</li>
              <li className="flex items-center gap-2"><Github className="w-4 h-4" /> github.com/COMA-ROOM</li>
            </ul>
          </div>
          <div className="text-center text-xs pt-4 border-t" style={{ borderColor: "#D1FAE5", color: "#6B7280" }}>
            <p>© 2026 COMA-ROOM. All rights reserved.</p>
            <p>Made with love by COMA Team</p>
          </div>
        </footer>
      </main>

      {/* 하단 네비게이션 바 - 홈/일정/공지/마이 */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t z-50" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1">
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

export default MainPage;
