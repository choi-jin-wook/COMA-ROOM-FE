import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  User,
  Menu,
  Users,
  Sparkles,
  ClipboardCheck,
  Megaphone,
  LayoutDashboard,
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { apiFetch } from "@/api/client";
import { addVoteOption, closeVote, deleteVote, deleteVoteOption, updateVote } from "@/api/votes";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type VoteOption = {
  voteOptionId: number;
  content: string;
  count: number;
};

type ApiVote = {
  voteId: number;
  title: string;
  status: "IN_PROGRESS" | "CLOSED";
  isMultiple: boolean;
  options: VoteOption[];
};

const Admin_Vote = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [voteTab, setVoteTab] = useState<"ongoing" | "completed">("ongoing");
  const [activeVotes, setActiveVotes] = useState<ApiVote[]>([]);
  const [closedVotes, setClosedVotes] = useState<ApiVote[]>([]);
  const [votesLoading, setVotesLoading] = useState(true);
  const [voteActionId, setVoteActionId] = useState<number | null>(null);

  const [deleteVoteTarget, setDeleteVoteTarget] = useState<number | null>(null);
  const [isDeleteVoteDialogOpen, setIsDeleteVoteDialogOpen] = useState(false);

  const [isEditVoteModalOpen, setIsEditVoteModalOpen] = useState(false);
  const [editVoteTarget, setEditVoteTarget] = useState<ApiVote | null>(null);
  const [editVoteTitle, setEditVoteTitle] = useState("");
  const [editVoteIsMultiple, setEditVoteIsMultiple] = useState(false);
  const [editVoteDeadlineDate, setEditVoteDeadlineDate] = useState("");
  const [editVoteDeadlineTime, setEditVoteDeadlineTime] = useState("23:59");
  const [newOptionContent, setNewOptionContent] = useState("");
  const [isUpdatingVote, setIsUpdatingVote] = useState(false);
  const [optionActionKey, setOptionActionKey] = useState<string | null>(null);

  const fetchVotes = useCallback(async () => {
    setVotesLoading(true);
    try {
      const [active, closed] = await Promise.all([
        apiFetch<ApiVote[]>("/api/vote/votes?page=1&status=IN_PROGRESS").catch(() => [] as ApiVote[]),
        apiFetch<ApiVote[]>("/api/vote/votes?page=1&status=CLOSED").catch(() => [] as ApiVote[]),
      ]);
      setActiveVotes(active ?? []);
      setClosedVotes(closed ?? []);
    } finally {
      setVotesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const resetEditVoteState = () => {
    setEditVoteTarget(null);
    setEditVoteTitle("");
    setEditVoteIsMultiple(false);
    setEditVoteDeadlineDate("");
    setEditVoteDeadlineTime("23:59");
    setNewOptionContent("");
    setIsUpdatingVote(false);
    setOptionActionKey(null);
  };

  const handleCloseVote = async (voteId: number) => {
    setVoteActionId(voteId);
    try {
      await closeVote(voteId);
      await fetchVotes();
    } catch {
      alert("투표 종료에 실패했습니다.");
    } finally {
      setVoteActionId(null);
    }
  };

  const handleDeleteVoteClick = (voteId: number) => {
    setDeleteVoteTarget(voteId);
    setIsDeleteVoteDialogOpen(true);
  };

  const handleConfirmDeleteVote = async () => {
    if (deleteVoteTarget === null) return;
    try {
      await deleteVote(deleteVoteTarget);
      await fetchVotes();
    } catch {
      alert("투표 삭제에 실패했습니다.");
    } finally {
      setIsDeleteVoteDialogOpen(false);
      setDeleteVoteTarget(null);
    }
  };

  const handleEditVoteClick = (vote: ApiVote) => {
    setEditVoteTarget(vote);
    setEditVoteTitle(vote.title);
    setEditVoteIsMultiple(vote.isMultiple);
    setEditVoteDeadlineDate("");
    setEditVoteDeadlineTime("23:59");
    setNewOptionContent("");
    setIsEditVoteModalOpen(true);
  };

  const buildVoteDeadline = () => {
    if (!editVoteDeadlineDate) return undefined;
    return `${editVoteDeadlineDate}T${editVoteDeadlineTime}:59`;
  };

  const handleUpdateVote = async () => {
    if (!editVoteTarget || !editVoteTitle.trim()) return;
    setIsUpdatingVote(true);
    try {
      const updated = await updateVote(editVoteTarget.voteId, {
        title: editVoteTitle.trim(),
        isMultiple: editVoteIsMultiple,
        deadline: buildVoteDeadline(),
      });
      setEditVoteTarget(updated);
      await fetchVotes();
      setIsEditVoteModalOpen(false);
      resetEditVoteState();
    } catch {
      alert("투표 수정에 실패했습니다.");
    } finally {
      setIsUpdatingVote(false);
    }
  };

  const handleAddOptionToVote = async () => {
    if (!editVoteTarget || !newOptionContent.trim()) return;
    const key = `add-${editVoteTarget.voteId}`;
    setOptionActionKey(key);
    try {
      const updated = await addVoteOption(editVoteTarget.voteId, newOptionContent.trim());
      setEditVoteTarget(updated);
      setNewOptionContent("");
      await fetchVotes();
    } catch {
      alert("옵션 추가에 실패했습니다.");
    } finally {
      setOptionActionKey(null);
    }
  };

  const handleDeleteOptionFromVote = async (optionId: number) => {
    if (!editVoteTarget) return;
    const key = `delete-${optionId}`;
    setOptionActionKey(key);
    try {
      await deleteVoteOption(editVoteTarget.voteId, optionId);
      setEditVoteTarget({
        ...editVoteTarget,
        options: editVoteTarget.options.filter((option) => option.voteOptionId !== optionId),
      });
      await fetchVotes();
    } catch {
      alert("옵션 삭제에 실패했습니다.");
    } finally {
      setOptionActionKey(null);
    }
  };

  const votes = voteTab === "ongoing" ? activeVotes : closedVotes;

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

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" style={{ color: "#0F4C3A" }} />
            <h1 className="text-xl font-bold" style={{ color: "#0F4C3A" }}>투표 관리</h1>
          </div>
          <button
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
            onClick={() => navigate("/admin/vote/create")}
          >
            <Plus className="w-4 h-4" />
            투표 만들기
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>진행 중인 투표와 종료된 투표를 관리할 수 있습니다.</p>

        <div className="flex rounded-lg p-1 mb-6" style={{ backgroundColor: "#F1F5F9" }}>
          {(["ongoing", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setVoteTab(tab)}
              className="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor: voteTab === tab ? "#FFFFFF" : "transparent",
                color: voteTab === tab ? "#10B981" : "#6B7280",
              }}
            >
              {tab === "ongoing" ? "진행 중" : "종료됨"}
            </button>
          ))}
        </div>

        {votesLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#10B981" }} />
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {votes.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  {voteTab === "ongoing" ? "진행 중인 투표가 없습니다" : "종료된 투표가 없습니다"}
                </p>
              </div>
            ) : (
              votes.map((vote) => {
                const total = vote.options.reduce((sum, option) => sum + option.count, 0);
                const isProcessing = voteActionId === vote.voteId;

                return (
                  <div key={vote.voteId} className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold" style={{ color: "#0F4C3A" }}>{vote.title}</h3>
                      <span
                        className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded"
                        style={voteTab === "ongoing" ? { backgroundColor: "#D1FAE5", color: "#10B981" } : { backgroundColor: "#F1F5F9", color: "#6B7280" }}
                      >
                        {voteTab === "ongoing" ? <><Sparkles className="w-3 h-3" />진행중</> : "종료"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {vote.options.map((option) => {
                        const pct = total === 0 ? 0 : Math.round((option.count / total) * 100);
                        return (
                          <div key={option.voteOptionId}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm" style={{ color: "#0F4C3A" }}>{option.content}</span>
                              <span className="text-sm" style={{ color: "#6B7280" }}>
                                {option.count}표{voteTab === "completed" ? ` (${pct}%)` : ""}
                              </span>
                            </div>
                            {voteTab === "completed" && (
                              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#D1FAE5" }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#10B981" }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#6B7280" }}>
                        <Users className="w-3 h-3" /> 총 {total}표
                      </div>
                      <div className="flex gap-2">
                        {voteTab === "ongoing" && (
                          <button
                            disabled={isProcessing}
                            onClick={() => handleEditVoteClick(vote)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                            style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}
                          >
                            수정
                          </button>
                        )}
                        {voteTab === "ongoing" && (
                          <button
                            disabled={isProcessing}
                            onClick={() => handleCloseVote(vote.voteId)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                            style={{ backgroundColor: "#FEF3C6", color: "#B45309" }}
                          >
                            {isProcessing ? "처리중..." : "종료"}
                          </button>
                        )}
                        <button
                          disabled={isProcessing}
                          onClick={() => handleDeleteVoteClick(vote.voteId)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                          style={{ backgroundColor: "#FFC9C9", color: "#E7000B" }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="rounded-2xl p-4" style={{ backgroundColor: "#F1F5F9", border: "1px solid #D1FAE5" }}>
          <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#FE9A00" }}>투표 안내</h4>
          <ul className="space-y-1 text-sm" style={{ color: "#6B7280" }}>
            <li>투표를 수정할 때는 제목, 투표 방식, 마감일을 변경할 수 있습니다.</li>
            <li>옵션은 추가하거나 삭제할 수 있습니다.</li>
            <li>종료된 투표는 수정할 수 없고 삭제만 가능합니다.</li>
          </ul>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin")}>
          <LayoutDashboard className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>대시보드</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/members")}>
          <Users className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>부원</span>
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
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>투표</span>
        </button>
      </nav>

      <AlertDialog open={isDeleteVoteDialogOpen} onOpenChange={setIsDeleteVoteDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[320px] rounded-2xl p-5 border-0" style={{ backgroundColor: "#FFFFFF" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center font-bold" style={{ color: "#0F4C3A" }}>투표 삭제</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm" style={{ color: "#6B7280" }}>
              이 투표를 삭제하시겠습니까? 삭제된 투표는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 mt-4">
            <button onClick={handleConfirmDeleteVote} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}>삭제</button>
            <button onClick={() => setIsDeleteVoteDialogOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#6B7280" }}>취소</button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isEditVoteModalOpen}
        onOpenChange={(open) => {
          setIsEditVoteModalOpen(open);
          if (!open) resetEditVoteState();
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] rounded-2xl p-0 border-0" style={{ backgroundColor: "#FFFFFF" }} hideCloseButton>
          <div className="p-4">
            <div className="flex items-center justify-between mb-5">
              <DialogTitle className="text-lg font-bold" style={{ color: "#0F4C3A" }}>투표 수정</DialogTitle>
              <button onClick={() => { setIsEditVoteModalOpen(false); resetEditVoteState(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" style={{ color: "#6B7280" }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>제목</label>
                <Input value={editVoteTitle} onChange={(e) => setEditVoteTitle(e.target.value)} placeholder="투표 제목을 입력하세요" className="w-full rounded-xl" style={{ backgroundColor: "#F8FFFE", border: "1px solid #D1FAE5" }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>투표 방식</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditVoteIsMultiple(false)} className="flex-1 py-2 rounded-xl text-sm font-medium border" style={{ backgroundColor: !editVoteIsMultiple ? "#D1FAE5" : "#FFFFFF", borderColor: "#D1FAE5", color: "#0F4C3A" }}>단일 선택</button>
                  <button type="button" onClick={() => setEditVoteIsMultiple(true)} className="flex-1 py-2 rounded-xl text-sm font-medium border" style={{ backgroundColor: editVoteIsMultiple ? "#D1FAE5" : "#FFFFFF", borderColor: "#D1FAE5", color: "#0F4C3A" }}>복수 선택</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>새 마감일(선택)</label>
                <div className="flex gap-2">
                  <Input type="date" value={editVoteDeadlineDate} onChange={(e) => setEditVoteDeadlineDate(e.target.value)} className="flex-1 rounded-xl" style={{ backgroundColor: "#F8FFFE", border: "1px solid #D1FAE5" }} />
                  <Input type="time" value={editVoteDeadlineTime} onChange={(e) => setEditVoteDeadlineTime(e.target.value)} className="w-28 rounded-xl" style={{ backgroundColor: "#F8FFFE", border: "1px solid #D1FAE5" }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>옵션 관리</label>
                <div className="space-y-2 mb-3">
                  {editVoteTarget?.options.map((option) => (
                    <div key={option.voteOptionId} className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ backgroundColor: "#F8FFFE", border: "1px solid #D1FAE5", color: "#0F4C3A" }}>
                        {option.content}
                      </div>
                      <button onClick={() => handleDeleteOptionFromVote(option.voteOptionId)} disabled={optionActionKey !== null} className="px-3 py-2 rounded-xl text-xs font-medium disabled:opacity-50" style={{ backgroundColor: "#FFC9C9", color: "#E7000B" }}>
                        {optionActionKey === `delete-${option.voteOptionId}` ? "처리중..." : "삭제"}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input value={newOptionContent} onChange={(e) => setNewOptionContent(e.target.value)} placeholder="새 옵션" className="flex-1 rounded-xl" style={{ backgroundColor: "#F8FFFE", border: "1px solid #D1FAE5" }} />
                  <button onClick={handleAddOptionToVote} disabled={!newOptionContent.trim() || optionActionKey !== null} className="px-3 py-2 rounded-xl text-xs font-medium disabled:opacity-50" style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}>
                    {optionActionKey === `add-${editVoteTarget?.voteId}` ? "추가 중..." : "추가"}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleUpdateVote} disabled={!editVoteTitle.trim() || isUpdatingVote} className="w-full mt-6 py-3 rounded-xl text-base font-medium disabled:opacity-50" style={{ background: "linear-gradient(135deg, #10B981 0%, #0A6647 100%)", color: "#FFFFFF" }}>
              {isUpdatingVote ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin_Vote;
