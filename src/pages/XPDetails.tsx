import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Menu,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Sparkles,
  Home,
  CalendarDays,
  Megaphone,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Vote,
  BookOpen,
  Images,
  Settings,
  Lightbulb,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/api/client";

interface XpActivityItem {
  activityType: "REGULAR_MEETING" | "LAB" | "STUDY" | "STAFF" | "EVENT" | "APPROVAL";
  title: string;
  date: string;
  xp: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
}

interface XpHistoryResponse {
  currentLevel: number;
  currentXp: number;
  levelStartXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  attendanceXp: number;
  attendanceCount: number;
  eventXp: number;
  eventCount: number;
  approvalXp: number;
  approvalCount: number;
  totalActivities: number;
  currentPage: number;
  totalPages: number;
  activities: XpActivityItem[];
}

interface RecentActivityLog {
  id: number;
  userName: string;
  studentId: string;
  description: string;
  detail: string;
  dateTime: string;
  grantedXp: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface XpMainResponse {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  recentActivityLogs: RecentActivityLog[];
}

const ACTIVITY_TYPE_LABEL: Record<XpActivityItem["activityType"], string> = {
  REGULAR_MEETING: "출석",
  LAB: "출석",
  STUDY: "출석",
  STAFF: "출석",
  EVENT: "행사",
  APPROVAL: "승인",
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "출석":
      return { bg: "#D1FAE5", text: "#10B981" };
    case "행사":
      return { bg: "#FFEDD4", text: "#CA3500" };
    case "승인":
      return { bg: "#EDE9FE", text: "#7C3AED" };
    default:
      return { bg: "#D1FAE5", text: "#10B981" };
  }
};

const formatDate = (isoDate: string) => {
  const d = new Date(isoDate);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return { date: `${month}월 ${day}일`, time: `${hours}:${minutes}` };
};

