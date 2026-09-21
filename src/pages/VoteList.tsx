// ===================================================
// 투표 목록 페이지
// - "진행 중" / "종료됨" 탭으로 투표 구분
// - 진행 중 투표: 옵션 선택 후 투표 제출 가능 (단일/복수 선택)
// - 종료된 투표: 득표 결과 및 순위 표시
// - GET /api/vote/votes?status=IN_PROGRESS|CLOSED
// - POST /api/vote/votes/{voteId}/participate
// ===================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Menu,
  CheckSquare,
  Users,
  Clock,
  CheckCircle,
  Sparkles,
  Home,
  CalendarDays,
  Megaphone,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarCheck,
  Vote,
  BookOpen,
  Images,
  Settings,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/api/client";
import { cancelVote as apiCancelVote } from "@/api/votes";

// 투표 옵션 (각 옵션의 ID, 내용, 득표수)
type ApiVoteOption = {
  voteOptionId: number;
  content: string;
  count: number;
};

// 투표 항목 타입
type ApiVote = {
  voteId: number;
  title: string;
  status: "IN_PROGRESS" | "CLOSED" | "COMPLETED";
  isMultiple: boolean; // true: 복수 선택 가능
  options: ApiVoteOption[];
  voted?: boolean; // 현재 사용자의 투표 여부 (서버 제공)
};

