import { Maximize, X } from "lucide-react";
import AttendanceQrCode from "@/components/AttendanceQrCode";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface AttendanceQrFullscreenProps {
  value: string;
  title?: string;
}

export default function AttendanceQrFullscreen({ value, title }: AttendanceQrFullscreenProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] px-4 py-2 text-sm font-medium text-white hover:bg-[#059669] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2"
        >
          <Maximize className="h-4 w-4" aria-hidden="true" />
          전체화면으로 보기
        </button>
      </DialogTrigger>
      <DialogContent
        hideCloseButton
        className="inset-0 flex h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center gap-4 overflow-y-auto border-0 bg-white p-4 text-slate-900 sm:rounded-none data-[state=open]:animate-none data-[state=closed]:animate-none"
      >
        <DialogClose asChild>
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            닫기
          </button>
        </DialogClose>
        <DialogTitle className="mt-12 w-full truncate text-center text-lg font-bold">
          {title || "출석 QR 코드"}
        </DialogTitle>
        <AttendanceQrCode value={value} fullscreen />
        <DialogDescription className="text-center text-sm text-slate-600">
          QR 코드를 스캔하여 출석해주세요
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
