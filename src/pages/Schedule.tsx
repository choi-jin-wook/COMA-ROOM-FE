import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Bell,
  User,
  Menu,
  Home,
  MessageSquare,
  CalendarCheck,
  Vote,
  BookOpen,
  Images,
  Settings,
  MapPin,
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

interface EventResponse {
  eventId: number;
  title: string;
  eventDate: string;
  rewardXp: number;
  location: string;
  category: string;
  hostname: string;
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  REGULAR_MEETING: { label: "정기모임", color: "bg-[#10B981]" },
  STUDY: { label: "스터디", color: "bg-[#1447E6]" },
  LAB: { label: "Lab", color: "bg-[#8200DB]" },
  EVENT: { label: "행사", color: "bg-[#FE9A00]" },
  STAFF: { label: "운영", color: "bg-[#6B7280]" },
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Schedule = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch<EventResponse[]>(`/api/event/monthly?year=${year}&month=${month + 1}`)
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year, month]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const calendarDays: { day: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }

  const eventDays = new Set(events.map((e) => new Date(e.eventDate).getDate()));

  const selectedDayEvents = events.filter((e) => {
    const d = new Date(e.eventDate);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
  });

  const upcomingEvents = events
    .filter((e) => new Date(e.eventDate) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "오후" : "오전";
    return `${ampm} ${h > 12 ? h - 12 : h || 12}:${m}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FFFE] dark:bg-[#0D1F18]">
      <header className="sticky top-0 z-50 bg-[#10B981] dark:bg-[#1A4A35] px-4 py-3">
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
                className="w-32 bg-white dark:bg-[#152A20] border border-gray-200 dark:border-[#243F32] shadow-lg rounded-lg z-[100]"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
                  onClick={() => navigate("/schedule")}
                >
                  <CalendarCheck className="w-4 h-4 text-[#6B7280] dark:text-[#8BA898]" />
                  <span className="text-[#0F4C3A] dark:text-[#D4EAE3]">일정</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
                  onClick={() => navigate("/vote-list")}
                >
                  <Vote className="w-4 h-4 text-[#6B7280] dark:text-[#8BA898]" />
                  <span className="text-[#0F4C3A] dark:text-[#D4EAE3]">투표</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
                  onClick={() => navigate("/study")}
                >
                  <BookOpen className="w-4 h-4 text-[#6B7280] dark:text-[#8BA898]" />
                  <span className="text-[#0F4C3A] dark:text-[#D4EAE3]">스터디</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
                  onClick={() => navigate("/album")}
                >
                  <Images className="w-4 h-4 text-[#6B7280] dark:text-[#8BA898]" />
                  <span className="text-[#0F4C3A] dark:text-[#D4EAE3]">앨범</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-4 h-4 text-[#6B7280] dark:text-[#8BA898]" />
                  <span className="text-[#0F4C3A] dark:text-[#D4EAE3]">설정</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 pb-24">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-[#0F4C3A] dark:text-[#D4EAE3]" />
          <h1 className="text-xl font-bold text-[#0F4C3A] dark:text-[#D4EAE3]">일정</h1>
        </div>
        <p className="text-[#6B7280] dark:text-[#8BA898] text-sm mb-6">동아리 일정을 한눈에 확인해 보세요.</p>

        <div className="bg-white dark:bg-[#152A20] rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1">
              <ChevronLeft className="w-5 h-5 text-[#6B7280] dark:text-[#8BA898]" />
            </button>
            <span className="font-semibold text-[#0F4C3A] dark:text-[#D4EAE3]">
              {monthNames[month]} {year}
            </span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1">
              <ChevronRight className="w-5 h-5 text-[#6B7280] dark:text-[#8BA898]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-center text-sm text-[#6B7280] dark:text-[#8BA898] py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.isCurrentMonth && setSelectedDay(item.day)}
                className={`relative py-2 text-sm rounded-full transition-colors flex flex-col items-center
                  ${!item.isCurrentMonth ? "text-[#D1D5DB] dark:text-[#3D5248]" : "text-[#0F4C3A] dark:text-[#D4EAE3]"}
                  ${item.isCurrentMonth && item.day === selectedDay ? "bg-[#10B981] dark:bg-[#2A7A54] text-white font-semibold" : "hover:bg-[#D1FAE5] dark:hover:bg-[#1E3A2B]"}
                `}
              >
                {item.day}
                {item.isCurrentMonth && eventDays.has(item.day) && item.day !== selectedDay && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#10B981] dark:bg-[#4DBF91]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#0F4C3A] dark:text-[#D4EAE3]">
              {month + 1}월 {selectedDay}일
            </h2>
            <span className="text-sm text-[#10B981] dark:text-[#4DBF91]">{selectedDayEvents.length}개 일정</span>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-[#152A20] rounded-2xl p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#10B981] dark:text-[#4DBF91]" />
            </div>
          ) : selectedDayEvents.length === 0 ? (
            <div className="bg-white dark:bg-[#152A20] rounded-2xl p-8 flex flex-col items-center justify-center">
              <p className="text-[#6B7280] dark:text-[#8BA898] text-sm">선택한 날짜에는 등록된 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((event) => {
                const cat = CATEGORY_MAP[event.category] ?? { label: event.category, color: "bg-[#6B7280]" };
                return (
                  <div key={event.eventId} className="bg-white dark:bg-[#152A20] rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-[#0F4C3A] dark:text-[#D4EAE3]">{event.title}</span>
                      <span className={`${cat.color} text-white text-xs px-2 py-0.5 rounded-full`}>
                        {cat.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-[#6B7280] dark:text-[#8BA898]">
                      <p className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(event.eventDate)}
                      </p>
                      {event.location && (
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="font-bold text-[#0F4C3A] dark:text-[#D4EAE3] mb-3">다가오는 일정</h2>
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const cat = CATEGORY_MAP[event.category] ?? { label: event.category, color: "bg-[#6B7280]" };
                return (
                  <div
                    key={event.eventId}
                    className="bg-white dark:bg-[#152A20] rounded-2xl p-4 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#0F4C3A] dark:text-[#D4EAE3]">{event.title}</span>
                        <span className={`${cat.color} text-white text-xs px-2 py-0.5 rounded-full`}>
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[#6B7280] dark:text-[#8BA898] text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(event.eventDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(event.eventDate)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#6B7280] dark:text-[#8BA898]" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: "#FFF1F2", border: "1px solid #FFE4E6" }}
          >
            <p className="text-sm" style={{ color: "#C70036" }}>
              일정을 불러오지 못했습니다. {error}
            </p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#152A20] border-t border-[#E5E7EB] dark:border-[#243F32] px-4 py-2">
        <div className="flex items-center justify-around">
          <button onClick={() => navigate("/main")} className="flex flex-col items-center gap-1 py-2 px-4">
            <Home className="w-5 h-5 text-[#6B7280] dark:text-[#8BA898]" />
            <span className="text-xs text-[#6B7280] dark:text-[#8BA898]">홈</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-4">
            <Calendar className="w-5 h-5 text-[#10B981] dark:text-[#4DBF91]" />
            <span className="text-xs text-[#10B981] dark:text-[#4DBF91] font-medium">일정</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 py-2 px-4"
            onClick={() => navigate("/notice")}
          >
            <MessageSquare className="w-5 h-5 text-[#6B7280] dark:text-[#8BA898]" />
            <span className="text-xs text-[#6B7280] dark:text-[#8BA898]">공지</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 py-2 px-4"
            onClick={() => navigate("/profile")}
          >
            <User className="w-5 h-5 text-[#6B7280] dark:text-[#8BA898]" />
            <span className="text-xs text-[#6B7280] dark:text-[#8BA898]">마이</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Schedule;
