import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Menu,
  Home,
  CalendarDays,
  Megaphone,
  UserCircle,
  Star,
  Vote,
  Calendar,
  Images,
  Heart,
  Trophy,
  CheckCircle2,
  Check,
  X,
  Settings,
  CalendarCheck,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationItem {
  id: number;
  type: "xp" | "vote" | "event" | "album" | "manito" | "achievement" | "attendance";
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = activeTab === "all" ? notifications : notifications.filter((n) => !n.isRead);

  const getIconConfig = (type: string) => {
    switch (type) {
      case "xp":
        return { icon: Star, bgColor: "#D1FAE5", iconColor: "#10B981" };
      case "vote":
        return { icon: Vote, bgColor: "#EFF6FF", iconColor: "#2B7FFF" };
      case "event":
        return { icon: Calendar, bgColor: "#F0FDF4", iconColor: "#10B981" };
      case "album":
        return { icon: Images, bgColor: "#EFF6FF", iconColor: "#2B7FFF" };
      case "manito":
        return { icon: Heart, bgColor: "#FFF1F2", iconColor: "#FF2056" };
      case "achievement":
        return { icon: Trophy, bgColor: "#FFFBEB", iconColor: "#FE9A00" };
      case "attendance":
        return { icon: CheckCircle2, bgColor: "#D1FAE5", iconColor: "#10B981" };
      default:
        return { icon: Bell, bgColor: "#D1FAE5", iconColor: "#10B981" };
    }
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
            <Bell className="w-5 h-5 text-white" />
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

      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: "#0F4C3A" }} />
            <h1 className="text-xl font-bold" style={{ color: "#0F4C3A" }}>
              알림
            </h1>
          </div>
          <button className="text-sm font-medium" style={{ color: "#10B981" }} onClick={markAllAsRead}>
            모두 읽음 처리
          </button>
        </div>

        <p className="text-sm" style={{ color: "#6B7280" }}>
          읽지 않은 알림 {unreadCount}개
        </p>

        <div className="flex rounded-full p-1" style={{ backgroundColor: "#D1FAE5" }}>
          <button
            className="flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === "all" ? "#FFFFFF" : "transparent",
              color: activeTab === "all" ? "#0F4C3A" : "#6B7280",
            }}
            onClick={() => setActiveTab("all")}
          >
            전체 ({notifications.length})
          </button>
          <button
            className="flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === "unread" ? "#FFFFFF" : "transparent",
              color: activeTab === "unread" ? "#0F4C3A" : "#6B7280",
            }}
            onClick={() => setActiveTab("unread")}
          >
            읽지 않음 ({unreadCount})
          </button>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 && <p className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">{activeTab === "unread" ? "읽지 않은 알림이 없습니다." : "알림이 없습니다."}</p>}
          {filteredNotifications.map((notification) => {
            const iconConfig = getIconConfig(notification.type);
            const IconComponent = iconConfig.icon;

            return (
              <div
                key={notification.id}
                className="rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-colors"
                style={{
                  backgroundColor: notification.isRead ? "#FFFFFF" : "#FFFBEB",
                  border: `1px solid ${notification.isRead ? "#D1FAE5" : "#FEE685"}`,
                }}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconConfig.bgColor }}>
                  <IconComponent className="w-5 h-5" style={{ color: iconConfig.iconColor }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm" style={{ color: "#0F4C3A" }}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#10B981" }} />}
                  </div>
                  <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
                    {notification.description}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#90A1B9" }}>
                    {notification.time}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.isRead && (
                    <button
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#D1FAE5" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <Check className="w-4 h-4" style={{ color: "#10B981" }} />
                    </button>
                  )}
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#F1F5F9" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    <X className="w-4 h-4" style={{ color: "#6B7280" }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "#D1FAE5" }}>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1" style={{ color: "#10B981" }}>
            <Lightbulb className="w-4 h-4" /> 알림 설정
          </h3>
          <p className="text-sm mb-3" style={{ color: "#0F4C3A" }}>
            설정 페이지에서 받고 싶은 알림을 관리할 수 있어요.
          </p>
          <button className="w-full py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#FFFFFF", color: "#10B981" }}>
            알림 설정으로 이동
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/main")}>
          <Home className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>홈</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/schedule")}>
          <CalendarDays className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>일정</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/notice")}>
          <Megaphone className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>공지</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/profile")}>
          <UserCircle className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>마이</span>
        </button>
      </nav>
    </div>
  );
};

export default Notifications;
