import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell, User, Menu, Users, Sparkles, ClipboardCheck,
  Megaphone, LayoutDashboard, CheckSquare, ArrowLeft,
  Plus, Calendar, Trash2,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createVote } from "@/api/votes";

const Admin_Vote_Create = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [title, setTitle] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [isMultiple, setIsMultiple] = useState(false);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddOption = () => {
    if (submitting) return;
    if (options.length < 10) setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (submitting) return;
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    if (submitting) return;
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // "2026-03-31T23:59:59" 형식
  const toServerDeadline = (dateStr: string, timeStr: string) => {
    return `${dateStr}T${timeStr}:59`;
  };

  const validationError = useMemo(() => {
    if (!title.trim()) return "투표 제목을 입력해주세요.";
    if (!deadlineDate) return "마감일을 선택해주세요.";

    const trimmed = options.map((o) => o.trim());
    if (trimmed.length < 2) return "선택지는 최소 2개가 필요해요.";
    if (trimmed.some((o) => !o)) return "선택지에 빈 값이 있어요.";

    const set = new Set(trimmed.map((t) => t.toLowerCase()));
    if (set.size !== trimmed.length) return "선택지가 중복되면 안 돼요.";

    return null;
  }, [title, deadlineDate, options]);

  const handleSubmit = async () => {
    if (submitting) return;

    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setSubmitting(true);

      await createVote({
        title: title.trim(),
        isMultiple,
        deadline: toServerDeadline(deadlineDate, deadlineTime),
        options: options.map((o) => ({ content: o.trim() })),
      });

      navigate("/admin/vote");
    } catch (e) {
      alert(e instanceof Error ? e.message : "투표 생성 실패");
    } finally {
      setSubmitting(false);
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
              <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-[100]">
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
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            관리자 모드
          </span>
        </div>
      </header>

      <div
        className="px-4 py-3 flex items-center"
        style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #D1FAE5" }}
      >
        <button
          onClick={() => navigate("/admin/vote")}
          className="flex items-center gap-1 text-sm"
          style={{ color: "#6B7280" }}
          disabled={submitting}
        >
          <ArrowLeft className="w-4 h-4" />
          취소
        </button>
        <h1 className="flex-1 text-center font-bold" style={{ color: "#0F4C3A" }}>
          투표 만들기
        </h1>
        <div className="w-12"></div>
      </div>

      <main className="flex-1 px-4 py-6 pb-24">
        {/* 안내 배너 */}
        <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: "#D1FAE5" }}>
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#10B981" }}
            >
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold mb-2" style={{ color: "#0F4C3A" }}>투표 생성 안내</h3>
              <ul className="space-y-1 text-sm" style={{ color: "#0F4C3A" }}>
                <li>• 운영진만 투표를 생성할 수 있어요</li>
                <li>• 투표 참여 시 회원은 2 XP를 받아요</li>
                <li>• 최대 10개의 선택지 추가 가능</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>

          {/* 투표 제목 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>
              투표 제목 <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <Input
              placeholder="예: 2025 운영 방향 투표"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border-gray-200"
              style={{ backgroundColor: "#F8FFFE" }}
              disabled={submitting}
            />
          </div>

          {/* 투표 방식 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>
              투표 방식 <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setIsMultiple(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium border"
                style={{
                  backgroundColor: !isMultiple ? "#D1FAE5" : "#FFFFFF",
                  borderColor: "#D1FAE5",
                  color: "#0F4C3A",
                }}
              >
                단일 선택
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setIsMultiple(true)}
                className="flex-1 py-3 rounded-xl text-sm font-medium border"
                style={{
                  backgroundColor: isMultiple ? "#D1FAE5" : "#FFFFFF",
                  borderColor: "#D1FAE5",
                  color: "#0F4C3A",
                }}
              >
                다중 선택
              </button>
            </div>
          </div>

          {/* 마감일 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 flex items-center gap-1" style={{ color: "#0F4C3A" }}>
              <Calendar className="w-4 h-4" />
              마감일 <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="flex-1 rounded-xl border-gray-200"
                style={{ backgroundColor: "#F8FFFE" }}
                disabled={submitting}
              />
              <Input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-28 rounded-xl border-gray-200"
                style={{ backgroundColor: "#F8FFFE" }}
                disabled={submitting}
              />
            </div>
          </div>

          {/* 선택지 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: "#0F4C3A" }}>
                선택지 <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <span className="text-xs" style={{ color: "#6B7280" }}>최소 2개 / 최대 10개</span>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`선택지 ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 rounded-xl border-gray-200"
                    style={{ backgroundColor: "#F8FFFE" }}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    disabled={submitting || options.length <= 2}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{
                      borderColor: "#D1FAE5",
                      backgroundColor: "#FFFFFF",
                      color: options.length <= 2 ? "#9CA3AF" : "#EF4444",
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                disabled={submitting}
                className="w-full mt-2 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                style={{ backgroundColor: "#F8FFFE", color: "#10B981", border: "1px dashed #D1FAE5" }}
              >
                <Plus className="w-4 h-4" />
                선택지 추가
              </button>
            )}
          </div>

          {/* 보상 안내 */}
          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: "#F8FFFE", border: "1px solid #D1FAE5" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: "#10B981" }} />
              <span className="text-sm font-medium" style={{ color: "#0F4C3A" }}>투표 참여 보상</span>
            </div>
            <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}>
              +2 XP
            </span>
          </div>

          {validationError && (
            <p className="mt-3 text-sm" style={{ color: "#EF4444" }}>{validationError}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-6 py-4 rounded-xl text-base font-medium flex items-center justify-center gap-2"
          style={{ backgroundColor: submitting ? "#9CA3AF" : "#10B981", color: "#FFFFFF" }}
        >
          <CheckSquare className="w-5 h-5" />
          {submitting ? "생성 중..." : "투표 생성하기"}
        </button>
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
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/vote")}>
          <Megaphone className="w-5 h-5" style={{ color: "#10B981" }} />
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>공지</span>
        </button>
      </nav>
    </div>
  );
};

export default Admin_Vote_Create;
