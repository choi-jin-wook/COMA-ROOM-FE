// ===================================================
// QR 출석 인증 페이지
// - 카메라로 QR 코드를 스캔해 출석 체크
// - html5-qrcode 라이브러리로 카메라 제어
// - POST /api/event/attendances/checks 로 출석 처리
// - 상태 흐름: idle → scanning → verifying → verified / error
// ===================================================

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  User,
  Menu,
  Home,
  CalendarDays,
  Megaphone,
  UserCircle,
  CalendarCheck,
  Vote,
  BookOpen,
  Images,
  Settings,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Camera,
  AlertCircle,
} from "lucide-react";
import ComaLogo from "@/components/ComaLogo";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { AttendanceCamera, type CameraCapabilities, type CameraSettings } from "@/lib/attendance-camera";
import { apiFetch } from "@/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// QR 스캔 진행 상태
// idle: 초기 / scanning: 카메라 활성화 중 / verifying: 서버 인증 중 / verified: 성공 / error: 실패
type ScanState = "idle" | "scanning" | "verifying" | "verified" | "error";

type CameraZoomRange = {
  min: number;
  max: number;
  step: number;
};

const AttendanceVerify = () => {
  const navigate = useNavigate();

  // html5-qrcode 인스턴스 참조 (컴포넌트 언마운트 시 정리용)
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cameraRef = useRef<AttendanceCamera | null>(null);
  const stoppingRef = useRef<Promise<void>>(Promise.resolve());
  const zoomRef = useRef(1);
  const zoomBusyRef = useRef(false);
  const pendingZoomRef = useRef<number | null>(null);

  // 현재 스캔 상태
  const [scanState, setScanState] = useState<ScanState>("idle");
  // 에러 발생 시 사용자에게 보여줄 메시지
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 스캔된 QR 코드 값 (qrCodeId)
  const [scannedSession, setScannedSession] = useState<string | null>(null);
  // 출석 성공 시 완료 모달 표시 여부
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // 카메라 권한 허용 여부 (null: 아직 확인 안 함)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [zoomRange, setZoomRange] = useState<CameraZoomRange | null>(null);
  const [zoom, setZoom] = useState(1);
  const [zoomNotice, setZoomNotice] = useState<string | null>(null);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings | null>(null);

  const refreshCameraSettings = (scanner: Html5Qrcode) => {
    try {
      const settings = scanner.getRunningTrackSettings() as CameraSettings;
      setCameraSettings({ width: settings.width, height: settings.height, zoom: settings.zoom, focusMode: settings.focusMode });
    } catch {
      setCameraSettings(null);
    }
  };

  // 카메라(QR 스캐너) 중지 및 정리
  const stopScanner = async () => {
    const camera = cameraRef.current;
    cameraRef.current = null;
    scannerRef.current = null;
    if (camera) stoppingRef.current = camera.stop();
    setZoomRange(null);
    setZoomNotice(null);
    setCameraSettings(null);
    zoomBusyRef.current = false;
    pendingZoomRef.current = null;
    zoomRef.current = 1;
    setZoom(1);
    await stoppingRef.current;
  };

  const changeZoom = async (value: number) => {
    const scanner = scannerRef.current;
    const camera = cameraRef.current;
    if (!scanner || !camera || !zoomRange) return;

    const nextZoom = Math.min(
      zoomRange.max,
      Math.max(zoomRange.min, value)
    );
    setZoom(nextZoom);
    pendingZoomRef.current = nextZoom;
    if (zoomBusyRef.current) return;

    zoomBusyRef.current = true;
    try {
      while (pendingZoomRef.current !== null) {
        const requestedZoom = pendingZoomRef.current;
        pendingZoomRef.current = null;
        if (Math.abs(requestedZoom - zoomRef.current) < Number.EPSILON) continue;
        await camera.applyZoom(requestedZoom);
        if (scannerRef.current !== scanner) return;
        refreshCameraSettings(scanner);

        // 일부 브라우저는 지원하지 않는 제약도 성공으로 반환하므로 실제 배율 확인
        const appliedZoom = (scanner.getRunningTrackSettings() as CameraSettings).zoom;
        if (typeof appliedZoom !== "number" || !Number.isFinite(appliedZoom) || Math.abs(appliedZoom - zoomRef.current) < Number.EPSILON) {
          setZoomRange(null);
          setZoomNotice("카메라 줌을 사용할 수 없어 현재 배율로 QR 인식을 계속합니다.");
          return;
        }
        zoomRef.current = appliedZoom;
        if (pendingZoomRef.current === null) setZoom(appliedZoom);
      }
    } catch {
      if (scannerRef.current !== scanner) return;
      refreshCameraSettings(scanner);
      setZoomRange(null);
      setZoomNotice("카메라 줌을 사용할 수 없어 현재 배율로 QR 인식을 계속합니다.");
    } finally {
      if (cameraRef.current === camera) {
        zoomBusyRef.current = false;
        pendingZoomRef.current = null;
      }
    }
  };

  // 카메라 시작 및 QR 스캔 활성화
  const startScanner = async () => {
    if (cameraRef.current) return;
    const camera = new AttendanceCamera();
    cameraRef.current = camera;
    setErrorMessage(null);
    setZoomNotice(null);
    setScanState("scanning");

    try {
      const scanner = await camera.start((decodedText) => {
        if (cameraRef.current === camera) void handleScanResult(decodedText);
      }, stoppingRef.current);
      if (!scanner || cameraRef.current !== camera) return;
      scannerRef.current = scanner;
      refreshCameraSettings(scanner);

      try {
        const capabilities = scanner.getRunningTrackCapabilities() as CameraCapabilities;
        const settings = scanner.getRunningTrackSettings() as CameraSettings;
        const supportedZoom = capabilities.zoom;

        if (
          supportedZoom &&
          Number.isFinite(supportedZoom.min) &&
          Number.isFinite(supportedZoom.max) &&
          typeof settings.zoom === "number" &&
          Number.isFinite(settings.zoom) &&
          supportedZoom.max > supportedZoom.min
        ) {
          const step = supportedZoom.step > 0 ? supportedZoom.step : 0.1;
          const initialZoom = Math.min(
            supportedZoom.max,
            Math.max(supportedZoom.min, settings.zoom ?? supportedZoom.min)
          );
          setZoomRange({ ...supportedZoom, step });
          zoomRef.current = initialZoom;
          setZoom(initialZoom);
        } else {
          setZoomRange(null);
          setZoomNotice("이 브라우저 또는 카메라는 줌을 지원하지 않습니다. 기본 배율로 QR을 인식합니다.");
        }
      } catch {
        setZoomRange(null);
        setZoomNotice("이 브라우저 또는 카메라는 줌을 지원하지 않습니다. 기본 배율로 QR을 인식합니다.");
      }

      setCameraPermission(true);
    } catch (err: unknown) {
      if (cameraRef.current !== camera) return;
      await stopScanner();
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("permission") ||
        msg.toLowerCase().includes("notallowed") ||
        msg.toLowerCase().includes("denied")
      ) {
        // 카메라 권한 거부
        setCameraPermission(false);
        setErrorMessage("카메라 권한이 필요합니다. 브라우저 설정에서 카메라를 허용해 주세요.");
      } else if (msg.toLowerCase().includes("https") || msg.toLowerCase().includes("secure")) {
        setErrorMessage("카메라는 HTTPS 환경에서만 사용할 수 있습니다.");
      } else {
        setErrorMessage(`카메라를 시작할 수 없습니다. 다시 시도해 주세요. (${msg})`);
      }
      setScanState("error");
    }
  };

  // QR 코드 인식 후 서버 출석 인증 처리
  // 1. 스캐너 중지
  // 2. POST /api/event/attendances/checks 호출
  // 3. 성공 → verified 상태 + 완료 모달 표시
  // 4. 실패 → 에러 메시지 종류별 분기
  const handleScanResult = async (text: string) => {
    await stopScanner();
    setScanState("verifying");

    const qrCodeId = text.trim();
    if (!qrCodeId) {
      setErrorMessage("QR 코드를 읽을 수 없습니다. 다시 시도해 주세요.");
      setScanState("error");
      return;
    }

    setScannedSession(qrCodeId);

    try {
      await apiFetch("/api/event/attendances/checks", {
        method: "POST",
        body: JSON.stringify({ qrCodeId }),
      });

      setScanState("verified");
      setShowSuccessModal(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("만료") || message.includes("유효")) {
        setErrorMessage("출석 QR 코드가 만료되었습니다. 운영진에게 문의해 주세요.");
      } else if (message.includes("401") || message.includes("Unauthorized")) {
        setErrorMessage("로그인이 필요합니다. 다시 로그인해 주세요.");
      } else if (message.includes("이미") || message.includes("409")) {
        setErrorMessage("이미 출석 처리된 QR 코드입니다.");
      } else {
        setErrorMessage(`출석 인증에 실패했습니다: ${message}`);
      }
      setScanState("error");
    }
  };

  // 페이지 이탈 시 카메라 정리 (모바일 권한 문제로 auto-start 제거: 사용자 제스처 필요)
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // 완료 모달 확인 버튼 - 출석 기록 페이지로 이동
  const handleConfirm = () => {
    setShowSuccessModal(false);
    navigate("/attendance");
  };

  // 에러 발생 후 재시도 버튼
  const handleRetry = () => {
    setErrorMessage(null);
    startScanner();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FFFE" }}>
      <header className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#FFFFFF" }}>
        <button className="flex items-center gap-2" onClick={() => navigate("/main")}>
          <ComaLogo size="sm" />
          <span className="font-bold text-lg" style={{ color: "#0F4C3A" }}>COMA-ROOM</span>
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/notifications")}>
            <Bell className="w-5 h-5" style={{ color: "#6B7280" }} />
          </button>
          <User className="w-5 h-5" style={{ color: "#6B7280" }} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Menu className="w-5 h-5" style={{ color: "#6B7280" }} />
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
      </header>

      <main className="flex-1 px-4 py-4 space-y-5">
        <div className="flex items-center gap-3">
          {/* 뒤로가기 버튼 - 스캐너 정리 후 이전 페이지로 */}
          <button
            onClick={() => {
              stopScanner();
              navigate("/attendance");
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "#F0FDF4" }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: "#10B981" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#10B981" }}>QR 출석 인증</h1>
            {/* 현재 상태에 따라 안내 문구 변경 */}
            <p className="text-sm" style={{ color: "#6B7280" }}>
              {scanState === "scanning" && "QR 코드를 프레임 안에 비춰 주세요."}
              {scanState === "verifying" && "출석을 인증하고 있습니다..."}
              {scanState === "verified" && "출석이 완료되었습니다."}
              {(scanState === "idle" || scanState === "error") && "운영진이 제시한 QR 코드를 스캔해 주세요."}
            </p>
          </div>
        </div>

        {/* 카메라 뷰 영역 */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1FAE5" }}>
          <div className="relative bg-black" style={{ minHeight: 300 }}>
            {/* html5-qrcode가 이 div 안에 카메라 스트림을 렌더링 */}
            <div id="qr-reader" className="w-full" />

            {/* scanning: QR 인식 가이드 프레임 오버레이 */}
            {scanState === "scanning" && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative" style={{ width: 240, height: 240 }}>
                  <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor: "#10B981" }} />
                  <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor: "#10B981" }} />
                  <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: "#10B981" }} />
                  <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: "#10B981" }} />
                  {/* 스캔 중임을 나타내는 수평 라인 애니메이션 */}
                  <div
                    className="absolute left-2 right-2 h-0.5 animate-bounce"
                    style={{ backgroundColor: "#10B981", top: "50%" }}
                  />
                </div>
              </div>
            )}

            {/* verifying: 서버 인증 중 로딩 오버레이 */}
            {scanState === "verifying" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "rgba(15,76,58,0.85)" }}>
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#10B981" }} />
                <p className="text-white font-medium">인증 중...</p>
                {scannedSession && (
                  <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
                    {scannedSession}
                  </span>
                )}
              </div>
            )}

            {/* verified: 출석 완료 오버레이 */}
            {scanState === "verified" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "rgba(16,185,129,0.9)" }}>
                <CheckCircle2 className="w-16 h-16 text-white" />
                <p className="text-white text-lg font-bold">출석 완료!</p>
              </div>
            )}

            {/* idle/error: 카메라 준비 중 상태 */}
            {(scanState === "idle" || scanState === "error") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#0F4C3A", minHeight: 300 }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.2)" }}>
                  <Camera className="w-10 h-10" style={{ color: "#10B981" }} />
                </div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>아래 버튼을 눌러 카메라를 시작하세요</p>
              </div>
            )}
          </div>

          {scanState === "scanning" && (
            <div className="border-t border-[#D1FAE5] px-5 py-3 text-sm text-[#0F4C3A]">
              <div className="flex items-center justify-between">
                <label htmlFor="camera-zoom" className="font-medium">카메라 줌</label>
                <span className="tabular-nums">{zoomRange ? `${zoom.toFixed(1)}×` : "사용 불가"}</span>
              </div>
              <input
                id="camera-zoom"
                type="range"
                min={zoomRange?.min ?? 1}
                max={zoomRange?.max ?? 1}
                step={zoomRange?.step ?? 0.1}
                value={zoom}
                aria-valuetext={`${zoom.toFixed(1)}배`}
                disabled={!zoomRange}
                onChange={(event) => void changeZoom(Number(event.target.value))}
                className="block h-11 w-full cursor-pointer accent-[#10B981] disabled:cursor-not-allowed disabled:opacity-40"
              />
              {zoomRange && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{zoomRange.min.toFixed(1)}×</span>
                  <span>{zoomRange.max.toFixed(1)}×</span>
                </div>
              )}
            </div>
          )}

          {/* 카메라 하단 상태 텍스트 */}
          <div className="px-4 py-3 text-center" style={{ borderTop: "1px solid #D1FAE5" }}>
            {scanState === "scanning" && (
              <p className="text-sm font-medium flex items-center justify-center gap-2" style={{ color: "#10B981" }}>
                <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ backgroundColor: "#10B981" }} />
                스캔 중...
              </p>
            )}
            {scanState === "verifying" && (
              <p className="text-sm font-medium" style={{ color: "#10B981" }}>서버에서 인증 중입니다</p>
            )}
            {scanState === "verified" && (
              <p className="text-sm font-medium" style={{ color: "#10B981" }}>출석 인증 완료</p>
            )}
            {(scanState === "idle" || scanState === "error") && (
              <p className="text-sm" style={{ color: "#6B7280" }}>아래 버튼을 눌러 카메라를 시작하세요</p>
            )}
          </div>
        </div>

        {scanState === "scanning" && zoomNotice && (
          <p role="status" className="rounded-xl bg-[#F0FDF4] p-3 text-sm text-[#0F4C3A]">
            {zoomNotice}
          </p>
        )}

        {scanState === "scanning" && (
          <details className="rounded-xl border border-[#D1FAE5] bg-white p-3 text-sm text-[#0F4C3A]">
            <summary className="cursor-pointer font-medium">카메라 정보</summary>
            <dl className="mt-3 grid grid-cols-2 gap-2" aria-live="polite">
              <dt>실제 해상도</dt>
              <dd>{cameraSettings?.width && cameraSettings?.height
                ? `${cameraSettings.width} × ${cameraSettings.height}` : "확인 불가"}</dd>
              <dt>실제 줌 배율</dt>
              <dd>{typeof cameraSettings?.zoom === "number" && Number.isFinite(cameraSettings.zoom)
                ? `${cameraSettings.zoom.toFixed(1)}배` : "브라우저에서 제공하지 않음"}</dd>
              <dt>초점 모드</dt>
              <dd>{cameraSettings?.focusMode === "continuous" ? "연속 자동 초점"
                : cameraSettings?.focusMode === "single-shot" ? "단일 자동 초점"
                : cameraSettings?.focusMode === "manual" ? "수동 초점"
                : cameraSettings?.focusMode === "none" ? "고정 초점"
                : cameraSettings?.focusMode || "브라우저에서 제공하지 않음"}</dd>
            </dl>
            <p className="mt-3 text-xs text-gray-500">1080p를 우선 요청하며, 실제 해상도는 기기와 브라우저에 따라 달라집니다. 줌 배율만으로 광학 줌 여부를 알 수는 없습니다.</p>
          </details>
        )}

        {/* 에러 메시지 배너 */}
        {errorMessage && (
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: "#FFF1F2", border: "1px solid #FFE4E6" }}>
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#C70036" }} />
            <p className="text-sm" style={{ color: "#C70036" }}>{errorMessage}</p>
          </div>
        )}

        {/* 카메라 권한 거부 시 설정 안내 */}
        {cameraPermission === false && (
          <div className="rounded-xl p-4" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
            <h3 className="font-semibold text-sm mb-2" style={{ color: "#92400E" }}>카메라 권한 설정 방법</h3>
            <ul className="text-sm space-y-1" style={{ color: "#92400E" }}>
              <li>브라우저 주소창 옆의 자물쇠 아이콘을 눌러 주세요.</li>
              <li>카메라 권한을 허용으로 변경해 주세요.</li>
              <li>페이지를 새로고침한 뒤 다시 시도해 주세요.</li>
            </ul>
          </div>
        )}

        {/* idle/error 상태: 카메라 다시 시작 버튼 */}
        {(scanState === "idle" || scanState === "error") && (
          <Button
            onClick={handleRetry}
            className="w-full h-14 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: "#10B981" }}
          >
            <Camera className="w-5 h-5" />
            카메라 다시 시작
          </Button>
        )}

        {/* scanning 상태: 취소 버튼 */}
        {scanState === "scanning" && (
          <Button
            onClick={() => {
              stopScanner();
              setScanState("idle");
            }}
            className="w-full h-12 rounded-xl text-base font-semibold"
            style={{ backgroundColor: "#F0FDF4", color: "#0F4C3A" }}
          >
            취소
          </Button>
        )}

        {/* 이용 안내 */}
        {(scanState === "idle" || scanState === "scanning") && (
          <div className="rounded-xl p-4" style={{ backgroundColor: "#F0FDF4" }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "#0F4C3A" }}>안내사항</h3>
            <ul className="text-sm space-y-2" style={{ color: "#6B7280" }}>
              <li>운영진이 제시한 QR 코드를 카메라에 비춰 주세요.</li>
              <li>QR 코드가 화면 중앙 프레임 안에 들어오도록 맞춰 주세요.</li>
              <li>인식되면 자동으로 출석 인증이 진행됩니다.</li>
              <li>출석이 완료되면 자동으로 XP가 지급됩니다.</li>
            </ul>
          </div>
        )}
      </main>

      {/* 출석 완료 성공 모달 */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="rounded-2xl max-w-sm mx-auto" hideCloseButton>
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold" style={{ color: "#0F4C3A" }}>
              출석 완료
            </DialogTitle>
            <DialogDescription className="text-sm" style={{ color: "#6B7280" }}>
              출석이 정상적으로 처리되었습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            {/* 확인 → 출석 기록 페이지로 이동 */}
            <Button
              onClick={handleConfirm}
              className="w-full h-12 text-base font-semibold text-white rounded-xl"
              style={{ backgroundColor: "#10B981" }}
            >
              출석 기록 보기
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSuccessModal(false)}
              className="w-full h-12 text-base font-semibold rounded-xl"
              style={{ borderColor: "#D1FAE5", color: "#0F4C3A" }}
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 하단 네비게이션 - 이탈 시 스캐너 정리 후 페이지 이동 */}
      <nav className="flex items-center justify-around py-3 border-t sticky bottom-0" style={{ backgroundColor: "#FFFFFF", borderColor: "#D1FAE5" }}>
        <button className="flex flex-col items-center gap-1" onClick={() => { stopScanner(); navigate("/main"); }}>
          <Home className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>홈</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => { stopScanner(); navigate("/schedule"); }}>
          <CalendarDays className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>일정</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => { stopScanner(); navigate("/notice"); }}>
          <Megaphone className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>공지</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => { stopScanner(); navigate("/profile"); }}>
          <UserCircle className="w-5 h-5" style={{ color: "#6B7280" }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>마이</span>
        </button>
      </nav>
    </div>
  );
};

export default AttendanceVerify;
