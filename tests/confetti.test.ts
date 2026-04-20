import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { burst } from "@/ui/confetti";

beforeEach(() => {
  document.body.innerHTML = "";
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("confetti.burst", () => {
  it("creates a host element and injects pieces on first call", () => {
    burst({ count: 5 });
    const host = document.querySelector("[data-confetti-host]");
    expect(host).not.toBeNull();
    expect(host!.querySelectorAll(".confetti-piece")).toHaveLength(5);
  });

  it("reuses the host element across bursts", () => {
    burst({ count: 3 });
    burst({ count: 4 });
    const hosts = document.querySelectorAll("[data-confetti-host]");
    expect(hosts).toHaveLength(1);
    expect(hosts[0].querySelectorAll(".confetti-piece")).toHaveLength(7);
  });

  it("removes pieces after the safety fallback timeout", () => {
    burst({ count: 6, durationMs: 100 });
    const host = document.querySelector("[data-confetti-host]")!;
    expect(host.querySelectorAll(".confetti-piece").length).toBeGreaterThan(0);
    vi.advanceTimersByTime(2000);
    expect(host.querySelectorAll(".confetti-piece").length).toBe(0);
  });

  it("applies inline transform variables for randomized trajectories", () => {
    burst({ count: 1, origin: { x: 100, y: 50 } });
    const piece = document.querySelector<HTMLElement>(".confetti-piece");
    expect(piece).not.toBeNull();
    expect(piece!.style.getPropertyValue("--confetti-dx")).not.toBe("");
    expect(piece!.style.getPropertyValue("--confetti-dy")).not.toBe("");
    expect(piece!.style.getPropertyValue("--confetti-rot")).not.toBe("");
    expect(piece!.style.left).toBe("100px");
    expect(piece!.style.top).toBe("50px");
  });
});
