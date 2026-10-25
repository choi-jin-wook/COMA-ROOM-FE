import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface AttendanceQrCodeProps {
  value: string;
  fullscreen?: boolean;
  className?: string;
}

export default function AttendanceQrCode({ value, fullscreen = false, className }: AttendanceQrCodeProps) {
  return (
    <QRCodeSVG
      value={value}
      size={fullscreen ? 1024 : 320}
      level="H"
      marginSize={4}
      fgColor="#000000"
      bgColor="#FFFFFF"
      title="출석 인증 QR 코드"
      className={cn("mx-auto block h-auto w-full shrink-0", !fullscreen && "max-w-[320px]", className)}
      style={fullscreen ? { width: "min(calc(100vw - 32px), calc(100dvh - 190px))" } : undefined}
    />
  );
}
