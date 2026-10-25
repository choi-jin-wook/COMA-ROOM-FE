import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AttendanceVerify from "./AttendanceVerify";
import { apiFetch } from "@/api/client";

const camera = vi.hoisted(() => ({
  settings: {} as { width?: number; height?: number; zoom?: number; focusMode?: string },
  capabilities: {} as { zoom?: { min: number; max: number; step: number } },
  start: vi.fn(), stop: vi.fn(), clear: vi.fn(), apply: vi.fn(),
}));

vi.mock("@/api/client", () => ({ apiFetch: vi.fn() }));
vi.mock("html5-qrcode", () => ({
  Html5Qrcode: class {
    start = camera.start;
    stop = camera.stop;
    clear = camera.clear;
    getState = () => 2;
    getRunningTrackSettings = () => camera.settings;
    getRunningTrackCapabilities = () => camera.capabilities;
    applyVideoConstraints = camera.apply;
  },
}));

describe("attendance camera controls", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    camera.settings = { width: 1920, height: 1080, zoom: 1, focusMode: "continuous" };
    camera.capabilities = { zoom: { min: 1, max: 4, step: 0.5 } };
    camera.start.mockResolvedValue(null);
    camera.stop.mockResolvedValue(undefined);
    camera.apply.mockImplementation(async (constraints) => {
      camera.settings = { ...camera.settings, zoom: constraints.advanced[0].zoom };
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    });
  });
  afterEach(cleanup);

  async function openCamera() {
    render(<MemoryRouter><AttendanceVerify /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "카메라 다시 시작" }));
    await screen.findByText("1920 × 1080");
  }

  it("shows actual resolution, zoom and focus, and refreshes them after zoom", async () => {
    await openCamera();
    expect(screen.getByText("1.0배")).toBeInTheDocument();
    expect(screen.getByText("연속 자동 초점")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "카메라 확대" }));
    await screen.findByText("1.5배");
    expect(camera.apply).toHaveBeenCalledWith(expect.objectContaining({
      width: { ideal: 1920 }, height: { ideal: 1080 },
    }));
  });

  it("does not present missing settings as measured values", async () => {
    camera.settings = {};
    camera.capabilities = {};
    render(<MemoryRouter><AttendanceVerify /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "카메라 다시 시작" }));
    await screen.findByText("확인 불가");
    expect(screen.getAllByText("브라우저에서 제공하지 않음")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "카메라 확대" })).toBeDisabled();
  });

  it("keeps scanning when zoom is ignored and allows cancellation and restart", async () => {
    camera.apply.mockResolvedValue(undefined);
    await openCamera();
    fireEvent.click(screen.getByRole("button", { name: "카메라 확대" }));
    await screen.findByText("카메라 줌을 사용할 수 없어 현재 배율로 QR 인식을 계속합니다.");
    expect(screen.getByText("1.0배")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    await waitFor(() => expect(camera.stop).toHaveBeenCalledOnce());
    expect(screen.queryByText("카메라 정보")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "카메라 다시 시작" }));
    await screen.findByText("1920 × 1080");
    expect(camera.start).toHaveBeenCalledTimes(2);
  });

  it("submits attendance once when duplicate QR frames arrive", async () => {
    vi.mocked(apiFetch).mockResolvedValue({});
    await openCamera();
    const decoded = camera.start.mock.calls[0][2];
    await act(async () => {
      decoded(" qr-session ");
      decoded(" qr-session ");
    });
    await waitFor(() => expect(apiFetch).toHaveBeenCalledExactlyOnceWith(
      "/api/event/attendances/checks", {
        method: "POST", body: JSON.stringify({ qrCodeId: "qr-session" }),
      },
    ));
  });
});
