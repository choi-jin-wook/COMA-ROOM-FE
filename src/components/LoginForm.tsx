import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Key, Lock } from "lucide-react";

interface LoginFormProps {
  onLogin: (studentId: string, password: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(studentId, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="studentId" className="font-medium text-sm" style={{ color: '#0F4C3A' }}>
          학번
        </Label>
        <Input
          id="studentId"
          type="text"
          placeholder="2024123456"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="h-12 border-0 rounded-lg text-sm"
          style={{ backgroundColor: '#F0FDF4', color: '#0F4C3A' }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="font-medium text-sm" style={{ color: '#0F4C3A' }}>
          비밀번호
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 border-0 rounded-lg text-sm"
          style={{ backgroundColor: '#F0FDF4', color: '#0F4C3A' }}
        />
      </div>

      <button
        type="submit"
        className="w-full h-12 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 text-white transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(90deg, #2EBD8D 0%, #40C095 100%)' }}
      >
        <ArrowRight className="w-4 h-4" />
        로그인
      </button>

      <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: '#D1FAE5' }}>
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: '#40C095' }}>○</span>
          <span className="font-semibold" style={{ color: '#0F4C3A' }}>초기 계정 정보</span>
        </div>
        <ul className="text-sm space-y-1 ml-5" style={{ color: '#6B7280' }}>
          <li>• 아이디: <span className="font-medium" style={{ color: '#40C095' }}>학번</span></li>
          <li>• 비밀번호: <span className="font-medium" style={{ color: '#40C095' }}>전화번호 11자리</span></li>
        </ul>
        <p className="text-xs ml-5" style={{ color: '#6B7280' }}>(예: 01012345678)</p>
        <p className="text-xs ml-5 mt-2" style={{ color: '#0F4C3A' }}>
          ※ 최초 로그인 후 비밀번호를 변경해주세요.
        </p>
        <p className="text-[11px] ml-5" style={{ color: '#6B7280' }}>
          비밀번호 미변경으로 인한 불이익에 대한 책임은 본인에게 있습니다.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 h-11 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
          style={{ backgroundColor: 'white', border: '1px solid #D1FAE5', color: '#6B7280' }}
        >
          <Key className="w-4 h-4" />
          비밀번호 찾기
        </button>
        <button
          type="button"
          className="flex-1 h-11 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
          style={{ backgroundColor: 'white', border: '1px solid #D1FAE5', color: '#6B7280' }}
        >
          <Lock className="w-4 h-4" />
          비밀번호 변경
        </button>
      </div>

      <div className="text-center text-sm pt-2" style={{ color: '#6B7280' }}>
        회원이 되고 싶으시다면?{" "}
        <button 
          type="button" 
          className="font-semibold hover:underline underline-offset-2"
          style={{ color: '#40C095' }}
        >
          운영진에게 문의하기
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
