import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bell, User, Menu, ArrowLeft, Calendar, Images, ChevronLeft, ChevronRight, Home, CalendarDays, Megaphone, UserCircle, CalendarCheck, Vote, BookOpen, Settings, Loader2, X } from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { apiFetch } from "@/api/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EventPost {
  postId: number;
  title: string;
  authorNickname: string;
  approvalStatus: string;
  photoUrls: string[];
  createdAt: string;
}

const PHOTOS_PER_PAGE = 6;

const AlbumDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<EventPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<EventPost>(`/api/event-posts/${id}`).then(setPost).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const photos = post?.photoUrls ?? [];
  const totalPages = Math.max(1, Math.ceil(photos.length / PHOTOS_PER_PAGE));
  const paginatedPhotos = photos.slice((currentPage - 1) * PHOTOS_PER_PAGE, currentPage * PHOTOS_PER_PAGE);
  const formatDate = (iso: string) => iso?.split("T")[0] ?? iso;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      {lightboxIdx !== null && <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.9)" }} onClick={() => setLightboxIdx(null)}><button className="absolute top-4 right-4 text-white z-10" onClick={() => setLightboxIdx(null)}><X className="w-8 h-8" /></button>{lightboxIdx > 0 && <button className="absolute left-4 text-white z-10" onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}><ChevronLeft className="w-8 h-8" /></button>}<img src={photos[lightboxIdx]} alt={`photo-${lightboxIdx + 1}`} className="max-w-full max-h-full object-contain px-16" onClick={(e) => e.stopPropagation()} />{lightboxIdx < photos.length - 1 && <button className="absolute right-4 text-white z-10" onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}><ChevronRight className="w-8 h-8" /></button>}<div className="absolute bottom-4 text-white text-sm opacity-70">{lightboxIdx + 1} / {photos.length}</div></div>}

      <header className="sticky top-0 z-50 px-4 py-3" style={{ backgroundColor: "#10B981" }}>
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate("/main")}><ComaLogo size="sm" /><span className="text-white font-bold text-lg">COMA-ROOM</span></button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/notifications")}><Bell className="w-5 h-5 text-white" /></button>
            <button onClick={() => navigate("/profile")}><User className="w-5 h-5 text-white" /></button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="focus:outline-none"><Menu className="w-5 h-5 text-white" /></button></DropdownMenuTrigger>
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

      <main className="flex-1 px-4 py-4 pb-24">
        <div className="flex items-center justify-between mb-4"><button onClick={() => navigate("/album")} className="flex items-center gap-1 text-sm" style={{ color: "#0F4C3A" }}><ArrowLeft className="w-4 h-4" />앨범으로</button></div>
        {loading && <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#10B981" }} /></div>}
        {error && <div className="rounded-xl p-4 text-center mb-4" style={{ backgroundColor: "#FFF1F2", border: "1px solid #FFE4E6" }}><p className="text-sm" style={{ color: "#C70036" }}>앨범을 불러오지 못했습니다. {error}</p></div>}
        {!loading && !error && post && <>
          <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
            <h1 className="text-2xl font-bold mb-3" style={{ color: "#0F4C3A" }}>{post.title}</h1>
            <div className="space-y-2"><div className="flex items-center gap-2 text-sm" style={{ color: "#6B7280" }}><Calendar className="w-4 h-4" /><span>{formatDate(post.createdAt)}</span></div><div className="flex items-center gap-2 text-sm" style={{ color: "#6B7280" }}><Images className="w-4 h-4" /><span>사진 {photos.length}장</span></div></div>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: "#D1FAE5" }}><span className="text-sm" style={{ color: "#6B7280" }}>올린 사람: </span><span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "#D1FAE5", color: "#0F4C3A" }}>{post.authorNickname}</span></div>
          </div>
          <h2 className="font-bold mb-3" style={{ color: "#0F4C3A" }}>사진</h2>
          {photos.length === 0 ? <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}><Images className="w-12 h-12 mx-auto mb-2" style={{ color: "#D1FAE5" }} /><p className="text-sm" style={{ color: "#6B7280" }}>등록된 사진이 없습니다.</p></div> : <>
            <div className="grid grid-cols-2 gap-3 mb-4">{paginatedPhotos.map((url, index) => { const globalIdx = (currentPage - 1) * PHOTOS_PER_PAGE + index; return <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer" style={{ backgroundColor: "#F0FDF4" }} onClick={() => setLightboxIdx(globalIdx)}><img src={url} alt={`photo-${globalIdx + 1}`} className="w-full h-full object-cover" /></div>; })}</div>
            {totalPages > 1 && <div className="flex items-center justify-center gap-2 mb-6"><button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E2E2" }} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" style={{ color: "#6B7280" }} /></button>{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => <button key={page} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium" style={{ backgroundColor: currentPage === page ? "#10B981" : "#FFFFFF", color: currentPage === page ? "#FFFFFF" : "#6B7280", border: currentPage === page ? "none" : "1px solid #E2E2E2" }} onClick={() => setCurrentPage(page)}>{page}</button>)}<button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E2E2" }} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" style={{ color: "#6B7280" }} /></button></div>}
          </>}
        </>}
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

export default AlbumDetail;
