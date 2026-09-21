import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  User,
  Menu,
  Users,
  Sparkles,
  LayoutDashboard,
  ClipboardCheck,
  Megaphone,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  PENDING: { bg: "#FE9A00", color: "#FFFFFF", text: "대기 중" },
  APPROVED: { bg: "#D1FAE5", color: "#10B981", text: "승인됨" },
  REJECTED: { bg: "#FFC9C9", color: "#E7000B", text: "반려됨" },
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const Admin_XP_Grant = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<"all" | ApprovalStatus>("all");
  const [data, setData] = useState<XpPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [studentId, setStudentId] = useState("");
  const [xpAmount, setXpAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const [grantMessage, setGrantMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<XpPageData>(`/api/admin/member/ask-xp?page=${currentPage - 1}`);
      setData(res);
    } catch (e) {
      console.error("XP request fetch failed:", e);
      setGrantMessage({ type: "error", text: "XP 요청 목록을 불러오지 못했습니다." });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (requestId: number, status: ApprovalStatus) => {
    setActionLoading(requestId);
    try {
      await apiFetch(`/api/admin/member/ask-xp/status/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ approvalStatus: status }),
      });
      await fetchData();
    } catch (e) {
      console.error("XP request update failed:", e);
      setGrantMessage({
        type: "error",
        text: status === "APPROVED" ? "XP 요청 승인에 실패했습니다." : "XP 요청 반려에 실패했습니다.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGrant = async () => {
    const amount = Number(xpAmount);
    if (!studentId.trim() || !Number.isFinite(amount) || amount === 0) {
      setGrantMessage({ type: "error", text: "학번과 XP 수량을 올바르게 입력해 주세요." });
      return;
    }

    setIsGranting(true);
    setGrantMessage(null);
    try {
      await apiFetch("/api/admin/member/provide-xp", {
        method: "POST",
        body: JSON.stringify({
          studentId: studentId.trim(),
          provisionAmount: amount,
          provisionReason: reason.trim() || "관리자 직접 지급",
        }),
      });
      setGrantMessage({
        type: "success",
        text: `${studentId.trim()} 회원에게 ${amount} XP를 지급했습니다.`,
      });
      setStudentId("");
      setXpAmount("0");
      setReason("");
      await fetchData();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setGrantMessage({ type: "error", text: `XP 지급에 실패했습니다: ${message}` });
    } finally {
      setIsGranting(false);
    }
  };

  const requests = data?.eventApprovalResponseDtoList ?? [];
  const filteredRequests = requests.filter((request) =>
    activeFilter === "all" ? true : request.approvalStatus === activeFilter
  );

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
              <DropdownMenuContent
                align="end"
                className="w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-[100]"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate("/admin")}
                >
                  <User className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>관리자 홈</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => { logout(); navigate("/"); }}
                >
                  <User className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-2">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: "#FE9A00", color: "#FFFFFF" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            관리자 모드
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold" style={{ color: "#0F4C3A" }}>
            XP 부여 및 승인
          </h1>
          <button
            onClick={() => navigate("/admin/xp")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "#FFFFFF", color: "#0F4C3A", border: "1px solid #D1FAE5" }}
          >
            목록으로
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
          XP 요청을 승인하거나 특정 회원에게 직접 XP를 지급할 수 있습니다.
        </p>

        <div
          className="rounded-2xl p-5 mb-4"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: "#10B981" }} />
            <h2 className="font-bold text-base" style={{ color: "#0F4C3A" }}>
              XP 직접 지급
            </h2>
          </div>

          {grantMessage && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: grantMessage.type === "success" ? "#D1FAE5" : "#FFF1F2",
                color: grantMessage.type === "success" ? "#0F4C3A" : "#C70036",
              }}
            >
              {grantMessage.text}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>
              학번
            </label>
            <input
              type="text"
              placeholder="예: 2021123456"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #D1FAE5",
                color: "#0F4C3A",
              }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>
              XP 수량
            </label>
            <input
              type="number"
              value={xpAmount}
              onChange={(e) => setXpAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #D1FAE5",
                color: "#0F4C3A",
              }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>
              사유
            </label>
            <textarea
              placeholder="지급 사유를 입력해 주세요."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg text-sm resize-none"
              style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #D1FAE5",
                color: "#0F4C3A",
              }}
            />
          </div>

          <button
            onClick={handleGrant}
            disabled={isGranting || !studentId.trim() || Number(xpAmount) === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
          >
            {isGranting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGranting ? "지급 중..." : "XP 지급하기"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-2xl font-bold" style={{ color: "#FE9A00" }}>{data?.pending ?? "-"}</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>대기 중</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-2xl font-bold" style={{ color: "#10B981" }}>{data?.approved ?? "-"}</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>승인됨</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-2xl font-bold" style={{ color: "#E7000B" }}>{data?.rejected ?? "-"}</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>반려됨</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {([
            { key: "all", label: "전체" },
            { key: "PENDING", label: "대기 중" },
            { key: "APPROVED", label: "승인됨" },
            { key: "REJECTED", label: "반려됨" },
          ] as { key: "all" | ApprovalStatus; label: string }[]).map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeFilter === filter.key ? "#10B981" : "#FFFFFF",
                color: activeFilter === filter.key ? "#FFFFFF" : "#6B7280",
                border: activeFilter === filter.key ? "none" : "1px solid #D1FAE5",
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm" style={{ color: "#6B7280" }}>
            불러오는 중...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-sm" style={{ color: "#6B7280" }}>XP 요청이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const statusStyle = STATUS_LABEL[request.approvalStatus];
              const isProcessing = actionLoading === request.requestId;
              return (
                <div
                  key={request.requestId}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: "#0F4C3A" }}>
                        {request.requester}
                      </span>
                      <span className="text-xs" style={{ color: "#6B7280" }}>
                        {request.studentId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: "#10B981" }}>
                        +{request.rewardXp} XP
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                      >
                        {statusStyle.text}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm mb-2" style={{ color: "#0F4C3A" }}>
                    {request.reason}
                  </p>

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
                          반려
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: "#6B7280" }} />
            </button>
            {Array.from({ length: data.totalPages }, (_, index) => index + 1).map((page) => (
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
              onClick={() => setCurrentPage((page) => Math.min(data.totalPages, page + 1))}
              disabled={currentPage === data.totalPages}
            >
              <ChevronRight className="w-4 h-4" style={{ color: "#6B7280" }} />
            </button>
          </div>
        )}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}
      >
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin")}>
          <LayoutDashboard className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>대시보드</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/members")}>
          <Users className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>회원</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/xp")}>
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

export default Admin_XP_Grant;
