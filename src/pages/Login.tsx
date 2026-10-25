// ===================================================
// 로그인 페이지
// - 학번 + 비밀번호로 로그인
// - 로그인 성공 시 JWT 토큰을 localStorage에 저장
// - 역할(ADMIN/USER)에 따라 관리자 또는 일반 메인으로 이동
// ===================================================

import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/LoginForm";
import { toast } from "sonner";
import comaLogo from "@/assets/coma-logo.png";
import { useAuth, type User } from "@/contexts/AuthContext";
import { apiFetch } from "@/api/client";

// JWT 페이로드 파싱 (Base64 디코딩)
// accessToken에서 role, id 등을 꺼낼 때 사용
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

type LoginData = {
  message: string;
  accessToken: string;
  refreshToken: string;
  role: string;
};

type ProfileData = {
  name: string;
  studentId: string;
};

// API 응답의 role 문자열을 앱 내부 타입(admin | user)으로 정규화
function normalizeRole(role: unknown): User["role"] {
  return typeof role === "string" && role.toUpperCase() === "ADMIN" ? "admin" : "user";
}

const Index = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 로그인 처리 핸들러
  // 1. POST /api/auth/login 으로 토큰 발급
  // 2. JWT 페이로드에서 role 추출
  // 3. GET /api/member/profile 로 이름/학번 보완
  // 4. AuthContext에 유저 정보 저장 + localStorage 기록
  // 5. ADMIN → /admin, USER → /main 으로 이동
  const handleLogin = async (studentId: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const data = await apiFetch<LoginData>("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ studentId, password }).toString(),
      });

      const payload = decodeJwtPayload(data.accessToken);
      const role = normalizeRole(data.role ?? payload?.role);

      // 토큰을 localStorage에 저장해 이후 API 요청에 사용
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // 프로필 조회 실패 시에도 로그인은 계속 진행
      let profile: ProfileData | null = null;
      try {
        profile = await apiFetch<ProfileData>("/api/member/profile");
      } catch {
        profile = null;
      }

      const user: User = {
        id: typeof payload?.id === "number" ? payload.id : 0,
        name: profile?.name ?? payload?.name ?? studentId,
        studentId: profile?.studentId ?? studentId,
        role,
      };

      localStorage.setItem("name", user.name);
      localStorage.setItem("user", JSON.stringify(user));

      login({
        user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      toast.success("로그인 성공", {
        description: data.message ?? "환영합니다.",
      });

      // 역할에 따라 다른 페이지로 라우팅
      if (role === "admin") {
        toast.success("관리자 로그인 성공", {
          description: "COMA-ROOM 관리자 모드로 이동합니다.",
        });
        navigate("/admin", { replace: true });
      } else {
        toast.success("로그인 성공", {
          description: "COMA-ROOM에 오신 것을 환영합니다.",
        });
        navigate("/main", { replace: true });
      }
    } catch (err) {
      toast.error("로그인 실패", {
        description: err instanceof Error ? err.message : "학번 또는 비밀번호가 올바르지 않습니다.",
      });
    }
  };

  return (
    <div className="min-h-screen gradient-mint flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center mb-6">
          <img src={comaLogo} alt="COMA Logo" className="w-24 h-24 rounded-2xl" />
          <h1
            className="mt-4 text-[28px] font-bold tracking-tight"
            style={{ color: "#40C095" }}
          >
            COMA-ROOM
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            COMA 동아리 부원 전용 플랫폼
          </p>
        </div>

        {/* 로그인 폼 컴포넌트 - 학번/비밀번호 입력 및 제출 */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "white",
            boxShadow: "0 24px 48px -30px rgba(0,0,0,0.51)",
          }}
        >
          <div
            className="text-center mb-6 pb-4"
            style={{ borderBottom: "1px solid #D1FAE5" }}
          >
            <h2 className="text-base font-bold" style={{ color: "#0F4C3A" }}>
              부원 로그인
            </h2>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
              COMA 동아리 부원만 접근 가능합니다
            </p>
          </div>

          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    </div>
  );
};

export default Index;
