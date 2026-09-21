// ===================================================
// 공지사항 페이지
// - 고정 공지(pinned)를 목록 상단에 우선 표시
// - 우선순위(URGENT/IMPORTANT/NORMAL)에 따라 배지 색상 구분
// - 공지 클릭 시 Dialog로 상세 내용 표시
// - GET /api/notice?page=0 으로 데이터 조회
// ===================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Menu,
  Megaphone,
  MapPin,
  Clock,
  Key,
  Calendar,
  Home,
  CalendarDays,
  UserCircle,
  CalendarCheck,
  Vote,
  BookOpen,
  Images,
  Settings,
  Lightbulb,
  Pin,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API 응답의 공지 항목 타입
interface ApiNotice {
  noticeId: number;
  noticeTitle: string;
  noticeContent: string;
  createdAt: string;
  noticePriority: "URGENT" | "NORMAL" | "IMPORTANT";
}

// GET /api/notice 응답 타입
interface NoticeResponse {
  totalNoticeCount: number;
  pinnedNoticeCount: number;
  openedNoticeCount: number;
  pinnedNoticeList: ApiNotice[];  // 고정 공지 목록
  openedNoticeList: ApiNotice[];  // 일반 공지 목록
}

// 내부적으로 사용하는 공지 타입 (pinned 여부 포함)
type NoticeItem = {
  noticeId: number;
  title: string;
  content: string;
  createdAt: string;
  pinned: boolean;
  noticePriority: "URGENT" | "NORMAL" | "IMPORTANT";
};

// 우선순위별 배지 색상 및 레이블 정의
const PRIORITY_STYLE: Record<NoticeItem["noticePriority"], { bg: string; text: string; label: string }> = {
  URGENT:    { bg: "#FEE685", text: "#BB4D00", label: "중요" },
  NORMAL:    { bg: "#D1FAE5", text: "#10B981", label: "일반" },
  IMPORTANT: { bg: "#E9D4FF", text: "#8200DB", label: "안내" },
};

// API 응답 → 내부 NoticeItem 변환
function mapNotice(notice: ApiNotice, pinned: boolean): NoticeItem {
  return {
    noticeId: notice.noticeId,
    title: notice.noticeTitle,
    content: notice.noticeContent,
    createdAt: notice.createdAt,
    pinned,
    noticePriority: notice.noticePriority,
  };
}

