import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  User,
  Menu,
  Trophy,
  Crown,
  ArrowLeft,
  LayoutDashboard,
  Users,
  Sparkles,
  ClipboardCheck,
  Megaphone,
  Loader2,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { apiFetch } from "@/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RankingItem {
  rank: number;
  name: string;
  major: string;
  xp: number;
  isMe: boolean;
}

interface LeaderboardResponse {
  myRanking: {
    rank: number;
    name: string;
    major: string;
    xp: number;
  };
  topThreeRankings: RankingItem[];
  allRankings: RankingItem[];
}

const Admin_Leaderboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<LeaderboardResponse>("/api/member/leaderboard")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const top3 = data?.topThreeRankings ?? [];
  const rankings = data?.allRankings ?? [];

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return { bg: "#F0B100", text: "#FFFFFF" };
    if (rank === 2) return { bg: "#99A1AF", text: "#FFFFFF" };
    if (rank === 3) return { bg: "#BB4D00", text: "#FFFFFF" };
    return { bg: "#10B981", text: "#FFFFFF" };
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className="w-4 h-4" style={{ color: rank === 1 ? "#F0B100" : rank === 2 ? "#99A1AF" : "#BB4D00" }} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      <header className="sticky top-0 z-50 px-4 py-3" style={{ backgroundColor: "#10B981" }}>
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate("/admin")}>
            <ComaLogo size="sm" />
            <span className="text-white font-bold text-lg">COMA-ROOM</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/notice")}>
              <Bell className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => navigate("/admin")}>
              <User className="w-5 h-5 text-white" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Menu className="w-5 h-5 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-[100]">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/admin")}>
                  <User className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>관리자 홈</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => { logout(); navigate("/"); }}>
                  <User className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 space-y-5">
        <button className="flex items-center gap-2 text-sm" style={{ color: "#6B7280" }} onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-4 h-4" />
          관리자 메인
        </button>

        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F4C3A" }}>학기 랭킹</h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>관리자용 전체 XP 랭킹을 확인할 수 있습니다.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#10B981" }} />
          </div>
        )}

        {error && (
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFF1F2", border: "1px solid #FFE4E6" }}>
            <p className="text-sm" style={{ color: "#C70036" }}>랭킹 데이터를 불러오지 못했습니다. {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {top3.length >= 3 && (
              <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #10B981 0%, #0A6647 100%)" }}>
                <div className="flex items-end justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-24 rounded-t-lg flex flex-col items-center justify-center" style={{ backgroundColor: "#99A1AF" }}>
                      <span className="text-white font-bold text-lg">2nd</span>
                      <span className="text-white text-sm font-medium">{top3[1].name}</span>
                      <span className="text-white text-xs opacity-80">{top3[1].xp ?? 0} XP</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Crown className="w-6 h-6 mb-1" style={{ color: "#F0B100" }} />
                    <div className="w-24 h-32 rounded-t-lg flex flex-col items-center justify-center" style={{ backgroundColor: "#F0B100" }}>
                      <span className="text-white font-bold text-xl">1st</span>
                      <span className="text-white text-sm font-medium">{top3[0].name}</span>
                      <span className="text-white text-xs opacity-80">{top3[0].xp ?? 0} XP</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-t-lg flex flex-col items-center justify-center" style={{ backgroundColor: "#BB4D00" }}>
                      <span className="text-white font-bold text-lg">3rd</span>
                      <span className="text-white text-sm font-medium">{top3[2].name}</span>
                      <span className="text-white text-xs opacity-80">{top3[2].xp ?? 0} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <section>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#0F4C3A" }}>전체 순위</h2>
              <div className="space-y-3">
                {rankings.map((item) => (
                  <div
                    key={`${item.rank}-${item.name}`}
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(item.rank)}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: getRankBadgeColor(item.rank).bg, color: getRankBadgeColor(item.rank).text }}
                      >
                        {item.rank}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: "#0F4C3A" }}>{item.name}</p>
                        <p className="text-xs" style={{ color: "#6B7280" }}>{item.major}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={{ color: "#10B981" }}>{item.xp ?? 0}</p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin")}>
          <LayoutDashboard className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>대시보드</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/members")}>
          <Users className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>회원</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/xp")}>
          <Sparkles className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>XP</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/attendance")}>
          <ClipboardCheck className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>출석</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/notice")}>
          <Megaphone className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>공지</span>
        </button>
      </nav>
    </div>
  );
};

export default Admin_Leaderboard;
