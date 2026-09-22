import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Menu,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  CalendarDays,
  Megaphone,
  UserCircle,
  CalendarCheck,
  Vote,
  BookOpen,
  Images,
  Settings,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { apiFetch } from "@/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventItem {
  eventId: number;
  title: string;
  eventDate: string;
  rewardXp: number;
  location: string;
  category: string;
  hostname: string;
}

const CATEGORY_MAP: Record<string, string> = {
  REGULAR_MEETING: "정기회의",
  STUDY: "스터디",
  LAB: "Lab",
  EVENT: "행사",
  STAFF: "운영진",
};

const ITEMS_PER_PAGE = 5;

const ScheduleList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const now = new Date();
    const fetches = [-1, 0, 1].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return apiFetch<EventItem[]>(`/api/event/monthly?year=${d.getFullYear()}&month=${d.getMonth() + 1}`).catch(
        () => [] as EventItem[],
      );
    });

    Promise.all(fetches)
      .then((results) => {
        const merged = results.flat();
        const seen = new Set<number>();
        const unique = merged.filter((e) => {
          if (seen.has(e.eventId)) return false;
          seen.add(e.eventId);
          return true;
        });
        setEvents(unique.sort((a, b) => a.eventDate.localeCompare(b.eventDate)));
      })
      .finally(() => setLoading(false));
  }, []);

  const nowStr = new Date().toISOString().split("T")[0];
  const upcomingEvents = events.filter((e) => e.eventDate >= nowStr);
  const pastEvents = events.filter((e) => e.eventDate < nowStr).reverse();

  const currentEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;
  const totalPages = Math.max(1, Math.ceil(currentEvents.length / ITEMS_PER_PAGE));
  const paginated = currentEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
              <DropdownMenuContent
                align="end"
                className="w-32 bg-white dark:bg-[#152A20] border border-gray-200 dark:border-[#243F32] shadow-lg rounded-lg z-[100]"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
                  onClick={() => navigate("/schedule")}
                >
                  <CalendarCheck className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>일정</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
                  onClick={() => navigate("/vote-list")}
                >
                  <Vote className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>투표</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
                  onClick={() => navigate("/study")}
                >
                  <BookOpen className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>스터디</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
                  onClick={() => navigate("/album")}
                >
                  <Images className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ color: "#0F4C3A" }}>앨범</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E3A2B]"
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
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5" style={{ color: "#0F4C3A" }} />
          <h1 className="text-xl font-bold" style={{ color: "#0F4C3A" }}>
            일정
          </h1>
        </div>
        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
          다양한 활동에 참여하고 XP를 획득해 보세요.
        </p>

        <div className="flex rounded-full p-1 mb-6" style={{ backgroundColor: "#D1FAE5" }}>
          <button
            className="flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === "upcoming" ? "#10B981" : "transparent",
              color: activeTab === "upcoming" ? "#FFFFFF" : "#6B7280",
            }}
            onClick={() => {
              setActiveTab("upcoming");
              setCurrentPage(1);
            }}
          >
            예정된 일정
          </button>
          <button
            className="flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === "past" ? "#10B981" : "transparent",
              color: activeTab === "past" ? "#FFFFFF" : "#6B7280",
            }}
            onClick={() => {
              setActiveTab("past");
              setCurrentPage(1);
            }}
          >
            지난 일정
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#10B981" }} />
          </div>
        ) : (
          <>
            {paginated.length === 0 ? (
              <div
                className="rounded-xl p-8 text-center"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
              >
                <Calendar className="w-10 h-10 mx-auto mb-2" style={{ color: "#D1FAE5" }} />
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  {activeTab === "upcoming" ? "예정된 일정이 없습니다" : "지난 일정이 없습니다"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {paginated.map((event) => (
                  <div
                    key={event.eventId}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}
                          >
                            {CATEGORY_MAP[event.category] ?? event.category}
                          </span>
                          <h3 className="font-semibold" style={{ color: "#0F4C3A" }}>
                            {event.title}
                          </h3>
                        </div>
                        <p className="text-sm" style={{ color: "#6B7280" }}>
                          {formatDate(event.eventDate)}
                        </p>
                        {event.location && (
                          <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "#6B7280" }}>
                            <MapPin className="w-3 h-3" /> {event.location}
                          </p>
                        )}
                      </div>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ml-2"
                        style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}
                      >
                        <Sparkles className="w-3 h-3" /> +{event.rewardXp}XP
                      </span>
                    </div>
                    {event.hostname && (
                      <p className="text-xs" style={{ color: "#90A1B9" }}>
                        주최: {event.hostname}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E2E2" }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: "#6B7280" }} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
                    style={{
                      backgroundColor: currentPage === page ? "#10B981" : "#FFFFFF",
                      color: currentPage === page ? "#FFFFFF" : "#6B7280",
                      border: currentPage === page ? "none" : "1px solid #E2E2E2",
                    }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E2E2" }}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" style={{ color: "#6B7280" }} />
                </button>
              </div>
            )}
          </>
        )}

        <div className="rounded-xl p-4" style={{ backgroundColor: "#D1FAE5" }}>
          <h3 className="font-semibold text-sm mb-2" style={{ color: "#10B981" }}>
            참여 안내
          </h3>
          <ul className="text-sm space-y-1" style={{ color: "#0F4C3A" }}>
            <li>각 행사에 참여하면 자동으로 XP가 적립됩니다.</li>
            <li>XP를 모아 1등을 겨뤄보세요.</li>
          </ul>
        </div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}
      >
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/main")}>
          <Home className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>
            홈
          </span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/schedule")}>
          <CalendarDays className="w-5 h-5" style={{ color: "#10B981" }} />
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>
            일정
          </span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/notice")}>
          <Megaphone className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>
            공지
          </span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/profile")}>
          <UserCircle className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>
            마이
          </span>
        </button>
      </nav>
    </div>
  );
};

export default ScheduleList;
