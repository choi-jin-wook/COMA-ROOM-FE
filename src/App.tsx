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
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

import { AdminAlbumApprovalDetail, AdminAlbumApprovalList } from "./pages/Admin_AlbumApproval";
import {
  AdminStudyCreate,
  StudyAttendanceCreate,
  StudyWeekDetail,
  StudyWeekPlanCreate,
  StudyWeeks,
} from "./pages/StudyLms";

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
              <Route path="/main" element={<ProtectedRoute><MainPage_1 /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route path="/attendance/verify" element={<ProtectedRoute><AttendanceVerify /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
              <Route path="/schedule-list" element={<ProtectedRoute><ScheduleList /></ProtectedRoute>} />
              <Route path="/vote-list" element={<ProtectedRoute><VoteList /></ProtectedRoute>} />
              <Route path="/album" element={<ProtectedRoute><Album /></ProtectedRoute>} />
              <Route path="/album/:id" element={<ProtectedRoute><AlbumDetail /></ProtectedRoute>} />
              <Route path="/album/upload" element={<ProtectedRoute><AlbumUpload /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/xp-details" element={<ProtectedRoute><XPDetails /></ProtectedRoute>} />
              <Route path="/notice" element={<ProtectedRoute><Notice /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
              <Route path="/study/:studyId/weeks" element={<ProtectedRoute><StudyWeeks /></ProtectedRoute>} />
              <Route path="/study/:studyId/weeks/new" element={<ProtectedRoute><StudyWeekPlanCreate /></ProtectedRoute>} />
              <Route path="/study/:studyId/weeks/:week" element={<ProtectedRoute><StudyWeekDetail /></ProtectedRoute>} />
              <Route path="/study/:studyId/weeks/:week/attendance/new" element={<ProtectedRoute><StudyAttendanceCreate /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin_MainPage /></ProtectedRoute>} />
              <Route path="/admin/members" element={<ProtectedRoute requireAdmin><Admin_Members /></ProtectedRoute>} />
              <Route path="/admin/xp" element={<ProtectedRoute requireAdmin><Admin_XP /></ProtectedRoute>} />
              <Route path="/admin/xp/grant" element={<ProtectedRoute requireAdmin><Admin_XP_Grant /></ProtectedRoute>} />
              <Route path="/admin/attendance" element={<ProtectedRoute requireAdmin><Admin_Attendance /></ProtectedRoute>} />
              <Route path="/admin/vote" element={<ProtectedRoute requireAdmin><Admin_Vote /></ProtectedRoute>} />
              <Route path="/admin/vote/create" element={<ProtectedRoute requireAdmin><Admin_Vote_Create /></ProtectedRoute>} />
              <Route path="/admin/notice" element={<ProtectedRoute requireAdmin><Admin_Notice /></ProtectedRoute>} />
              <Route path="/admin/leaderboard" element={<ProtectedRoute requireAdmin><Admin_Leaderboard /></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute requireAdmin><Admin_Events /></ProtectedRoute>} />
              <Route path="/admin/events/new" element={<ProtectedRoute requireAdmin><Admin_Event_Form /></ProtectedRoute>} />
              <Route path="/admin/events/:id" element={<ProtectedRoute requireAdmin><Admin_Event_Detail /></ProtectedRoute>} />
              <Route path="/admin/events/:id/edit" element={<ProtectedRoute requireAdmin><Admin_Event_Form /></ProtectedRoute>} />
              <Route path="/admin/events/:id/attendance" element={<ProtectedRoute requireAdmin><Admin_Event_Attendance /></ProtectedRoute>} />
              <Route path="/admin/albums" element={<ProtectedRoute requireAdmin><AdminAlbumApprovalList /></ProtectedRoute>} />
              <Route path="/admin/albums/:postId" element={<ProtectedRoute requireAdmin><AdminAlbumApprovalDetail /></ProtectedRoute>} />
              <Route path="/admin/studies/new" element={<ProtectedRoute requireAdmin><AdminStudyCreate /></ProtectedRoute>} />
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
