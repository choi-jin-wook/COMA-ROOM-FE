import { Html5Qrcode } from "html5-qrcode";

export type CameraSettings = MediaTrackSettings & {
  zoom?: number;
  focusMode?: string;
};

export type CameraCapabilities = MediaTrackCapabilities & {
  zoom?: { min: number; max: number; step: number };
  focusMode?: string[];
};

type CameraConstraints = MediaTrackConstraints & { focusMode?: string };

// A session owns its pending start as well as its stream, so cancellation can
// release a camera even when permission or scanner.start() resolves later.
export class AttendanceCamera {
  private scanner: Html5Qrcode | null = null;
  private pendingStart: Promise<Html5Qrcode | null> | null = null;
  private pendingStop: Promise<void> | null = null;
  private cancelled = false;
  private decoded = false;
  private constraints: CameraConstraints = {
    facingMode: "environment",
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };

  start(onDecoded: (text: string) => void, previousStop: Promise<void>) {
    this.pendingStart = this.open(onDecoded, previousStop);
    return this.pendingStart;
  }

  private async open(onDecoded: (text: string) => void, previousStop: Promise<void>) {
    await previousStop;
    if (this.cancelled) return null;

    // Keep the explicit mobile permission request, releasing it before scanning.
    if (navigator.mediaDevices?.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.getTracks().forEach((track) => track.stop());
    }
    if (this.cancelled) return null;

    const scanner = new Html5Qrcode("qr-reader");
    this.scanner = scanner;
    const begin = () => scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 }, videoConstraints: this.constraints },
      (text) => {
        if (this.cancelled || this.decoded) return;
        this.decoded = true;
        onDecoded(text);
      },
      () => {},
    );

    try {
      await begin();
    } catch (error) {
      // html5-qrcode can wrap DOMException as a string.
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      if (this.cancelled || !/OverconstrainedError|ConstraintNotSatisfiedError/i.test(message)) {
        throw error;
      }
      this.constraints = { facingMode: "environment" };
      await begin();
    }
    if (this.cancelled) return null;

    try {
      const capabilities = scanner.getRunningTrackCapabilities() as CameraCapabilities;
      if (capabilities.focusMode?.includes("continuous")) {
        await scanner.applyVideoConstraints({ ...this.constraints, advanced: [
          { focusMode: "continuous" } as CameraConstraints,
        ] });
        this.constraints = { ...this.constraints, focusMode: "continuous" };
      }
    } catch {
      // Optional focus controls must never prevent attendance scanning.
    }
    return this.cancelled ? null : scanner;
  }

  async applyZoom(zoom: number) {
    if (this.cancelled || !this.scanner) return;
    const { focusMode, ...base } = this.constraints;
    await this.scanner.applyVideoConstraints({
      ...base,
      advanced: [{ ...(focusMode ? { focusMode } : {}), zoom } as MediaTrackConstraintSet],
    });
  }

  stop(): Promise<void> {
    this.cancelled = true;
    if (!this.pendingStop) this.pendingStop = this.release();
    return this.pendingStop;
  }

  private async release() {
    try {
      await this.pendingStart;
    } catch {
      // Failed starts still need their scanner UI cleared.
    }
    if (!this.scanner) return;
    const state = this.scanner.getState();
    if (state === 2 || state === 3) await this.scanner.stop();
    this.scanner.clear();
    this.scanner = null;
  }
}
