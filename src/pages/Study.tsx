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
  BookOpen,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  Lightbulb,
  CalendarCheck,
  Vote,
  Images,
  Settings,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudyItem {
  id: number;
  title: string;
  description: string;
  role: "멤버" | "리더";
  progress: number;
  currentMembers: number;
  maxMembers: number;
  nextSession: string;
  schedule: string;
  status: "active" | "completed";
}

interface JoinableStudyItem {
  id: number;
  title: string;
  description: string;
  level: "초급" | "중급" | "고급";
  tags: string[];
  currentMembers: number;
  maxMembers: number;
  leader: string;
  leaderInitial: string;
  schedule: string;
}

interface CompletedStudyItem {
  id: number;
  title: string;
  completedDate: string;
  totalSessions: number;
  attendance: number;
  xp: number;
}

const Study = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my" | "join" | "completed">("my");

  const stats = { participating: 2, totalXP: 35, completed: 2 };

  const myStudies: StudyItem[] = [
    {
      id: 1,
      title: "AI/ML 심화 스터디",
      description: "딥러닝과 머신러닝 알고리즘 학습",
      role: "멤버",
      progress: 65,
      currentMembers: 6,
      maxMembers: 8,
      nextSession: "1월 24일(수)",
      schedule: "매주 수요일 오후 6시",
      status: "active",
    },
    {
      id: 2,
      title: "웹 개발 프로젝트",
      description: "React와 Node.js로 풀스택 프로젝트 진행",
      role: "리더",
      progress: 40,
      currentMembers: 4,
      maxMembers: 5,
      nextSession: "1월 26일(금)",
      schedule: "매주 금요일 오후 7시",
      status: "active",
    },
  ];

  const joinableStudies: JoinableStudyItem[] = [
    {
      id: 3,
      title: "알고리즘 코딩테스트",
      description: "코딩테스트 대비 알고리즘 문제 풀이",
      level: "중급",
      tags: ["알고리즘", "코테"],
      currentMembers: 3,
      maxMembers: 6,
      leader: "김철수",
      leaderInitial: "김",
      schedule: "매주 화요일 오후 8시",
    },
    {
      id: 4,
      title: "모바일 앱 개발",
      description: "Flutter로 크로스플랫폼 앱 개발",
      level: "초급",
      tags: ["Flutter", "모바일"],
      currentMembers: 2,
      maxMembers: 4,
      leader: "이영희",
      leaderInitial: "이",
      schedule: "매주 목요일 오후 6시",
    },
    {
      id: 5,
      title: "데이터 사이언스",
      description: "Python으로 데이터 분석 및 시각화",
      level: "중급",
      tags: ["Python", "데이터"],
      currentMembers: 5,
      maxMembers: 6,
      leader: "박민수",
      leaderInitial: "박",
      schedule: "매주 토요일 오후 7시",
    },
  ];

  const completedStudies: CompletedStudyItem[] = [
    {
      id: 6,
      title: "Spring Boot 입문",
      completedDate: "2024-12-20 완료",
      totalSessions: 8,
      attendance: 7,
      xp: 20,
    },
    {
      id: 7,
      title: "클린 코드 읽기 모임",
      completedDate: "2024-11-30 완료",
      totalSessions: 6,
      attendance: 6,
      xp: 15,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      <header className="sticky top-0 z-50 px-4 py-3" style={{ backgroundColor: "#10B981" }}>
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate("/main")}>
            <ComaLogo size="sm" />
            <span className="text-white font-bold text-lg">COMA-ROOM</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/notifications")}><Bell className="w-5 h-5 text-white" /></button>
            <button onClick={() => navigate("/profile")}><User className="w-5 h-5 text-white" /></button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none"><Menu className="w-5 h-5 text-white" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 shadow-lg rounded-lg z-[100]">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/schedule")}><CalendarCheck className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>일정</span></DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/vote-list")}><Vote className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>투표</span></DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/study")}><BookOpen className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>스터디</span></DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/album")}><Images className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>앨범</span></DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50" onClick={() => navigate("/settings")}><Settings className="w-4 h-4" style={{ color: "#6B7280" }} /><span style={{ color: "#0F4C3A" }}>설정</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5" style={{ color: "#0F4C3A" }} />
              <h1 className="text-xl font-bold" style={{ color: "#0F4C3A" }}>스터디</h1>
            </div>
            <p className="text-sm" style={{ color: "#6B7280" }}>함께 공부하고 성장해 보세요.</p>
          </div>
          <button onClick={() => navigate("/admin/studies/new")} className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-white" style={{ backgroundColor: "#10B981" }}>
            <span className="text-lg">+</span>
            <span>스터디 만들기</span>
          </button>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #10B981 0%, #0A6647 100%)" }}>
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            <div><p className="text-3xl font-bold">{stats.participating}</p><p className="text-sm opacity-80">참여 중</p></div>
            <div><p className="text-3xl font-bold">{stats.totalXP}</p><p className="text-sm opacity-80">총 획득 XP</p></div>
            <div><p className="text-3xl font-bold">{stats.completed}</p><p className="text-sm opacity-80">완료한 스터디</p></div>
          </div>
        </div>

        <div className="flex rounded-full p-1" style={{ backgroundColor: "#D1FAE5" }}>
          <button className="flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors" style={{ backgroundColor: activeTab === "my" ? "#FFFFFF" : "transparent", color: activeTab === "my" ? "#0F4C3A" : "#6B7280" }} onClick={() => setActiveTab("my")}>내 스터디</button>
          <button className="flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors" style={{ backgroundColor: activeTab === "join" ? "#FFFFFF" : "transparent", color: activeTab === "join" ? "#0F4C3A" : "#6B7280" }} onClick={() => setActiveTab("join")}>참여하기</button>
          <button className="flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors" style={{ backgroundColor: activeTab === "completed" ? "#FFFFFF" : "transparent", color: activeTab === "completed" ? "#0F4C3A" : "#6B7280" }} onClick={() => setActiveTab("completed")}>완료</button>
        </div>

        <div className="space-y-3">
          {activeTab === "join"
            ? joinableStudies.map((study) => (
                <div key={study.id} onClick={() => navigate("/study/" + study.id + "/weeks?role=member")} className="cursor-pointer rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-lg" style={{ color: "#0F4C3A" }}>{study.title}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: study.level === "초급" ? "#D1FAE5" : "#FEF3C6", color: study.level === "초급" ? "#007A55" : "#BB4D00" }}>{study.level}</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: "#6B7280" }}>{study.description}</p>
                  <div className="flex gap-2 mb-3">{study.tags.map((tag, index) => <span key={index} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "#F1F5F9", color: "#0F4C3A" }}>{tag}</span>)}</div>
                  <div className="flex items-center justify-between mb-3 text-sm" style={{ color: "#6B7280" }}>
                    <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{study.currentMembers}/{study.maxMembers}명</span></div>
                    <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: "#10B981" }}>{study.leaderInitial}</span><span style={{ color: "#0F4C3A" }}>{study.leader}</span></div>
                  </div>
                  <div className="flex items-center gap-1 text-sm mb-4" style={{ color: "#6B7280" }}><Clock className="w-4 h-4" /><span>{study.schedule}</span></div>
                  <button className="w-full py-3 rounded-xl text-white font-medium" style={{ backgroundColor: "#0F4C3A" }}>참여 요청</button>
                </div>
              ))
            : activeTab === "completed"
              ? completedStudies.map((study) => (
                  <div key={study.id} onClick={() => navigate("/study/" + study.id + "/weeks?role=member")} className="cursor-pointer rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                    <div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-lg" style={{ color: "#0F4C3A" }}>{study.title}</h3><CheckCircle2 className="w-5 h-5" style={{ color: "#10B981" }} /></div>
                    <p className="text-sm mb-4" style={{ color: "#6B7280" }}>{study.completedDate}</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div><p className="text-xl font-bold" style={{ color: "#0F4C3A" }}>{study.totalSessions}</p><p className="text-xs" style={{ color: "#6B7280" }}>총 세션</p></div>
                      <div><p className="text-xl font-bold" style={{ color: "#10B981" }}>{study.attendance}</p><p className="text-xs" style={{ color: "#6B7280" }}>참석</p></div>
                      <div><div className="flex items-center justify-center gap-1"><Sparkles className="w-4 h-4" style={{ color: "#E17100" }} /><p className="text-xl font-bold" style={{ color: "#10B981" }}>{study.xp}</p></div><p className="text-xs" style={{ color: "#6B7280" }}>XP</p></div>
                    </div>
                  </div>
                ))
              : myStudies.map((study) => (
                  <div key={study.id} onClick={() => navigate("/study/" + study.id + "/weeks?role=" + (study.role === "리더" ? "leader" : "member"))} className="cursor-pointer rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold" style={{ color: "#0F4C3A" }}>{study.title}</h3>
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: study.role === "리더" ? "#CAD5E2" : "#D1FAE5", color: study.role === "리더" ? "#314158" : "#10B981" }}>{study.role}</span>
                      </div>
                      <ChevronRight className="w-5 h-5" style={{ color: "#6B7280" }} />
                    </div>
                    <p className="text-sm mb-3" style={{ color: "#6B7280" }}>{study.description}</p>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1"><span className="text-sm" style={{ color: "#6B7280" }}>진행률</span><span className="text-sm font-medium" style={{ color: "#10B981" }}>{study.progress}%</span></div>
                      <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#E2E8F0" }}><div className="h-full rounded-full transition-all" style={{ width: `${study.progress}%`, backgroundColor: "#10B981" }} /></div>
                    </div>
                    <div className="flex items-center gap-4 mb-2 text-sm" style={{ color: "#6B7280" }}>
                      <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{study.currentMembers}/{study.maxMembers}명</span></div>
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{study.nextSession}</span></div>
                    </div>
                    <div className="flex items-center gap-1 text-sm" style={{ color: "#6B7280" }}><Clock className="w-4 h-4" /><span>{study.schedule}</span></div>
                  </div>
                ))}
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "#D1FAE5" }}>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1" style={{ color: "#10B981" }}><Lightbulb className="w-4 h-4" /> 스터디 안내</h3>
          <ul className="text-sm space-y-1" style={{ color: "#0F4C3A" }}>
            <li>스터디에 참여하면 세션마다 2 XP를 받을 수 있어요.</li>
            <li>스터디를 완료하면 보너스 XP를 받을 수 있어요.</li>
            <li>리더 역할을 맡으면 운영 경험도 쌓을 수 있어요.</li>
          </ul>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/main")}><Home className="w-5 h-5" style={{ color: "#6B7280" }} /><span className="text-xs" style={{ color: "#6B7280" }}>홈</span></button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/schedule")}><CalendarDays className="w-5 h-5" style={{ color: "#6B7280" }} /><span className="text-xs" style={{ color: "#6B7280" }}>일정</span></button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/notice")}><Megaphone className="w-5 h-5" style={{ color: "#6B7280" }} /><span className="text-xs" style={{ color: "#6B7280" }}>공지</span></button>
        <button className="flex flex-col items-center gap-1" onClick={() => navigate("/profile")}><UserCircle className="w-5 h-5" style={{ color: "#6B7280" }} /><span className="text-xs" style={{ color: "#6B7280" }}>마이</span></button>
      </nav>
    </div>
  );
};

export default Study;

