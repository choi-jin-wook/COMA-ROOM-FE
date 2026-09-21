// ===================================================
// 관리자 메인 페이지 (대시보드)
// - 빠른 관리 메뉴 (부원/XP/출석/투표/공지/통계)
// - 이번 학기 상위 5명 랭킹 표시
// - GET /api/member/leaderboard 로 랭킹 데이터 조회
// ===================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, Menu, Users, Sparkles, Calendar, ArrowRight, LayoutDashboard, UserCheck, Megaphone, BarChart3, Images, ClipboardCheck, Trophy, Loader2 } from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { apiFetch } from "@/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 랭킹 항목 타입
interface RankingItem {
  rank: number;
  name: string;
  major: string;
  xp: number;
  isMe: boolean; // 현재 로그인한 사용자 여부
}

// GET /api/member/leaderboard 응답 타입
interface LeaderboardResponse {
  myRanking: {
    rank: number;
    name: string;
    major: string;
    xp: number;
  };
  topThreeRankings: RankingItem[]; // 1~3위
  allRankings: RankingItem[];      // 전체 순위 목록
}

const Admin_MainPage = () => {
  const navigate = useNavigate();

  // 서버에서 받아온 전체 랭킹 목록
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(true);

  // 마운트 시 랭킹 데이터 조회
  useEffect(() => {
    apiFetch<LeaderboardResponse>("/api/member/leaderboard")
      .then((data) => setRankings(data.allRankings ?? []))
      .catch(() => setRankings([]))
      .finally(() => setRankingsLoading(false));
  }, []);

  // 순위별 배경색 - 1위: 금색, 2위: 녹색, 3위: 금색, 나머지: 흰색
  const getRankBgColor = (rank: number) => {
    if (rank === 1) return "#FEE685";
    if (rank === 2) return "#DCFCE7";
    if (rank === 3) return "#FEE685";
    return "#FFFFFF";
  };

  // 순위별 이름 텍스트 색상 - 상위 3명은 초록색 계열
  const getRankTextColor = (rank: number) => {
    if (rank <= 3) return "#008236";
    return "#0F4C3A";
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8FFFE' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3" style={{ backgroundColor: '#10B981' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ComaLogo size="sm" />
            <span className="text-white font-bold text-lg">COMA-ROOM</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/notice')}>
              <Bell className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => navigate('/admin')}>
              <User className="w-5 h-5 text-white" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Menu className="w-5 h-5 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-[100]">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate('/admin/events')}>
                  <Calendar className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <span style={{ color: '#0F4C3A' }}>행사 관리</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate('/admin/studies/new')}>
                  <span style={{ color: '#0F4C3A' }}>스터디 관리</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate('/admin/albums')}>
                  <Images className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <span style={{ color: '#0F4C3A' }}>앨범 승인</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate('/admin')}>
                  <User className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <span style={{ color: '#0F4C3A' }}>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* 관리자 모드 배지 */}
        <div className="mt-2">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#008236', color: '#FFFFFF' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            관리자 모드
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24">
        {/* 환영 카드 */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'linear-gradient(135deg, #10B981 0%, #008236 100%)' }}
        >
          <p className="text-sm text-white opacity-90 mb-1">관리자 페이지</p>
          <h1 className="text-xl font-bold text-white">안녕하세요, 운영자 님! 👋</h1>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#10B981' }}>운영자 대시보드</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>COMA-ROOM 전체 관리 및 통계를 확인하세요</p>
        </div>

        {/* 빠른 관리 메뉴 - 각 관리 페이지로 이동하는 카드 */}
        <h3 className="font-bold mb-3" style={{ color: '#0F4C3A' }}>빠른 관리</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5' }}
            onClick={() => navigate('/admin/members')}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#D1FAE5' }}>
              <Users className="w-5 h-5" style={{ color: '#10B981' }} />
            </div>
            <h4 className="font-semibold text-sm" style={{ color: '#0F4C3A' }}>부원 관리</h4>
            <p className="text-xs" style={{ color: '#6B7280' }}>전체 부원 및 XP 관리</p>
          </div>

          <div
            className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5' }}
            onClick={() => navigate('/admin/xp')}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#D1FAE5' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#10B981' }} />
            </div>
            <h4 className="font-semibold text-sm" style={{ color: '#0F4C3A' }}>XP 관리</h4>
            <p className="text-xs" style={{ color: '#6B7280' }}>XP 부여 및 승인</p>
          </div>

          <div
            className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5' }}
            onClick={() => navigate('/admin/attendance')}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#D1FAE5' }}>
              <UserCheck className="w-5 h-5" style={{ color: '#10B981' }} />
            </div>
            <h4 className="font-semibold text-sm" style={{ color: '#0F4C3A' }}>출석 관리</h4>
            <p className="text-xs" style={{ color: '#6B7280' }}>출석 확인 및 수정</p>
          </div>

          <div
            className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5' }}
            onClick={() => navigate('/admin/events')}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#D1FAE5' }}>
              <Calendar className="w-5 h-5" style={{ color: '#10B981' }} />
            </div>
            <h4 className="font-semibold text-sm" style={{ color: '#0F4C3A' }}>행사 관리</h4>
            <p className="text-xs" style={{ color: '#6B7280' }}>행사 생성 및 관리</p>
          </div>

          <div
            className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5' }}
            onClick={() => navigate('/admin/notice')}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#D1FAE5' }}>
              <Megaphone className="w-5 h-5" style={{ color: '#10B981' }} />
            </div>
            <h4 className="font-semibold text-sm" style={{ color: '#0F4C3A' }}>공지사항</h4>
            <p className="text-xs" style={{ color: '#6B7280' }}>공지 작성 및 관리</p>
          </div>

          <div
            className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#D1FAE5' }}>
              <BarChart3 className="w-5 h-5" style={{ color: '#10B981' }} />
            </div>
            <h4 className="font-semibold text-sm" style={{ color: '#0F4C3A' }}>통계 조회</h4>
            <p className="text-xs" style={{ color: '#6B7280' }}>활동 통계 및 분석</p>
          </div>
        </div>

        {/* 이번 학기 랭킹 - 상위 5명만 표시 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold" style={{ color: '#0F4C3A' }}>이번 학기 랭킹</h3>
          <button
            className="text-sm flex items-center gap-1"
            style={{ color: '#10B981' }}
            onClick={() => navigate('/admin/leaderboard')}
          >
            전체보기 <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 랭킹 로딩 중 */}
        {rankingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#10B981' }} />
          </div>
        ) : rankings.length === 0 ? (
          // 랭킹 데이터 없음
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5' }}>
            <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: '#D1FAE5' }} />
            <p className="text-sm" style={{ color: '#6B7280' }}>랭킹 데이터가 없습니다.</p>
          </div>
        ) : (
          // 상위 5명 랭킹 카드 목록
          <div className="space-y-2 mb-6">
            {rankings.slice(0, 5).map((member) => (
              <div
                key={member.rank}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{
                  backgroundColor: getRankBgColor(member.rank),
                  border: member.rank > 3 ? '1px solid #D1FAE5' : 'none',
                }}
              >
                {/* 순위 원형 배지 */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: member.rank <= 3 ? '#10B981' : '#DCFCE7',
                    color: member.rank <= 3 ? '#FFFFFF' : '#10B981',
                  }}
                >
                  {member.rank}
                </div>
                {/* 이름 및 학과 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: getRankTextColor(member.rank) }}>
                      {member.name}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{member.major}</p>
                </div>
                {/* XP */}
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: '#10B981' }}>{member.xp ?? 0}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t" style={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5' }}>
        <button className="flex flex-col items-center gap-1">
          <LayoutDashboard className="w-5 h-5" style={{ color: '#10B981' }} />
          <span className="text-xs font-medium" style={{ color: '#10B981' }}>대시보드</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate('/admin/members')}>
          <Users className="w-5 h-5" style={{ color: '#6B7280' }} />
          <span className="text-xs" style={{ color: '#6B7280' }}>부원</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate('/admin/xp')}>
          <Sparkles className="w-5 h-5" style={{ color: '#6B7280' }} />
          <span className="text-xs" style={{ color: '#6B7280' }}>XP</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate('/admin/attendance')}>
          <ClipboardCheck className="w-5 h-5" style={{ color: '#6B7280' }} />
          <span className="text-xs" style={{ color: '#6B7280' }}>출석</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate('/admin/notice')}>
          <Megaphone className="w-5 h-5" style={{ color: '#6B7280' }} />
          <span className="text-xs" style={{ color: '#6B7280' }}>공지</span>
        </button>
      </nav>
    </div>
  );
};

export default Admin_MainPage;
