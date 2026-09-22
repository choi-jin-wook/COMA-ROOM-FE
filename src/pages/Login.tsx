import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import comaLogo from "@/assets/coma-logo.png";
import { useAuth, type User } from "@/contexts/AuthContext";
import { apiFetch } from "@/api/client";

function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
  } catch {
    return null;
  }
}

type OAuthLoginData = {
  accessToken: string;
  refreshToken?: string;
  role?: string;
};

type ProfileData = {
  name: string;
  studentId: string;
};

function normalizeRole(role: unknown): User["role"] {
  return typeof role === "string" && role.toUpperCase() === "ADMIN" ? "admin" : "user";
}

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const exchangingCodeRef = useRef<string | null>(null);

  const completeLogin = useCallback(async ({ accessToken, refreshToken, role: responseRole }: OAuthLoginData) => {
    try {
      const payload = decodeJwtPayload(accessToken);
      const role = normalizeRole(responseRole ?? payload?.role);

      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      let profile: ProfileData | null = null;
      try {
        profile = await apiFetch<ProfileData>("/api/member/profile");
      } catch {
        profile = null;
      }

      const user: User = {
        id: typeof payload?.id === "number" ? payload.id : 0,
        name: profile?.name ?? payload?.name ?? "COMA 회원",
        studentId: profile?.studentId ?? payload?.studentId ?? "",
        role,
      };

      login({ user, accessToken, refreshToken });
      toast.success("로그인 성공", { description: "COMA-ROOM에 오신 것을 환영합니다." });
      navigate(role === "admin" ? "/admin" : "/main", { replace: true });
    } catch (error) {
      toast.error("로그인 실패", {
        description: error instanceof Error ? error.message : "네이버 로그인 처리에 실패했습니다.",
      });
    }
  }, [login, navigate]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const loginCode = query.get("loginCode") ?? hash.get("loginCode");
    if (!loginCode || exchangingCodeRef.current === loginCode) return;

    exchangingCodeRef.current = loginCode;
    setIsRedirecting(true);
    window.history.replaceState({}, document.title, window.location.pathname);
    void apiFetch<OAuthLoginData>("/api/auth/oauth/exchange", {
      method: "POST",
      body: JSON.stringify({ loginCode }),
    })
      .then(completeLogin)
      .catch((error) => {
        toast.error("로그인 실패", {
          description: error instanceof Error ? error.message : "네이버 로그인 코드를 교환하지 못했습니다.",
        });
      })
      .finally(() => setIsRedirecting(false));
  }, [completeLogin]);

  const handleNaverLogin = () => {
    setIsRedirecting(true);
    const loginUrl = import.meta.env.VITE_NAVER_LOGIN_URL;
    window.location.assign(loginUrl);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(115deg,#ECFDF5_0%,#F8FFFE_50%,#F0FDFA_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[394px] flex-col px-4 pb-4 pt-[42px]">
        <div className="flex flex-col items-center">
          <img src={comaLogo} alt="COMA-ROOM" className="h-[77px] w-[77px] rounded-[20px] object-cover" />
          <h1 className="mt-[15px] text-[30px] font-semibold leading-9 tracking-[0.4px] text-[#30B488]/80">COMA-ROOM</h1>
          <p className="mt-2 text-base leading-6 text-[#6B7280]">COMA 동아리 회원 전용 플랫폼</p>
        </div>

        <div className="min-h-[300px] flex-1" />

        <section className="h-[231px] rounded-[14px] border border-[#B4FFD9] bg-white shadow-[0_20px_25px_-12px_rgba(0,0,0,0.18),0_8px_10px_-5px_rgba(0,0,0,0.12)]">
          <div className="px-6 pt-6 text-center">
            <h2 className="text-base font-medium text-[#0F4C3A]">회원 로그인</h2>
            <p className="mt-[6px] text-base leading-6 text-[#6B7280]">COMA 동아리 부원만 접근 가능합니다</p>
          </div>
          <div className="mt-[20px] flex flex-col items-center px-6">
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] bg-[#03C75A] px-[18px] text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
              onClick={handleNaverLogin}
              disabled={isRedirecting}
            >
              <span aria-hidden="true" className="text-lg font-black">N</span>
              {isRedirecting ? "네이버 로그인으로 이동 중..." : "네이버로 로그인"}
            </button>
            <p className="mt-[14px] text-xs text-[#6B7280]">네이버 계정으로 간편하게 로그인하세요</p>
          </div>
        </section>

        <p className="mt-[14px] text-center text-xs leading-5 text-black/50">
          회원이 되고 싶으시다면? <button type="button" className="text-sm font-semibold text-[#30B488] hover:underline">운영진에게 문의하기</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