const VoteList = () => {
  const navigate = useNavigate();

  // 현재 선택된 탭 (진행 중 / 종료됨)
  const [activeTab, setActiveTab] = useState<"active" | "ended">("active");

  // 서버에서 받아온 투표 목록
  const [activeVotesApi, setActiveVotesApi] = useState<ApiVote[]>([]);
  const [endedVotesApi, setEndedVotesApi] = useState<ApiVote[]>([]);

  const [loading, setLoading] = useState(false);

  // 투표별 선택된 옵션 ID 목록 { voteId: [optionId, ...] }
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<number, number[]>>({});

  // 이미 투표 완료한 voteId 목록 (클라이언트 측 관리)
  const [votedIds, setVotedIds] = useState<number[]>([]);

  // 취소 처리 중인 voteId
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // 현재 페이지 번호 (0-indexed)
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 진행 중/종료 투표를 동시에 조회
  const fetchVotes = async () => {
    setLoading(true);
    try {
      const [activeData, endedData] = await Promise.all([
        apiFetch<ApiVote[]>(`/api/vote/votes?page=${page + 1}&status=IN_PROGRESS`),
        apiFetch<ApiVote[]>(`/api/vote/votes?page=${page + 1}&status=CLOSED`),
      ]);

      setActiveVotesApi(activeData ?? []);
      setEndedVotesApi(endedData ?? []);
      setTotalPages(Math.max(1, endedData?.length ? page + 2 : page + 1));

      // 서버 응답의 voted 필드로 이미 투표한 항목 초기화
      const alreadyVoted = (activeData ?? [])
        .filter((v) => v.voted)
        .map((v) => v.voteId);
      setVotedIds((prev) => Array.from(new Set([...prev, ...alreadyVoted])));
    } catch (e) {
      console.error("투표 목록 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 시 재조회
  useEffect(() => {
    fetchVotes();
  }, [page]);

  // 특정 옵션의 득표율 계산 (%)
  const getPercent = (options: ApiVoteOption[], count: number) => {
    const total = options.reduce((sum, o) => sum + o.count, 0);
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // 옵션 선택/해제 토글
  // 단일 투표(isMultiple=false): 항상 1개만 유지
  // 복수 투표(isMultiple=true): 이미 선택된 경우 해제, 아닌 경우 추가
  const toggleOption = (vote: ApiVote, optionId: number) => {
    setSelectedOptionIds((prev) => {
      const current = prev[vote.voteId] ?? [];
      if (!vote.isMultiple) {
        return { ...prev, [vote.voteId]: [optionId] };
      }
      const exists = current.includes(optionId);
      const next = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...prev, [vote.voteId]: next };
    });
  };

  // 투표 취소
  // DELETE /api/vote/votes/{voteId}/participate
  const handleCancelVote = async (voteId: number) => {
    setCancellingId(voteId);
    try {
      await apiCancelVote(voteId);
      setVotedIds((prev) => prev.filter((id) => id !== voteId));
      await fetchVotes();
    } catch (e) {
      console.error("투표 취소 실패:", e);
      alert("투표 취소에 실패했습니다.");
    } finally {
      setCancellingId(null);
    }
  };

  // 투표 제출
  // POST /api/vote/votes/{voteId}/participate
  // 성공 시: votedIds에 추가, 서버 응답으로 해당 투표 결과 업데이트
  const handleVoteSubmit = async (vote: ApiVote) => {
    const picked = selectedOptionIds[vote.voteId] ?? [];
    if (picked.length === 0) return;

    try {
      const updated = await apiFetch<ApiVote>(`/api/vote/votes/${vote.voteId}/participate`, {
        method: "POST",
        body: JSON.stringify({ voteOptionId: picked }),
      });

      // 로컬 상태에 투표 완료 기록
      setVotedIds((prev) => (prev.includes(vote.voteId) ? prev : [...prev, vote.voteId]));
      // 선택 초기화
      setSelectedOptionIds((prev) => ({ ...prev, [vote.voteId]: [] }));
      // 서버 응답 데이터로 투표 결과 업데이트
      setActiveVotesApi((prev) => prev.map((v) => (v.voteId === vote.voteId ? updated : v)));
    } catch (e) {
      console.error("투표 제출 실패:", e);
    }
  };

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
              <DropdownMenuContent
                align="end"
                className="w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-[100]"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate("/schedule")}
                >
                  <CalendarCheck className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>일정</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate("/vote-list")}
                >
                  <Vote className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>투표</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate("/study")}
                >
                  <BookOpen className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>스터디</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate("/album")}
                >
                  <Images className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>앨범</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>설정</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="flex items-center gap-2 mb-2">
          <CheckSquare className="w-5 h-5" style={{ color: "#0F4C3A" }} />
          <h1 className="text-xl font-bold" style={{ color: "#0F4C3A" }}>
            투표
          </h1>
        </div>
        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
          의견을 공유하고 XP도 받아 보세요.
        </p>

        {/* 탭 전환 - 진행 중 / 종료됨 */}
        <div className="flex rounded-full p-1 mb-6" style={{ backgroundColor: "#D1FAE5" }}>
          <button
            className="flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === "active" ? "#10B981" : "transparent",
              color: activeTab === "active" ? "#FFFFFF" : "#6B7280",
            }}
            onClick={() => setActiveTab("active")}
          >
            진행 중
          </button>
          <button
            className="flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === "ended" ? "#10B981" : "transparent",
              color: activeTab === "ended" ? "#FFFFFF" : "#6B7280",
            }}
            onClick={() => setActiveTab("ended")}
          >
            종료됨
          </button>
        </div>

        {loading && (
          <div className="text-sm mb-4" style={{ color: "#6B7280" }}>
            불러오는 중...
          </div>
        )}

        <div className="space-y-4 mb-6">
          {activeTab === "active" ? (
            activeVotesApi.length === 0 && !loading ? (
              <div
                className="rounded-xl p-8 text-center"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
              >
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  진행 중인 투표가 없습니다
                </p>
              </div>
            ) : (
              // 진행 중 투표 카드 목록
              activeVotesApi.map((vote) => {
                const isVoted = votedIds.includes(vote.voteId); // 이미 투표했는지
                const picked = selectedOptionIds[vote.voteId] ?? []; // 현재 선택된 옵션들

                return (
                  <div
                    key={vote.voteId}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold" style={{ color: "#0F4C3A" }}>
                        {vote.title}
                      </h3>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                        style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}
                      >
                        <Sparkles className="w-3 h-3" /> +2XP
                      </span>
                    </div>
                    <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
                      {vote.isMultiple ? "복수 선택 가능" : "단일 선택"}
                    </p>

                    {/* 옵션 목록 */}
                    <div className="space-y-3 mb-4">
                      {vote.options.map((option) => (
                        <div key={option.voteOptionId}>
                          {isVoted ? (
                            // 투표 완료 후: 득표율 바 표시
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm" style={{ color: "#0F4C3A" }}>
                                  {option.content}
                                </span>
                                <span className="text-sm" style={{ color: "#6B7280" }}>
                                  {option.count}표 ({getPercent(vote.options, option.count)}%)
                                </span>
                              </div>
                              <div className="h-2 rounded-full" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${getPercent(vote.options, option.count)}%`,
                                    backgroundColor: "#10B981",
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            // 투표 전: 선택 버튼으로 표시
                            <button
                              className="w-full flex items-center gap-3 p-3 rounded-xl border transition-colors"
                              style={{
                                borderColor: picked.includes(option.voteOptionId) ? "#10B981" : "#E2E2E2",
                                backgroundColor: picked.includes(option.voteOptionId)
                                  ? "rgba(16, 185, 129, 0.05)"
                                  : "#FFFFFF",
                              }}
                              onClick={() => toggleOption(vote, option.voteOptionId)}
                            >
                              {/* 선택 여부를 나타내는 원형 인디케이터 */}
                              <div
                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                style={{
                                  borderColor: picked.includes(option.voteOptionId) ? "#10B981" : "#E2E2E2",
                                }}
                              >
                                {picked.includes(option.voteOptionId) && (
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#10B981" }} />
                                )}
                              </div>
                              <span className="text-sm" style={{ color: "#0F4C3A" }}>
                                {option.content}
                              </span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm" style={{ color: "#6B7280" }}>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> -
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> 진행중
                        </span>
                      </div>
                      {isVoted ? (
                        // 투표 완료 상태 + 취소 버튼
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-sm font-medium" style={{ color: "#10B981" }}>
                            <CheckCircle className="w-4 h-4" /> 투표 완료
                          </span>
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                            style={{ backgroundColor: "#FFC9C9", color: "#E7000B" }}
                            disabled={cancellingId === vote.voteId}
                            onClick={() => handleCancelVote(vote.voteId)}
                          >
                            {cancellingId === vote.voteId ? "취소 중..." : "취소"}
                          </button>
                        </div>
                      ) : (
                        // 투표하기 버튼 - 옵션 미선택 시 비활성화
                        <button
                          className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                          style={{ backgroundColor: "#0F4C3A", color: "#FFFFFF" }}
                          disabled={picked.length === 0}
                          onClick={() => handleVoteSubmit(vote)}
                        >
                          투표하기
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : endedVotesApi.length === 0 && !loading ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
            >
              <p className="text-sm" style={{ color: "#6B7280" }}>
                종료된 투표가 없습니다
              </p>
            </div>
          ) : (
            // 종료된 투표 카드 - 득표 순서로 정렬하여 결과 표시
            endedVotesApi.map((vote) => {
              const sorted = [...vote.options].sort((a, b) => b.count - a.count);
              const maxCount = sorted[0]?.count ?? 0;

              return (
                <div
                  key={vote.voteId}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold" style={{ color: "#0F4C3A" }}>
                      {vote.title}
                    </h3>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#F1F5F9", color: "#6B7280" }}
                    >
                      완료
                    </span>
                  </div>
                  <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
                    종료된 투표 결과입니다.
                  </p>
                  {/* 득표 결과 - 1위 항목은 초록색 강조 */}
                  <div className="space-y-3">
                    {sorted.map((option, idx) => {
                      const isWinner = maxCount > 0 && option.count === maxCount;
                      return (
                        <div key={option.voteOptionId}>
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-sm flex items-center gap-1"
                              style={{ color: isWinner ? "#10B981" : "#6B7280" }}
                            >
                              {option.content}
                              {isWinner && <Check className="w-4 h-4" style={{ color: "#10B981" }} />}
                            </span>
                            <span
                              className="text-sm font-medium px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: isWinner ? "#D1FAE5" : "#F1F5F9",
                                color: isWinner ? "#10B981" : "#6B7280",
                              }}
                            >
                              {idx + 1}위 ({option.count}표)
                            </span>
                          </div>
                          {isWinner && <div className="h-1.5 rounded-full" style={{ backgroundColor: "#10B981" }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 종료된 투표 페이지네이션 */}
        {activeTab === "ended" && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <button className="p-1" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft className="w-5 h-5" style={{ color: "#6B7280" }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
                style={{
                  backgroundColor: page === i ? "#10B981" : "#FFFFFF",
                  color: page === i ? "#FFFFFF" : "#6B7280",
                  border: page === i ? "none" : "1px solid #D1FAE5",
                }}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="p-1"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="w-5 h-5" style={{ color: "#6B7280" }} />
            </button>
          </div>
        )}

        {/* 투표 이용 안내 */}
        <div className="rounded-xl p-4" style={{ backgroundColor: "#D1FAE5" }}>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1" style={{ color: "#10B981" }}>
            투표 안내
          </h3>
          <ul className="text-sm space-y-1" style={{ color: "#0F4C3A" }}>
            <li>각 투표에 참여하면 2 XP를 받을 수 있습니다.</li>
            <li>한 투표에는 한 번만 참여할 수 있습니다.</li>
            <li>투표 완료 후 취소 버튼으로 재투표할 수 있습니다.</li>
            <li>마감 전까지 투표를 완료해 주세요.</li>
          </ul>
        </div>
      </main>

      {/* 하단 네비게이션 바 */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}
      >
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/main")}>
          <Home className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>홈</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/schedule")}>
          <CalendarDays className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>일정</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/notice")}>
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

export default VoteList;
