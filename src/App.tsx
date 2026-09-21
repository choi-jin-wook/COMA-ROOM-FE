import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScheduleProvider } from "./contexts/ScheduleContext";
import { XPProvider } from "./contexts/XPContext";
import { NoticeProvider } from "./contexts/NoticeContext";
import { LeaderboardProvider } from "./contexts/LeaderboardContext";
import Login from "./pages/Login";
import MainPage_1 from "./pages/MainPage_1";
import Attendance from "./pages/Attendance";
import AttendanceVerify from "./pages/AttendanceVerify";
import Schedule from "./pages/Schedule";
import ScheduleList from "./pages/ScheduleList";
import VoteList from "./pages/VoteList";
import Album from "./pages/Album";
import AlbumDetail from "./pages/AlbumDetail";
import AlbumUpload from "./pages/AlbumUpload";
import Profile from "./pages/Profile";
import XPDetails from "./pages/XPDetails";
import Notice from "./pages/Notice";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Study from "./pages/Study";
import StudyLMS from "./pages/StudyLMS";
import Admin_Study_Create from "./pages/Admin_Study_Create";
import Admin_Event_Attendance from "./pages/Admin_Event_Attendance";
import Leaderboard from "./pages/Leaderboard";
import Admin_MainPage from "./pages/Admin_MainPage";
import Admin_Members from "./pages/Admin_Members";
import Admin_XP from "./pages/Admin_XP";
import Admin_XP_Grant from "./pages/Admin_XP_Grant";
import Admin_Attendance from "./pages/Admin_Attendance";
import Admin_Vote from "./pages/Admin_Vote";
import Admin_Vote_Create from "./pages/Admin_Vote_Create";
import Admin_Notice from "./pages/Admin_Notice";
import Admin_Leaderboard from "./pages/Admin_Leaderboard";
import Admin_Events from "./pages/Admin_Events";
import Admin_Event_Detail from "./pages/Admin_Event_Detail";
import Admin_Event_Form from "./pages/Admin_Event_Form";
import Admin_AlbumApproval from "./pages/Admin_AlbumApproval";
import Admin_AlbumApproval_Detail from "./pages/Admin_AlbumApproval_Detail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <XPProvider>
        <LeaderboardProvider>
          <NoticeProvider>
            <ScheduleProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/main" element={<MainPage_1 />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/verify" element={<AttendanceVerify />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/schedule-list" element={<ScheduleList />} />
              <Route path="/vote-list" element={<VoteList />} />
              <Route path="/album" element={<Album />} />
              <Route path="/album/:id" element={<AlbumDetail />} />
              <Route path="/album/upload" element={<AlbumUpload />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/xp-details" element={<XPDetails />} />
              <Route path="/notice" element={<Notice />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/study" element={<Study />} />
              <Route path="/study/:id/weeks" element={<StudyLMS />} />
              <Route path="/study/:id/weeks/new" element={<StudyLMS view="create" />} />
              <Route path="/study/:id/weeks/:week" element={<StudyLMS view="detail" />} />
              <Route path="/study/:id/weeks/:week/attendance" element={<StudyLMS view="attendance" />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin_MainPage />} />
              <Route path="/admin/members" element={<Admin_Members />} />
              <Route path="/admin/xp" element={<Admin_XP />} />
              <Route path="/admin/xp/grant" element={<Admin_XP_Grant />} />
              <Route path="/admin/attendance" element={<Admin_Attendance />} />
              <Route path="/admin/vote" element={<Admin_Vote />} />
              <Route path="/admin/vote/create" element={<Admin_Vote_Create />} />
              <Route path="/admin/notice" element={<Admin_Notice />} />
              <Route path="/admin/leaderboard" element={<Admin_Leaderboard />} />
              <Route path="/admin/events" element={<Admin_Events />} />
              <Route path="/admin/events/new" element={<Admin_Event_Form />} />
              <Route path="/admin/events/:id" element={<Admin_Event_Detail />} />
              <Route path="/admin/events/:id/edit" element={<Admin_Event_Form />} />
              <Route path="/admin/events/:id/attendance" element={<Admin_Event_Attendance />} />
              <Route path="/admin/studies/new" element={<Admin_Study_Create />} />
              <Route path="/admin/albums" element={<Admin_AlbumApproval />} />
              <Route path="/admin/albums/:id" element={<Admin_AlbumApproval_Detail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ScheduleProvider>
          </NoticeProvider>
        </LeaderboardProvider>
      </XPProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
