// ===================================================
// 관리자 출석 관리 페이지
// - 이벤트 생성 + QR 코드 발급으로 출석 세션 시작
// - 진행 중 세션은 QR 코드를 화면에 표시 (부원이 스캔)
// - 세션 종료 시 완료 기록으로 저장
// - 유형 필터 / 페이지네이션으로 기록 목록 관리
// - 기록 삭제 / 상세보기(출석자 명단) 기능
// - POST /api/admin/event → 이벤트 생성
// - POST /api/admin/event/attendances → QR 코드 발급
// - GET /api/admin/member/manage → 전체/활성 부원 수 조회
// ===================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell, User, Menu, Users, Sparkles, LayoutDashboard,
  ClipboardCheck, Megaphone, ChevronLeft, ChevronRight,
  Play, Clock, QrCode, StopCircle, Trash2, UserPlus, UserMinus,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import ComaLogo from "@/components/ComaLogo";
import { apiFetch } from "@/api/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// 활동 유형 목록 - value: UI 표시값, category: 백엔드 enum 값
const ACTIVITY_TYPES = [
  { value: "정기회의", label: "정기회의", category: "REGULAR_MEETING" },
  { value: "스터디",   label: "스터디",   category: "STUDY" },
  { value: "lab",      label: "Lab",      category: "LAB" },
  { value: "부스",     label: "부스",     category: "EVENT" },
  { value: "기타",     label: "기타",     category: "STAFF" },
] as const;

type ActivityType = typeof ACTIVITY_TYPES[number]["value"];

interface Attendee {
  id: number;
  name: string;
  studentId: string;
  grade: string;
  checkedInAt: string;
}

interface ApiAttendee {
  memberId: number;
  name: string;
  studentId: string;
  major: string | null;
  attendedAt: string;
}

const toAttendees = (items: ApiAttendee[]): Attendee[] => items.map((item) => ({
  id: item.memberId,
  name: item.name,
  studentId: item.studentId,
  grade: item.major ?? "-",
  checkedInAt: item.attendedAt?.replace("T", " ").slice(0, 16) ?? "-",
}));

interface AttendanceRecord {
  id: number;
  title: string;
  activityType: ActivityType;
  date: string;
  time: string;
  attendees: number;
  duration: number;
  status: "completed" | "active";
  attendeeList: Attendee[];
}

type CreateEventResponse = {
  eventId: number;
  title: string;
  eventDate: string;
  rewardXp: number;
  location: string;
  category: string;
  hostname: string;
};

type CreateAttendanceResponse = {
  qrCodeId: string;
};