const NoticePage = () => {
  const navigate = useNavigate();

  // 합쳐진 공지 목록 (고정 공지 먼저, 중복 제거)
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 상세보기 Dialog에 표시할 선택된 공지
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  // 마운트 시 공지 목록 조회 및 가공
  useEffect(() => {
    apiFetch<NoticeResponse>("/api/notice?page=0")
      .then((res) => {
        const sortDesc = (a: NoticeItem, b: NoticeItem) =>
          b.noticeId - a.noticeId;
        const pinned = (res.pinnedNoticeList ?? []).map((notice) => mapNotice(notice, true)).sort(sortDesc);
        const opened = (res.openedNoticeList ?? []).map((notice) => mapNotice(notice, false)).sort(sortDesc);
        // 고정 공지 ID 추출 (중복 방지용)
        const pinnedIds = new Set(pinned.map((notice) => notice.noticeId));
        // 고정 공지를 앞에, 일반 공지(중복 제외)를 뒤에 합침
        const merged = [...pinned, ...opened.filter((notice) => !pinnedIds.has(notice.noticeId))];
        setNotices(merged);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ISO 날짜 문자열에서 날짜 부분만 추출 (예: "2026-04-01T00:00:00" → "2026-04-01")
  const formatDate = (iso: string) => iso?.split("T")[0] ?? iso;

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
                  <Settings className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>설정</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-5 h-5" style={{ color: "#10B981" }} />
            <h1 className="text-xl font-bold" style={{ color: "#10B981" }}>공지사항</h1>
          </div>
          <p className="text-sm" style={{ color: "#6B7280" }}>동아리 소식과 공지를 확인하세요</p>
        </div>

        {/* 동아리방 위치 및 운영 시간 안내 카드 (정적 정보) */}
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #1D293D 0%, #0F172B 100%)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">동아리방 위치</h2>
              <p className="text-white text-xs opacity-80">COMA-ROOM 찾아오는 길</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4 opacity-80" />
              <div>
                <p className="text-sm font-medium">동아리방</p>
                <p className="text-xs opacity-80">인문관 N456호</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 opacity-80" />
              <div>
                <p className="text-sm font-medium">운영 시간</p>
                <p className="text-xs opacity-80">평일 09:00 - 21:00</p>
                <p className="text-xs opacity-80">주말 12:00 - 18:00</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              <Key className="w-4 h-4 text-white opacity-80" />
              <p className="text-white text-xs">동아리방 비밀번호는 0456입니다</p>
            </div>
          </div>
        </div>

        {/* 공지 목록 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-4 h-4" style={{ color: "#0F4C3A" }} />
            <h2 className="font-bold" style={{ color: "#0F4C3A" }}>최근 공지</h2>
          </div>

          {/* 로딩 스피너 */}
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#10B981" }} />
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFF1F2", border: "1px solid #FFE4E6" }}>
              <p className="text-sm" style={{ color: "#C70036" }}>공지를 불러오지 못했습니다. {error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {notices.length === 0 ? (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <p className="text-sm" style={{ color: "#6B7280" }}>등록된 공지사항이 없습니다.</p>
                </div>
              ) : (
                // 공지 카드 - 클릭 시 selectedNotice 설정 → Dialog 열림
                notices.map((notice) => {
                  const style = PRIORITY_STYLE[notice.noticePriority];
                  return (
                    <div
                      key={notice.noticeId}
                      className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
                      onClick={() => setSelectedNotice(notice)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {/* 고정 공지 핀 아이콘 */}
                          {notice.pinned && <Pin className="w-4 h-4" style={{ color: "#FE9A00" }} />}
                          <h3 className="font-semibold text-sm" style={{ color: "#0F4C3A" }}>{notice.title}</h3>
                        </div>
                        {/* 우선순위 배지 */}
                        <span className="px-2 py-1 rounded text-xs font-medium flex-shrink-0" style={{ backgroundColor: style.bg, color: style.text }}>
                          {style.label}
                        </span>
                      </div>
                      {/* 내용 미리보기 (최대 2줄) */}
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: "#6B7280" }}>{notice.content}</p>
                      <div className="flex items-center justify-between text-xs" style={{ color: "#90A1B9" }}>
                        <span>{notice.pinned ? "고정 공지" : "일반 공지"}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(notice.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* 공지사항 이용 안내 */}
        <div className="rounded-xl p-4" style={{ backgroundColor: "#D1FAE5" }}>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1" style={{ color: "#10B981" }}>
            <Lightbulb className="w-4 h-4" /> 공지사항 안내
          </h3>
          <ul className="text-sm space-y-1" style={{ color: "#0F4C3A" }}>
            <li>중요 공지는 상단에 고정됩니다.</li>
            <li>새로운 공지가 올라오면 알림으로 받을 수 있습니다.</li>
            <li>공지사항은 운영진만 작성할 수 있습니다.</li>
          </ul>
        </div>
      </main>

      {/* 공지 상세 Dialog - 공지 클릭 시 열림, 바깥 클릭 시 닫힘 */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-[90%] sm:max-w-md rounded-2xl" style={{ backgroundColor: "#FFFFFF" }}>
          {selectedNotice && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: PRIORITY_STYLE[selectedNotice.noticePriority].bg,
                      color: PRIORITY_STYLE[selectedNotice.noticePriority].text,
                    }}
                  >
                    {PRIORITY_STYLE[selectedNotice.noticePriority].label}
                  </span>
                </div>
                <DialogTitle className="text-left" style={{ color: "#0F4C3A" }}>
                  {selectedNotice.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{selectedNotice.content}</p>
                <div className="flex items-center justify-between text-xs pt-4 border-t" style={{ color: "#6B7280", borderColor: "#D1FAE5" }}>
                  <span>{selectedNotice.pinned ? "고정 공지" : "일반 공지"}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedNotice.createdAt)}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/main")}>
          <Home className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>홈</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/schedule")}>
          <CalendarDays className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>일정</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Megaphone className="w-5 h-5" style={{ color: "#10B981" }} />
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>공지</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/profile")}>
          <UserCircle className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>마이</span>
        </button>
      </nav>
    </div>
  );
};

export default NoticePage;
