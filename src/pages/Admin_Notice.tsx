import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell, User, Menu, Users, Sparkles, ClipboardCheck, Megaphone,
  LayoutDashboard, FileText, Plus, Edit, Trash2, Pin, PinOff, EyeOff,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/api/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NoticePriority = "URGENT" | "IMPORTANT" | "NORMAL";

type Notice = {
  noticeId: number;
  title: string;
  content: string;
  pinned: boolean;
  hidden: boolean;
  noticePriority: NoticePriority;
  date?: string;
  author?: string;
};

type ApiNotice = {
  noticeId: number;
  noticeTitle: string;
  noticeContent: string;
  noticePriority: NoticePriority;
  createdAt: string;
};

type NoticeListResponse = {
  pinnedNoticeList: ApiNotice[];
  openedNoticeList: ApiNotice[];
};

const PRIORITY_LABEL: Record<NoticePriority, string> = {
  NORMAL: "일반",
  IMPORTANT: "중요",
  URGENT: "긴급",
};

const CATEGORY_OPTIONS: { label: string; value: NoticePriority }[] = [
  { label: "일반", value: "NORMAL" },
  { label: "중요", value: "IMPORTANT" },
  { label: "긴급", value: "URGENT" },
];

const Admin_Notice = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterPriority, setFilterPriority] = useState<NoticePriority | null>(null);

  // Create modal states
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticePriority, setNoticePriority] = useState<NoticePriority>("NORMAL");
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPriority, setEditPriority] = useState<NoticePriority>("NORMAL");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete confirmation states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [noticeActionId, setNoticeActionId] = useState<number | null>(null);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<NoticeListResponse>("/api/notice");
      const toNotice = (n: ApiNotice, pinned: boolean): Notice => ({
        noticeId: n.noticeId,
        title: n.noticeTitle,
        content: n.noticeContent,
        pinned,
        hidden: false,
        noticePriority: n.noticePriority,
        date: n.createdAt?.split("T")[0],
      });
      const sortDesc = (a: Notice, b: Notice) => b.noticeId - a.noticeId;
      const pinned = (data.pinnedNoticeList ?? []).map(n => toNotice(n, true)).sort(sortDesc);
      const opened = (data.openedNoticeList ?? []).map(n => toNotice(n, false)).sort(sortDesc);
      setNotices([...pinned, ...opened]);
    } catch (e) {
      console.error("공지 목록 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const normalCount = notices.filter((n) => n.noticePriority === "NORMAL").length;
  const importantCount = notices.filter((n) => n.noticePriority === "IMPORTANT").length;
  const urgentCount = notices.filter((n) => n.noticePriority === "URGENT").length;

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;

    try {
      await apiFetch(`/api/admin/notice/${deleteTargetId}`, {
        method: "DELETE",
      });
      setNotices((prev) => prev.filter((n) => n.noticeId !== deleteTargetId));
    } catch (e) {
      console.error("공지 삭제 실패:", e);
      alert("삭제에 실패했습니다.");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleEditClick = (notice: Notice) => {
    setEditTargetId(notice.noticeId);
    setEditTitle(notice.title);
    setEditContent(notice.content);
    setEditPriority(notice.noticePriority);
    setIsEditModalOpen(true);
  };

  const handleTogglePinned = async (notice: Notice) => {
    setNoticeActionId(notice.noticeId);
    try {
      await apiFetch(`/api/admin/notice/${notice.noticeId}/pinned`, { method: "PATCH" });
      await fetchNotices();
    } catch (e) {
      console.error("공지 고정 상태 변경 실패:", e);
      alert(e instanceof Error ? e.message : "공지 고정 상태를 변경하지 못했습니다.");
    } finally {
      setNoticeActionId(null);
    }
  };

  const handleHideNotice = async (notice: Notice) => {
    setNoticeActionId(notice.noticeId);
    try {
      await apiFetch(`/api/admin/notice/${notice.noticeId}/hidden`, { method: "PATCH" });
      setNotices((prev) => prev.filter((item) => item.noticeId !== notice.noticeId));
    } catch (e) {
      console.error("공지 숨김 실패:", e);
      alert(e instanceof Error ? e.message : "공지를 숨기지 못했습니다.");
    } finally {
      setNoticeActionId(null);
    }
  };

  const handleUpdateNotice = async () => {
    if (!editTitle.trim() || editTargetId === null) return;

    setIsUpdating(true);
    try {
      await apiFetch(`/api/admin/notice/${editTargetId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          noticePriority: editPriority,
          pinned: false,
          hidden: false,
        }),
      });

      await fetchNotices();
      setIsEditModalOpen(false);
      setEditTargetId(null);
      setEditTitle("");
      setEditContent("");
      setEditPriority("NORMAL");
    } catch (e) {
      console.error("공지 수정 실패:", e);
      alert("수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateNotice = async () => {
    if (!noticeTitle.trim()) return;

    setIsCreating(true);
    try {
      await apiFetch("/api/admin/notice", {
        method: "POST",
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          noticePriority: noticePriority,
          pinned: false,
          hidden: false,
        }),
      });

      await fetchNotices();
      setIsNoticeModalOpen(false);
      setNoticeTitle("");
      setNoticeContent("");
      setNoticePriority("NORMAL");
    } catch (e) {
      console.error("공지 등록 실패:", e);
      alert("등록에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
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
              <DropdownMenuContent
                align="end"
                className="w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-[100]"
              >
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
      </header>

      <main className="flex-1 p-4 pb-24 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold" style={{ color: "#0F4C3A" }}>
            공지사항 관리
          </h1>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
            onClick={() => setIsNoticeModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            공지 작성
          </button>
        </div>

        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
          공지사항을 작성하고 관리하세요
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {(
            [
              { priority: "NORMAL" as NoticePriority, label: "일반", count: normalCount },
              { priority: "IMPORTANT" as NoticePriority, label: "중요", count: importantCount },
              { priority: "URGENT" as NoticePriority, label: "긴급", count: urgentCount },
            ]
          ).map(({ priority, label, count }) => {
            const active = filterPriority === priority;
            return (
              <button
                key={priority}
                onClick={() => setFilterPriority(active ? null : priority)}
                className="rounded-xl p-3 text-center transition-colors"
                style={{
                  backgroundColor: active ? "#10B981" : "#FFFFFF",
                  border: active ? "2px solid #10B981" : "1px solid #D1FAE5",
                }}
              >
                <p className="text-2xl font-bold" style={{ color: active ? "#FFFFFF" : "#10B981" }}>
                  {count}
                </p>
                <p className="text-xs" style={{ color: active ? "#D1FAE5" : "#6B7280" }}>
                  {label}
                </p>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: "#6B7280" }}>
            불러오는 중...
          </div>
        ) : (
          <div className="space-y-3">
            {(filterPriority ? notices.filter((n) => n.noticePriority === filterPriority) : notices).length === 0 ? (
              <div
                className="rounded-xl p-8 text-center"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
              >
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  {filterPriority ? `${PRIORITY_LABEL[filterPriority]} 공지사항이 없습니다` : "등록된 공지사항이 없습니다"}
                </p>
              </div>
            ) : null}
            {(filterPriority ? notices.filter((n) => n.noticePriority === filterPriority) : notices).map((notice) => (
              <div
                key={notice.noticeId}
                className="rounded-xl p-4"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor:
                            notice.noticePriority === "NORMAL"
                              ? "#D1FAE5"
                              : notice.noticePriority === "IMPORTANT"
                              ? "#FEE685"
                              : "#FECACA",
                          color:
                            notice.noticePriority === "NORMAL"
                              ? "#047857"
                              : notice.noticePriority === "IMPORTANT"
                              ? "#92400E"
                              : "#B91C1C",
                        }}
                      >
                        {PRIORITY_LABEL[notice.noticePriority]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: "#0F4C3A" }}>
                      {notice.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                      {notice.content}
                    </p>
                    {(notice.date || notice.author) && (
                      <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
                        {notice.date}
                        {notice.date && notice.author ? ` · ${notice.author}` : ""}
                        {!notice.date && notice.author ? notice.author : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleTogglePinned(notice)}
                    disabled={noticeActionId === notice.noticeId}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                    style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                  >
                    {notice.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                    {notice.pinned ? "고정 해제" : "상단 고정"}
                  </button>
                  <button
                    onClick={() => handleHideNotice(notice)}
                    disabled={noticeActionId === notice.noticeId}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                    style={{ backgroundColor: "#F3F4F6", color: "#4B5563" }}
                  >
                    <EyeOff className="w-3 h-3" />
                    숨김
                  </button>
                  <button
                    onClick={() => handleEditClick(notice)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: "#E0E7FF", color: "#6366F1" }}
                  >
                    <Edit className="w-3 h-3" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteClick(notice.noticeId)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: "#FFC9C9", color: "#E7000B" }}
                  >
                    <Trash2 className="w-3 h-3" />
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Notice Modal */}
      <Dialog open={isNoticeModalOpen} onOpenChange={setIsNoticeModalOpen}>
        <DialogContent
          className="mx-4 rounded-2xl max-w-sm"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#0F4C3A" }}>새 공지사항 작성</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "#0F4C3A" }}>
                카테고리
              </label>
              <div className="flex gap-2">
                {CATEGORY_OPTIONS.map((option) => {
                  const selected = noticePriority === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNoticePriority(option.value)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                      style={{
                        backgroundColor: selected ? "#10B981" : "#FFFFFF",
                        color: selected ? "#FFFFFF" : "#0F4C3A",
                        borderColor: selected ? "#10B981" : "#D1FAE5",
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "#0F4C3A" }}>
                제목
              </label>
              <Input
                placeholder="공지사항 제목을 입력하세요"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="border-gray-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "#0F4C3A" }}>
                내용
              </label>
              <Textarea
                placeholder="공지사항 내용을 입력하세요"
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                className="border-gray-200 min-h-[120px]"
              />
            </div>

            <button
              onClick={handleCreateNotice}
              disabled={isCreating}
              className="w-full py-3 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
            >
              {isCreating ? "등록 중..." : "공지 작성"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="mx-4 rounded-2xl max-w-sm"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#0F4C3A" }}>공지사항 수정</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "#0F4C3A" }}>
                카테고리
              </label>
              <div className="flex gap-2">
                {CATEGORY_OPTIONS.map((option) => {
                  const selected = editPriority === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEditPriority(option.value)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                      style={{
                        backgroundColor: selected ? "#10B981" : "#FFFFFF",
                        color: selected ? "#FFFFFF" : "#0F4C3A",
                        borderColor: selected ? "#10B981" : "#D1FAE5",
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "#0F4C3A" }}>
                제목
              </label>
              <Input
                placeholder="공지사항 제목을 입력하세요"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border-gray-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "#0F4C3A" }}>
                내용
              </label>
              <Textarea
                placeholder="공지사항 내용을 입력하세요"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="border-gray-200 min-h-[120px]"
              />
            </div>

            <button
              onClick={handleUpdateNotice}
              disabled={isUpdating}
              className="w-full py-3 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
            >
              {isUpdating ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지사항을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제한 공지사항은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 rounded-lg border"
            >
              취소
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: "#E7000B", color: "#FFFFFF" }}
            >
              삭제
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
          <Sparkles className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>XP</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/attendance")}>
          <ClipboardCheck className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>출석</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Megaphone className="w-5 h-5" style={{ color: "#10B981" }} />
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>공지</span>
        </button>
      </nav>
    </div>
  );
};

export default Admin_Notice;
