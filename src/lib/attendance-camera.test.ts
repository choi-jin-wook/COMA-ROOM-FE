import { beforeEach, describe, expect, it, vi } from "vitest";
import { AttendanceCamera } from "./attendance-camera";

const mock = vi.hoisted(() => ({
  start: vi.fn(), stop: vi.fn(), clear: vi.fn(), getState: vi.fn(),
  getRunningTrackCapabilities: vi.fn(), applyVideoConstraints: vi.fn(),
  getRunningTrackSettings: vi.fn(), constructor: vi.fn(),
}));

vi.mock("html5-qrcode", () => ({
  Html5Qrcode: class {
    constructor() { mock.constructor(); }
    start = mock.start;
    stop = mock.stop;
    clear = mock.clear;
    getState = mock.getState;
    getRunningTrackCapabilities = mock.getRunningTrackCapabilities;
    getRunningTrackSettings = mock.getRunningTrackSettings;
    applyVideoConstraints = mock.applyVideoConstraints;
  },
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("attendance camera session", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mock.start.mockResolvedValue(null);
    mock.stop.mockResolvedValue(undefined);
    mock.getState.mockReturnValue(2);
    mock.getRunningTrackCapabilities.mockReturnValue({});
    mock.applyVideoConstraints.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    });
  });

  it("requests 1080p in videoConstraints and releases the permission stream", async () => {
    const stop = vi.fn();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue({
      getTracks: () => [{ stop }],
    } as unknown as MediaStream);
    const camera = new AttendanceCamera();
    await camera.start(vi.fn(), Promise.resolve());
    expect(stop).toHaveBeenCalledOnce();
    expect(mock.start).toHaveBeenCalledWith(
      { facingMode: "environment" },
      expect.objectContaining({
        fps: 10, qrbox: { width: 240, height: 240 },
        videoConstraints: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      }), expect.any(Function), expect.any(Function),
    );
  });

  it.each([
    new DOMException("unsupported resolution", "OverconstrainedError"),
    "Error getting userMedia: ConstraintNotSatisfiedError",
  ])("retries constraint failures once without resolution constraints: %s", async (error) => {
    mock.start.mockRejectedValueOnce(error);
    const camera = new AttendanceCamera();
    await camera.start(vi.fn(), Promise.resolve());
    expect(mock.start).toHaveBeenCalledTimes(2);
    expect(mock.start.mock.calls[1][1].videoConstraints).toEqual({ facingMode: "environment" });
    await camera.applyZoom(2);
    expect(mock.applyVideoConstraints).toHaveBeenLastCalledWith({
      facingMode: "environment", advanced: [{ zoom: 2 }],
    });
  });

  it.each(["NotAllowedError: denied", "NotFoundError: no camera", "NotReadableError: busy"])(
    "does not retry other scanner failures: %s", async (error) => {
      mock.start.mockRejectedValue(error);
      const camera = new AttendanceCamera();
      await expect(camera.start(vi.fn(), Promise.resolve())).rejects.toBe(error);
      expect(mock.start).toHaveBeenCalledOnce();
      mock.getState.mockReturnValue(1);
      await camera.stop();
      expect(mock.clear).toHaveBeenCalledOnce();
    },
  );

  it("does not start the scanner after permission is denied", async () => {
    const error = new DOMException("denied", "NotAllowedError");
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(error);
    await expect(new AttendanceCamera().start(vi.fn(), Promise.resolve())).rejects.toBe(error);
    expect(mock.start).not.toHaveBeenCalled();
  });

  it("keeps resolution and continuous focus when applying zoom", async () => {
    mock.getRunningTrackCapabilities.mockReturnValue({ focusMode: ["manual", "continuous"] });
    const camera = new AttendanceCamera();
    await camera.start(vi.fn(), Promise.resolve());
    await camera.applyZoom(2);
    expect(mock.applyVideoConstraints).toHaveBeenLastCalledWith({
      facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 },
      advanced: [{ focusMode: "continuous", zoom: 2 }],
    });
  });

  it("continues scanning if optional focus fails", async () => {
    mock.getRunningTrackCapabilities.mockReturnValue({ focusMode: ["continuous"] });
    mock.applyVideoConstraints.mockRejectedValueOnce(new Error("unsupported"));
    const camera = new AttendanceCamera();
    expect(await camera.start(vi.fn(), Promise.resolve())).not.toBeNull();
    await camera.applyZoom(2);
    expect(mock.applyVideoConstraints.mock.calls[1][0].advanced).toEqual([{ zoom: 2 }]);
  });

  it("does not apply unsupported focus controls", async () => {
    await new AttendanceCamera().start(vi.fn(), Promise.resolve());
    expect(mock.applyVideoConstraints).not.toHaveBeenCalled();
  });

  it("releases a permission stream arriving after cancellation", async () => {
    const permission = deferred<MediaStream>();
    const requested = deferred<void>();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockImplementation(() => {
      requested.resolve();
      return permission.promise;
    });
    const camera = new AttendanceCamera();
    const starting = camera.start(vi.fn(), Promise.resolve());
    await requested.promise;
    const stopping = camera.stop();
    const stop = vi.fn();
    permission.resolve({ getTracks: () => [{ stop }] } as unknown as MediaStream);
    await starting;
    await stopping;
    expect(stop).toHaveBeenCalledOnce();
    expect(mock.constructor).not.toHaveBeenCalled();
  });

  it("stops a scanner that opens after cancellation and ignores its QR callback", async () => {
    const opened = deferred<null>();
    const requested = deferred<void>();
    mock.start.mockImplementation(() => {
      requested.resolve();
      return opened.promise;
    });
    const decoded = vi.fn();
    const camera = new AttendanceCamera();
    const starting = camera.start(decoded, Promise.resolve());
    await requested.promise;
    const stopping = camera.stop();
    mock.start.mock.calls[0][2]("qr");
    opened.resolve(null);
    expect(await starting).toBeNull();
    await stopping;
    await camera.stop();
    expect(mock.stop).toHaveBeenCalledOnce();
    expect(mock.clear).toHaveBeenCalledOnce();
    expect(decoded).not.toHaveBeenCalled();
  });

  it("delivers a decoded QR only once", async () => {
    const decoded = vi.fn();
    await new AttendanceCamera().start(decoded, Promise.resolve());
    const onDecoded = mock.start.mock.calls[0][2];
    onDecoded("qr");
    onDecoded("qr");
    expect(decoded).toHaveBeenCalledExactlyOnceWith("qr");
  });

  it("waits for previous cleanup before requesting a new camera", async () => {
    const previous = deferred<void>();
    const camera = new AttendanceCamera();
    const starting = camera.start(vi.fn(), previous.promise);
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    previous.resolve();
    await starting;
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledOnce();
  });
});