const XPDetails = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<XpHistoryResponse | null>(null);
  const [mainData, setMainData] = useState<XpMainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [history, main] = await Promise.all([
          apiFetch<XpHistoryResponse>(`/api/member/xp-history?page=${currentPage}`),
          apiFetch<XpMainResponse>("/api/member/main/xp"),
        ]);
        setData(history);
        setMainData(main);
      } catch (e) {
        setError(e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentPage]);

  const totalXpInLevel = data ? data.nextLevelXp - data.levelStartXp : 1;
  const xpAnalysis = data
    ? [
        { category: "출석", count: data.attendanceCount, xp: data.attendanceXp, percentage: data.currentXp > 0 ? Math.round((data.attendanceXp / data.currentXp) * 1000) / 10 : 0 },
        { category: "행사", count: data.eventCount, xp: data.eventXp, percentage: data.currentXp > 0 ? Math.round((data.eventXp / data.currentXp) * 1000) / 10 : 0 },
        { category: "승인", count: data.approvalCount, xp: data.approvalXp, percentage: data.currentXp > 0 ? Math.round((data.approvalXp / data.currentXp) * 1000) / 10 : 0 },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      <header className="sticky top-0 z-50 px-4 py-3" style={{ backgroundColor: "#10B981" }}>
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate("/main")}>
            <ComaLogo size="sm" />
            <span className="text-white font-bold text-lg">COMA-ROOM</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/notifications")}><Bell className="w-5 h-5 text-white" /></button>
            <button onClick={() => navigate("/profile")}><User className="w-5 h-5 text-white" /></button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="focus:outline-none"><Menu className="w-5 h-5 text-white" /></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-[100]">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/schedule")}><CalendarCheck className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>일정</span></DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/vote-list")}><Vote className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>투표</span></DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/study")}><BookOpen className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>스터디</span></DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/album")}><Images className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>앨범</span></DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/settings")}><Settings className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>설정</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 space-y-5">
        <div>
          <button onClick={() => navigate("/profile")} className="flex items-center gap-2 mb-2" style={{ color: "#0F4C3A" }}>
            <ArrowLeft className="w-4 h-4" />
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold text-lg">활동 내역</span>
          </button>
          <p className="text-sm" style={{ color: "#6B7280" }}>나의 모든 활동과 XP 획득 내역을 확인해 보세요.</p>
        </div>

        {loading && <div className="text-center py-10" style={{ color: "#6B7280" }}>불러오는 중...</div>}
        {error && <div className="text-center py-10 text-red-500">{error}</div>}

        {data && (
          <>
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#D1FAE5" }}>
              <div className="flex items-start justify-between mb-4">
                <div><p className="text-xs mb-1" style={{ color: "#6B7280" }}>현재 레벨</p><p className="text-3xl font-bold" style={{ color: "#10B981" }}>Lv. {data.currentLevel}</p></div>
                <div className="text-right"><p className="text-xs mb-1" style={{ color: "#6B7280" }}>총 XP</p><p className="text-3xl font-bold" style={{ color: "#0F4C3A" }}>{data.currentXp}</p></div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1"><span className="text-xs" style={{ color: "#6B7280" }}>다음 레벨까지</span><span className="text-xs font-medium" style={{ color: "#0F4C3A" }}>{data.xpInCurrentLevel} / {totalXpInLevel} XP</span></div>
                <div className="h-2 rounded-full" style={{ backgroundColor: "rgba(16, 185, 129, 0.3)" }}><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (data.xpInCurrentLevel / totalXpInLevel) * 100)}%`, backgroundColor: "#10B981" }} /></div>
              </div>
            </div>

            {mainData && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <p className="text-2xl font-bold" style={{ color: "#FE9A00" }}>{mainData.pendingCount}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>대기 중</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <p className="text-2xl font-bold" style={{ color: "#10B981" }}>{mainData.approvedCount}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>승인됨</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <p className="text-2xl font-bold" style={{ color: "#E7000B" }}>{mainData.rejectedCount}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>반려됨</p>
                </div>
              </div>
            )}

            <section>
              <h2 className="font-bold mb-3" style={{ color: "#0F4C3A" }}>XP 분석</h2>
              <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                {xpAnalysis.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#F1F5F9", color: "#6B7280" }}>{item.category}</span><span className="text-sm" style={{ color: "#6B7280" }}>{item.count}회</span></div>
                      <span className="text-sm font-medium" style={{ color: "#0F4C3A" }}>{item.xp} XP <span style={{ color: "#6B7280" }}>({item.percentage}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}><div className="h-full rounded-full transition-all" style={{ width: `${item.percentage}%`, backgroundColor: "#10B981" }} /></div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-bold mb-3" style={{ color: "#0F4C3A" }}>전체 활동 ({data.totalActivities})</h2>
              <div className="space-y-3">
                {data.activities.map((activity, idx) => {
                  const label = ACTIVITY_TYPE_LABEL[activity.activityType];
                  const typeColors = getTypeColor(label);
                  const { date, time } = formatDate(activity.date);
                  return (
                    <div key={idx} className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: typeColors.bg, color: typeColors.text }}>{label}</span>
                        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#10B981" }}><Sparkles className="w-3 h-3" />+{activity.xp}XP</span>
                      </div>
                      <h3 className="font-semibold mb-1" style={{ color: "#0F4C3A" }}>{activity.title}</h3>
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#6B7280" }}><Calendar className="w-3 h-3" /><span>{date} · {time}</span></div>
                    </div>
                  );
                })}
              </div>
            </section>

            {mainData && mainData.recentActivityLogs.length > 0 && (
              <section>
                <h2 className="font-bold mb-3" style={{ color: "#0F4C3A" }}>최근 XP 요청 처리</h2>
                <div className="space-y-3">
                  {mainData.recentActivityLogs.slice(0, 5).map((log) => {
                    const { date, time } = formatDate(log.dateTime);
                    return (
                      <div key={log.id} className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div>
                            <p className="font-semibold" style={{ color: "#0F4C3A" }}>{log.description}</p>
                            <p className="text-xs" style={{ color: "#6B7280" }}>{log.detail}</p>
                          </div>
                          <span className="text-sm font-bold" style={{ color: "#10B981" }}>+{log.grantedXp} XP</span>
                        </div>
                        <div className="flex items-center justify-between text-xs" style={{ color: "#6B7280" }}>
                          <span>{date} {time}</span>
                          <span>{log.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {data.totalPages > 1 && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E2E2" }} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" style={{ color: "#6B7280" }} /></button>
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => <button key={page} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium" style={{ backgroundColor: currentPage === page ? "#10B981" : "#FFFFFF", color: currentPage === page ? "#FFFFFF" : "#6B7280", border: currentPage === page ? "none" : "1px solid #E2E2E2" }} onClick={() => setCurrentPage(page)}>{page}</button>)}
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E2E2" }} onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))} disabled={currentPage === data.totalPages}><ChevronRight className="w-4 h-4" style={{ color: "#6B7280" }} /></button>
                </div>
                <p className="text-sm" style={{ color: "#6B7280" }}>{(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, data.totalActivities)} / 전체 {data.totalActivities}개</p>
              </div>
            )}
          </>
        )}

        <div className="rounded-xl p-4" style={{ backgroundColor: "#D1FAE5" }}>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1" style={{ color: "#10B981" }}><Lightbulb className="w-4 h-4" /> XP 안내</h3>
          <ul className="text-sm space-y-1" style={{ color: "#0F4C3A" }}>
            <li>XP는 출석, 행사 참여, 투표 등으로 획득할 수 있어요.</li>
            <li>레벨이 오르면 단계별 혜택을 받을 수 있습니다.</li>
            <li>꾸준한 활동으로 상위권에 도전해 보세요.</li>
          </ul>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/main")}><Home className="w-5 h-5" style={{ color: "#6B7280" }} /><span className="text-xs" style={{ color: "#6B7280" }}>홈</span></button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/schedule")}><CalendarDays className="w-5 h-5" style={{ color: "#6B7280" }} /><span className="text-xs" style={{ color: "#6B7280" }}>일정</span></button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/notice")}><Megaphone className="w-5 h-5" style={{ color: "#6B7280" }} /><span className="text-xs" style={{ color: "#6B7280" }}>공지</span></button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/profile")}><UserCircle className="w-5 h-5" style={{ color: "#10B981" }} /><span className="text-xs font-medium" style={{ color: "#10B981" }}>마이</span></button>
      </nav>
    </div>
  );
};

export default XPDetails;
