import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, Menu, ArrowLeft, Images, Upload, Home, CalendarDays, Megaphone, UserCircle, CalendarCheck, Vote, BookOpen, Settings, Loader2, X } from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { apiFetch } from "@/api/client";
import { uploadAlbumImages } from "@/api/s3";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EventOption {
  eventId: number;
  title: string;
  eventDate: string;
}

interface EventMonthlyResponse {
  eventId: number;
  title: string;
  eventDate: string;
  rewardXp: number;
  location: string;
  category: string;
  hostname: string;
}

const AlbumUpload = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [eventId, setEventId] = useState<number | "">("");
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    apiFetch<EventMonthlyResponse[]>(`/api/event/monthly?year=${year}&month=${month}`)
      .then((data) => setEvents(data.map((e) => ({ eventId: e.eventId, title: e.title, eventDate: e.eventDate }))))
      .catch(() => {});
  }, []);

  // 파일 선택 시 미리보기 URL 생성 (메모리 누수 방지)
  useEffect(() => {
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setSelectedFiles((prev) => {
      const combined = [...prev, ...Array.from(files)];
      return combined.slice(0, 20);
    });
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = "";
  };

  const handleRemoveFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleBackClick = () => {
    if (title || eventId || selectedFiles.length > 0) setShowCancelModal(true);
    else navigate("/album");
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      setUploadMessage("앨범 제목을 입력해 주세요.");
      return;
    }
    if (selectedFiles.length === 0) {
      setUploadMessage("사진을 1장 이상 선택해 주세요.");
      return;
    }
    if (eventId === "") {
      setUploadMessage("관련 행사를 선택해 주세요.");
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const uploaded = await uploadAlbumImages(selectedFiles);
      await apiFetch("/api/event-posts", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          eventId,
          photoUrls: uploaded.map((item) => item.url),
        }),
      });

      setUploadMessage("업로드가 완료되었습니다! 운영진 검토 후 앨범에 추가됩니다.");
      setTitle("");
      setEventId("");
      setSelectedFiles([]);
      setTimeout(() => navigate("/album"), 2500);
    } catch (e: unknown) {
      setUploadMessage(e instanceof Error ? e.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {showCancelModal && <>
        <div className="fixed inset-0 z-[100]" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowCancelModal(false)} />
        <div className="fixed inset-0 z-[101] flex items-center justify-center px-8">
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF" }}>
            <h2 className="text-lg font-bold text-center mb-2" style={{ color: "#0F4C3A" }}>업로드를 취소하시겠습니까?</h2>
            <p className="text-sm text-center mb-6" style={{ color: "#6B7280" }}>작성 중인 내용은 모두 삭제됩니다.</p>
            <div className="space-y-3">
              <button onClick={() => { setShowCancelModal(false); navigate("/album"); }} className="w-full py-3 rounded-xl font-semibold text-sm" style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}>취소하기</button>
              <button onClick={() => setShowCancelModal(false)} className="w-full py-3 rounded-xl font-semibold text-sm" style={{ backgroundColor: "#FFFFFF", color: "#0F4C3A", border: "1px solid #D1FAE5" }}>계속 작성</button>
            </div>
          </div>
        </div>
      </>}

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
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBackClick} className="flex items-center gap-1 text-sm" style={{ color: "#0F4C3A" }}><ArrowLeft className="w-4 h-4" />취소</button>
          <h1 className="font-bold text-lg" style={{ color: "#0F4C3A" }}>사진 올리기</h1>
          <div className="w-12" />
        </div>

        <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ backgroundColor: "#D1FAE5" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.3)" }}><Images className="w-5 h-5" style={{ color: "#10B981" }} /></div>
          <div>
            <h2 className="font-bold text-sm mb-2" style={{ color: "#10B981" }}>사진 업로드 가이드</h2>
            <ul className="text-sm space-y-1" style={{ color: "#0F4C3A" }}>
              <li>행사 사진을 올리면 5 XP를 받을 수 있어요.</li>
              <li>운영진 검토 후 앨범에 추가됩니다.</li>
              <li>최대 20장까지 업로드할 수 있습니다.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>앨범 제목 <span style={{ color: "#EF4444" }}>*</span></label>
            <input type="text" placeholder="예: 2026 신입생 OT" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5", color: "#0F4C3A" }} />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2" style={{ color: "#0F4C3A" }}>관련 행사 <span style={{ color: "#EF4444" }}>*</span></label>
            <select value={eventId} onChange={(e) => setEventId(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5", color: eventId === "" ? "#9CA3AF" : "#0F4C3A" }}>
              <option value="">행사를 선택해 주세요</option>
              {events.map((ev) => <option key={ev.eventId} value={ev.eventId}>{ev.title} ({ev.eventDate?.split("T")[0] ?? ev.eventDate})</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1 text-sm font-medium" style={{ color: "#0F4C3A" }}><Images className="w-4 h-4" />사진 <span style={{ color: "#EF4444" }}>*</span></label>
              {selectedFiles.length > 0 && (
                <span className="text-xs" style={{ color: "#6B7280" }}>{selectedFiles.length}/20장</span>
              )}
            </div>
            <button onClick={handleFileSelect} className="w-full py-6 rounded-xl flex flex-col items-center justify-center gap-2" style={{ backgroundColor: "#FFFFFF", border: "2px dashed #D1FAE5" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#D1FAE5" }}><Upload className="w-5 h-5" style={{ color: "#10B981" }} /></div>
              <span className="font-medium text-sm" style={{ color: "#0F4C3A" }}>{selectedFiles.length > 0 ? "사진 추가하기" : "사진 선택하기"}</span>
              <span className="text-xs" style={{ color: "#6B7280" }}>최대 20장까지 선택 가능</span>
            </button>
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: "#F0FDF4" }}>
                    <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={handleUpload} disabled={uploading} className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-6" style={{ backgroundColor: uploading ? "#6B7280" : "#10B981", color: "#FFFFFF" }}>
          {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />업로드 중...</> : <><Upload className="w-4 h-4" />업로드하기</>}
        </button>

        {uploadMessage && <p className="text-center text-sm mt-3" style={{ color: uploadMessage.includes("완료") ? "#10B981" : "#E7000B" }}>{uploadMessage}</p>}
        {!uploadMessage && <p className="text-center text-xs mt-3" style={{ color: "#6B7280" }}>업로드하면 5 XP를 받을 수 있어요.</p>}
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

export default AlbumUpload;
