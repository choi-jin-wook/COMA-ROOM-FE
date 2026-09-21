import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, User, Menu, Users, Sparkles, LayoutDashboard, ClipboardCheck, Megaphone, ChevronLeft, ChevronRight, Plus, Check, X } from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { apiFetch } from "@/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

interface XpRequest {
  requestId: number;
  requester: string;
  studentId: string;
  rewardXp: number;
  reason: string;
  localDateTime: string;
  approvalStatus: ApprovalStatus;
}

interface XpPageData {
  pending: number;
  approved: number;
  rejected: number;
  eventApprovalResponseDtoList: XpRequest[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

const STATUS_LABEL: Record<ApprovalStatus, { bg: string; color: string; text: string }> = {
  PENDING:  { bg: "#FE9A00", color: "#FFFFFF", text: "대기중" },
  APPROVED: { bg: "#D1FAE5", color: "#10B981", text: "승인" },
  REJECTED: { bg: "#FFC9C9", color: "#E7000B", text: "거부" },
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const Admin_XP = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<"all" | ApprovalStatus>("all");
  const [data, setData] = useState<XpPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<XpPageData>(`/api/admin/member/ask-xp?page=${currentPage - 1}`);
      setData(res);
    } catch (e) {
      console.error("XP 목록 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (requestId: number, status: "APPROVED" | "REJECTED") => {
    setActionLoading(requestId);
    try {
      await apiFetch(`/api/admin/member/ask-xp/status/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ approvalStatus: status }),
      });
      await fetchData();
    } catch (e) {
      console.error("XP 처리 실패:", e);
      alert("처리에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const requests = data?.eventApprovalResponseDtoList ?? [];
  const filteredRequests = requests.filter(r =>
    activeFilter === "all" ? true : r.approvalStatus === activeFilter
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      {/* Header */}
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
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => { logout(); navigate("/"); }}>
                  <User className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#FE9A00", color: "#FFFFFF" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            관리자 모드
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold" style={{ color: "#0F4C3A" }}>XP 관리</h1>
          <button
            onClick={() => navigate("/admin/xp/grant")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
          >
            <Plus className="w-4 h-4" />
            XP 부여
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
          XP 요청을 승인하거나 직접 XP를 부여하세요
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-2xl font-bold" style={{ color: "#FE9A00" }}>{data?.pending ?? "-"}</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>승인 대기</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-2xl font-bold" style={{ color: "#10B981" }}>{data?.approved ?? "-"}</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>승인 완료</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-2xl font-bold" style={{ color: "#E7000B" }}>{data?.rejected ?? "-"}</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>거부</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {([
            { key: "all", label: "전체" },
            { key: "PENDING", label: "승인 대기" },
            { key: "APPROVED", label: "승인 완료" },
            { key: "REJECTED", label: "거부" },
          ] as { key: "all" | ApprovalStatus; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeFilter === f.key ? "#10B981" : "#FFFFFF",
                color: activeFilter === f.key ? "#FFFFFF" : "#6B7280",
                border: activeFilter === f.key ? "none" : "1px solid #D1FAE5",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm" style={{ color: "#6B7280" }}>불러오는 중...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-sm" style={{ color: "#6B7280" }}>XP 요청이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const statusStyle = STATUS_LABEL[request.approvalStatus];
              const isProcessing = actionLoading === request.requestId;
              return (
                <div key={request.requestId} className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: "#0F4C3A" }}>{request.requester}</span>
                      <span className="text-xs" style={{ color: "#6B7280" }}>{request.studentId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: "#10B981" }}>+{request.rewardXp}XP</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {statusStyle.text}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm mb-2" style={{ color: "#0F4C3A" }}>{request.reason}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#6B7280" }}>
                      {formatDateTime(request.localDateTime)}
                    </span>
                    {request.approvalStatus === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleAction(request.requestId, "APPROVED")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                          style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}
                        >
                          <Check className="w-3 h-3" />
                          승인
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleAction(request.requestId, "REJECTED")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                          style={{ backgroundColor: "#FFC9C9", color: "#E7000B" }}
                        >
                          <X className="w-3 h-3" />
                          거부
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: "#6B7280" }} />
            </button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
                style={{
                  backgroundColor: currentPage === page ? "#10B981" : "#FFFFFF",
                  color: currentPage === page ? "#FFFFFF" : "#6B7280",
                  border: currentPage === page ? "none" : "1px solid #D1FAE5",
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
              onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
              disabled={currentPage === data.totalPages}
            >
              <ChevronRight className="w-4 h-4" style={{ color: "#6B7280" }} />
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin")}>
          <LayoutDashboard className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>대시보드</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/members")}>
          <Users className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>부원</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Sparkles className="w-5 h-5" style={{ color: "#10B981" }} />
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>XP</span>
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

export default Admin_XP;
