import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isInitialized } = useAuth();

  // localStorage에서 유저 정보를 읽어오는 동안 대기 (새로고침 시 튕김 방지)
  if (!isInitialized) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/main" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