const Admin_Attendance = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // 현재 출석 기록 목록의 페이지 번호
  const [currentPage, setCurrentPage] = useState(1);
  // 출석 세션 진행 중 여부 (true: QR 코드 표시 상태)
  const [isSessionActive, setIsSessionActive] = useState(false);
  // 발급된 QR 코드 ID (부원이 스캔하는 값)
  const [sessionId, setSessionId] = useState("");
  const [qrCodeId, setQrCodeId] = useState("");
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  // 현재 세션에서 실시간 출석한 인원 수
  const [currentAttendees, setCurrentAttendees] = useState(0);
  // 폼 입력값 - 활동명, 유형, 장소, 날짜
  const [activityName, setActivityName] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("정기회의");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  // 세션 시작 시각 (종료 시 소요 시간 계산용)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  // 완료된 출석 세션 기록 목록 (클라이언트 측 관리)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  // 유형 필터 선택값
  const [filterType, setFilterType] = useState<ActivityType | "all">("all");
  // 삭제 확인 Dialog 상태
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  // 상세보기 Dialog 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [memberIdInput, setMemberIdInput] = useState("");
  const [attendanceAdjusting, setAttendanceAdjusting] = useState(false);
  // API 호출 중 중복 클릭 방지
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 전체/활성 부원 수 (GET /api/admin/member/manage 에서 조회)
  const [totalMember, setTotalMember] = useState<number | null>(null);
  const [activateMember, setActivateMember] = useState<number | null>(null);

  // 마운트 시 부원 수 조회
  useEffect(() => {
    apiFetch<{ totalMember: number; activateMember: number }>("/api/admin/member/manage?page=0")
      .then((data) => {
        setTotalMember(data.totalMember);
        setActivateMember(data.activateMember);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isSessionActive || activeEventId === null) return;
    const refreshAttendance = () => {
      apiFetch<ApiAttendee[]>(`/api/admin/event/${activeEventId}/attendances`)
        .then((items) => setCurrentAttendees(items.length))
        .catch(() => {});
    };
    refreshAttendance();
    const timer = window.setInterval(refreshAttendance, 5000);
    return () => window.clearInterval(timer);
  }, [activeEventId, isSessionActive]);

  // 선택된 필터에 맞는 기록만 필터링
  const filteredRecords =
    filterType === "all"
      ? attendanceRecords
      : attendanceRecords.filter((record) => record.activityType === filterType);

  // 필터링된 기록의 총 페이지 수 (페이지당 3건)
  const totalPages = Math.ceil(filteredRecords.length / 3) || 1;

  // 출석 세션 시작
  // 1. POST /api/admin/event - 이벤트 생성
  // 2. POST /api/admin/event/attendances - QR 코드 발급 (유효시간 10분)
  // 3. 세션 활성화 상태로 전환
  const handleStartSession = async () => {
    if (!activityName.trim()) return;

    try {
      setIsSubmitting(true);

      const category = ACTIVITY_TYPES.find((t) => t.value === activityType)?.category ?? "REGULAR_MEETING";

      const eventRes = await apiFetch<CreateEventResponse>("/api/admin/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activityName.trim(),
          eventDate: `${eventDate}T00:00:00`,
          rewardXp: 3,
          location: location.trim() || "미정",
          eventCategory: category,
        }),
      });

      const createdEventId = eventRes.eventId;

      const attendanceRes = await apiFetch<CreateAttendanceResponse>("/api/admin/event/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: createdEventId,
          expirationTime: 10,
        }),
      });

      const createdQrCodeId = attendanceRes.qrCodeId;

      setSessionId(createdQrCodeId);
      setQrCodeId(createdQrCodeId);
      setActiveEventId(createdEventId);
      setCurrentAttendees(0);
      setSessionStartTime(new Date());
      setIsSessionActive(true);
    } catch (error) {
      console.error("출석 생성 실패:", error);
      alert("출석 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 출석 세션 종료
  // - 소요 시간 계산 후 기록을 attendanceRecords에 추가
  // - 폼 및 세션 상태 초기화
  const handleEndSession = async () => {
    if (sessionStartTime && activityName.trim() && activeEventId !== null) {
      const now = new Date();
      const durationMinutes = Math.round(
        (now.getTime() - sessionStartTime.getTime()) / 60000
      );

      const attendance = await apiFetch<ApiAttendee[]>(`/api/admin/event/${activeEventId}/attendances`).catch(() => [] as ApiAttendee[]);
      const attendeeList = toAttendees(attendance);
      const newRecord: AttendanceRecord = {
        id: activeEventId,
        title: activityName,
        activityType,
        date: eventDate,
        time: sessionStartTime.toTimeString().slice(0, 5),
        attendees: attendeeList.length,
        duration: durationMinutes || 1,
        status: "completed",
        attendeeList,
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);
    }

    setIsSessionActive(false);
    setSessionId("");
    setQrCodeId("");
    setActiveEventId(null);
    setCurrentAttendees(0);
    setActivityName("");
    setActivityType("정기회의");
    setLocation("");
    setEventDate(new Date().toISOString().split("T")[0]);
    setSessionStartTime(null);
  };

  // 삭제 버튼 클릭 - 삭제 대상 ID 저장 후 확인 Dialog 열기
  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteDialogOpen(true);
  };

  // 삭제 확인 - 해당 ID의 기록을 목록에서 제거
  const handleConfirmDelete = async () => {
    if (deleteTargetId !== null) {
      try {
        await apiFetch<void>(`/api/admin/event/${deleteTargetId}`, { method: "DELETE" });
        setAttendanceRecords((prev) => prev.filter((r) => r.id !== deleteTargetId));
      } catch (error) {
        alert(error instanceof Error ? error.message : "출석 기록을 삭제하지 못했습니다.");
        return;
      }
    }
    setIsDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  // 상세보기 버튼 클릭 - 선택된 기록을 저장 후 상세 Dialog 열기
  const handleDetailClick = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setMemberIdInput("");
    setIsDetailModalOpen(true);
  };

  const refreshSelectedAttendance = async (eventId: number) => {
    const items = await apiFetch<ApiAttendee[]>(`/api/admin/event/${eventId}/attendances`);
    const attendeeList = toAttendees(items);
    setSelectedRecord((current) => current?.id === eventId
      ? { ...current, attendees: attendeeList.length, attendeeList }
      : current);
    setAttendanceRecords((records) => records.map((record) => record.id === eventId
      ? { ...record, attendees: attendeeList.length, attendeeList }
      : record));
    if (activeEventId === eventId) setCurrentAttendees(attendeeList.length);
  };

  const handleAddAttendance = async () => {
    if (!selectedRecord) return;
    const memberId = Number(memberIdInput);
    if (!Number.isInteger(memberId) || memberId <= 0) {
      alert("올바른 회원 ID를 입력해 주세요.");
      return;
    }
    setAttendanceAdjusting(true);
    try {
      await apiFetch<void>(`/api/admin/event/${selectedRecord.id}/attendances/${memberId}`, { method: "POST" });
      await refreshSelectedAttendance(selectedRecord.id);
      setMemberIdInput("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "출석자를 추가하지 못했습니다.");
    } finally {
      setAttendanceAdjusting(false);
    }
  };

  const handleRemoveAttendance = async (memberId: number) => {
    if (!selectedRecord || !window.confirm("이 회원의 출석을 삭제하시겠습니까?")) return;
    setAttendanceAdjusting(true);
    try {
      await apiFetch<void>(`/api/admin/event/${selectedRecord.id}/attendances/${memberId}`, { method: "DELETE" });
      await refreshSelectedAttendance(selectedRecord.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "출석자를 삭제하지 못했습니다.");
    } finally {
      setAttendanceAdjusting(false);
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

      <main className="flex-1 px-4 py-6 pb-24">
        <h1 className="text-xl font-bold mb-2" style={{ color: "#0F4C3A" }}>출석 관리</h1>
        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>QR 코드로 출석을 확인하고 관리하세요</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-2xl font-bold" style={{ color: "#10B981" }}>{totalMember ?? "-"}</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>전체 부원</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-2xl font-bold" style={{ color: "#10B981" }}>{activateMember ?? "-"}</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>활성 부원</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-2xl font-bold" style={{ color: "#0F4C3A" }}>{currentAttendees}</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>현재 출석</p>
          </div>
        </div>

        {!isSessionActive ? (
          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "#DCFCE7" }}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#FFFFFF" }}>
                <QrCode className="w-8 h-8" style={{ color: "#10B981" }} />
              </div>
              <h2 className="font-bold text-lg mb-2" style={{ color: "#0F4C3A" }}>출석 세션 시작하기</h2>
              <p className="text-sm mb-4" style={{ color: "#6B7280" }}>활동명을 입력하고 버튼을 클릭하면 QR 코드가 생성됩니다</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>활동 유형</label>
              <Select value={activityType} onValueChange={(value) => setActivityType(value as ActivityType)}>
                <SelectTrigger
                  className="w-full px-4 py-3 h-auto rounded-xl text-sm border-0 focus:ring-2 focus:ring-[#10B981]"
                  style={{ backgroundColor: "#FFFFFF", color: "#0F4C3A" }}
                >
                  <SelectValue placeholder="활동 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>활동명</label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="예: 정기모임 #9, 스터디, 워크샵"
                className="w-full px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                style={{ backgroundColor: "#FFFFFF", color: "#0F4C3A" }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>날짜</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                style={{ backgroundColor: "#FFFFFF", color: "#0F4C3A" }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>장소</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 서울시 강남구 테헤란로 ..."
                className="w-full px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                style={{ backgroundColor: "#FFFFFF", color: "#0F4C3A" }}
              />
            </div>

            <button
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}
              onClick={handleStartSession}
              disabled={!activityName.trim() || isSubmitting}
            >
              <Play className="w-4 h-4" />
              {isSubmitting ? "생성 중..." : "출석 시작하기"}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "#DCFCE7" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "#10B981" }}></div>
                <span className="font-bold" style={{ color: "#0F4C3A" }}>출석 진행 중</span>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}>
                <Clock className="w-3 h-3" />실시간
              </span>
            </div>

            <div className="mb-4 px-4 py-2 rounded-lg text-center" style={{ backgroundColor: "#FFFFFF" }}>
              <span className="text-sm font-medium" style={{ color: "#0F4C3A" }}>{activityName}</span>
            </div>

            <div className="rounded-xl p-6 mb-4 flex flex-col items-center" style={{ backgroundColor: "#FFFFFF" }}>
              <QRCodeSVG value={qrCodeId} size={200} level="H" fgColor="#10B981" bgColor="#FFFFFF" className="mb-4" />
              <p className="text-sm mb-2" style={{ color: "#6B7280" }}>QR 코드를 스캔하여 출석해주세요</p>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs break-all" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>
                {sessionId}
              </span>
            </div>

            <div className="rounded-xl p-4 mb-4 flex items-center justify-between" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: "#6B7280" }} />
                <span className="font-medium" style={{ color: "#0F4C3A" }}>실시간 출석 현황</span>
              </div>
              <span className="text-xl font-bold" style={{ color: "#0F4C3A" }}>{currentAttendees}명</span>
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#FFC9C9", color: "#E7000B" }}
              onClick={handleEndSession}
            >
              <StopCircle className="w-4 h-4" />출석 종료하기
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold" style={{ color: "#0F4C3A" }}>최근 출석 기록</h3>
          <Select value={filterType} onValueChange={(value) => { setFilterType(value as ActivityType | "all"); setCurrentPage(1); }}>
            <SelectTrigger className="w-32 h-9 rounded-lg text-xs border focus:ring-2 focus:ring-[#10B981]" style={{ backgroundColor: "#FFFFFF", color: "#0F4C3A", borderColor: "#D1FAE5" }}>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              {filterType === "all" ? "아직 출석 기록이 없습니다" : "해당 유형의 출석 기록이 없습니다"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.slice((currentPage - 1) * 3, currentPage * 3).map((record) => (
              <div key={record.id} className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#E0E7FF", color: "#4F46E5" }}>
                      {ACTIVITY_TYPES.find((t) => t.value === record.activityType)?.label || record.activityType}
                    </span>
                    <span className="font-bold text-sm" style={{ color: "#0F4C3A" }}>{record.title}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}>완료</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDetailClick(record)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "#FFFFFF", color: "#10B981", border: "1px solid #10B981" }}>
                      상세보기
                    </button>
                    <button onClick={() => handleDeleteClick(record.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FEE2E2" }}>
                      <Trash2 className="w-4 h-4" style={{ color: "#EF4444" }} />
                    </button>
                  </div>
                </div>
                <p className="text-sm mb-2" style={{ color: "#6B7280" }}>{record.date} {record.time}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" style={{ color: "#6B7280" }} />
                    <span className="text-sm" style={{ color: "#6B7280" }}>{record.attendees}명</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" style={{ color: "#6B7280" }} />
                    <span className="text-sm" style={{ color: "#6B7280" }}>{record.duration}분</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredRecords.length > 3 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" style={{ color: "#6B7280" }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: currentPage === page ? "#10B981" : "#FFFFFF", color: currentPage === page ? "#FFFFFF" : "#6B7280", border: currentPage === page ? "none" : "1px solid #D1FAE5" }}
                onClick={() => setCurrentPage(page)}
              >{page}</button>
            ))}
            <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="w-4 h-4" style={{ color: "#6B7280" }} />
            </button>
          </div>
        )}
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
        <button className="flex flex-col items-center gap-1">
          <ClipboardCheck className="w-5 h-5" style={{ color: "#10B981" }} />
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>출석</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/admin/notice")}>
          <Megaphone className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>공지</span>
        </button>
      </nav>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[320px] rounded-2xl p-5 border-0" style={{ backgroundColor: "#FFFFFF" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center font-bold" style={{ color: "#0F4C3A" }}>출석 기록 삭제</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm" style={{ color: "#6B7280" }}>
              이 출석 기록을 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 mt-4">
            <button onClick={handleConfirmDelete} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}>삭제</button>
            <button onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#6B7280" }}>취소</button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] rounded-2xl p-0 border-0 max-h-[80vh] overflow-hidden" style={{ backgroundColor: "#FFFFFF" }} hideCloseButton>
          <DialogHeader className="p-5 pb-3 border-b" style={{ borderColor: "#D1FAE5" }}>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-bold" style={{ color: "#0F4C3A" }}>{selectedRecord?.title}</DialogTitle>
              <button onClick={() => setIsDetailModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <span className="text-xl" style={{ color: "#6B7280" }}>×</span>
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm" style={{ color: "#6B7280" }}>{selectedRecord?.date} {selectedRecord?.time}</span>
              <span className="text-sm" style={{ color: "#6B7280" }}>{selectedRecord?.duration}분</span>
            </div>
          </DialogHeader>

          <div className="p-5 pt-3">
            <div className="rounded-xl p-4 mb-4 flex items-center justify-between" style={{ backgroundColor: "#F0FDF4" }}>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: "#10B981" }} />
                <span className="font-medium" style={{ color: "#0F4C3A" }}>총 출석 인원</span>
              </div>
              <span className="text-xl font-bold" style={{ color: "#10B981" }}>{selectedRecord?.attendeeList.length || 0}명</span>
            </div>

            <div className="mb-4 flex gap-2">
              <input
                type="number"
                min="1"
                value={memberIdInput}
                onChange={(event) => setMemberIdInput(event.target.value)}
                placeholder="회원 ID"
                className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "#D1FAE5" }}
              />
              <button
                onClick={handleAddAttendance}
                disabled={attendanceAdjusting || !memberIdInput}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: "#10B981" }}
              >
                <UserPlus className="h-4 w-4" />추가
              </button>
            </div>

            <h4 className="font-bold text-sm mb-3" style={{ color: "#0F4C3A" }}>출석자 명단</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {selectedRecord?.attendeeList.length === 0 ? (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "#F9FAFB" }}>
                  <p className="text-sm" style={{ color: "#6B7280" }}>출석자가 없습니다</p>
                </div>
              ) : (
                selectedRecord?.attendeeList.map((attendee) => (
                  <div key={attendee.id} className="rounded-xl p-3 flex items-center justify-between" style={{ backgroundColor: "#F9FAFB" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}>
                        {attendee.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#0F4C3A" }}>{attendee.name}</p>
                        <p className="text-xs" style={{ color: "#6B7280" }}>{attendee.studentId} · {attendee.grade}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" style={{ color: "#6B7280" }} />
                      <span className="text-xs" style={{ color: "#6B7280" }}>{attendee.checkedInAt}</span>
                      <button
                        onClick={() => handleRemoveAttendance(attendee.id)}
                        disabled={attendanceAdjusting}
                        className="rounded-md p-1 disabled:opacity-50"
                        aria-label={`${attendee.name} 출석 삭제`}
                        style={{ backgroundColor: "#FEE2E2", color: "#EF4444" }}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin_Attendance;
