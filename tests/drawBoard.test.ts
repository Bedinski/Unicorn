import { describe, expect, it, vi } from "vitest";
import { WORDS } from "@/data/words";
import type { DrawRound } from "@/game/rounds";
import { renderDrawBoard, wireDrawBoard } from "@/ui/drawBoard";

function fakeDrawRound(): DrawRound {
  return { kind: "draw", answer: WORDS[0] };
}

function mount(): HTMLElement {
  const host = document.createElement("div");
  document.body.appendChild(host);
  host.innerHTML = renderDrawBoard(fakeDrawRound());
  return host;
}

describe("renderDrawBoard", () => {
  it("renders an instruction, replay button, canvas, and controls", () => {
    const host = mount();
    expect(host.querySelector(".draw-instruction")).not.toBeNull();
    expect(host.querySelector("[data-replay]")).not.toBeNull();
    expect(host.querySelector("canvas[data-canvas]")).not.toBeNull();
    expect(host.querySelector('[data-action="clear"]')).not.toBeNull();
    expect(host.querySelector('[data-action="reveal"]')).not.toBeNull();
    expect(host.querySelector('[data-action="correct"]')).not.toBeNull();
    expect(host.querySelector('[data-action="incorrect"]')).not.toBeNull();
  });

  it("hides the reference and self-assessment buttons initially", () => {
    const host = mount();
    const ref = host.querySelector<HTMLElement>("[data-reference]");
    const got = host.querySelector<HTMLButtonElement>(
      '[data-action="correct"]',
    );
    const prac = host.querySelector<HTMLButtonElement>(
      '[data-action="incorrect"]',
    );
    expect(ref?.hidden).toBe(true);
    expect(got?.hidden).toBe(true);
    expect(prac?.hidden).toBe(true);
  });

  it("includes the answer hanzi and pinyin in the (hidden) reference", () => {
    const host = mount();
    const ref = host.querySelector("[data-reference]");
    expect(ref?.querySelector("[data-hanzi]")?.textContent).toBe("猫");
    expect(ref?.querySelector("[data-pinyin]")?.textContent).toBe("māo");
  });
});

describe("wireDrawBoard", () => {
  it("reveal button unhides the reference and swaps to self-assessment buttons", () => {
    const host = mount();
    const handlers = {
      onReveal: vi.fn(),
      onReplayAudio: vi.fn(),
      onGotIt: vi.fn(),
      onNeedsPractice: vi.fn(),
    };
    wireDrawBoard(host, handlers);

    const revealBtn = host.querySelector<HTMLButtonElement>(
      '[data-action="reveal"]',
    );
    const ref = host.querySelector<HTMLElement>("[data-reference]");
    const gotIt = host.querySelector<HTMLButtonElement>(
      '[data-action="correct"]',
    );
    const practice = host.querySelector<HTMLButtonElement>(
      '[data-action="incorrect"]',
    );

    revealBtn!.click();

    expect(handlers.onReveal).toHaveBeenCalledTimes(1);
    expect(ref!.hidden).toBe(false);
    expect(revealBtn!.hidden).toBe(true);
    expect(gotIt!.hidden).toBe(false);
    expect(practice!.hidden).toBe(false);
  });

  it("got-it and needs-practice buttons fire their handlers", () => {
    const host = mount();
    const handlers = {
      onReveal: vi.fn(),
      onReplayAudio: vi.fn(),
      onGotIt: vi.fn(),
      onNeedsPractice: vi.fn(),
    };
    wireDrawBoard(host, handlers);

    host.querySelector<HTMLButtonElement>('[data-action="reveal"]')!.click();
    host.querySelector<HTMLButtonElement>('[data-action="correct"]')!.click();
    expect(handlers.onGotIt).toHaveBeenCalledTimes(1);

    host
      .querySelector<HTMLButtonElement>('[data-action="incorrect"]')!
      .click();
    expect(handlers.onNeedsPractice).toHaveBeenCalledTimes(1);
  });

  it("replay button fires onReplayAudio", () => {
    const host = mount();
    const handlers = {
      onReveal: vi.fn(),
      onReplayAudio: vi.fn(),
      onGotIt: vi.fn(),
      onNeedsPractice: vi.fn(),
    };
    wireDrawBoard(host, handlers);

    host.querySelector<HTMLButtonElement>("[data-replay]")!.click();
    expect(handlers.onReplayAudio).toHaveBeenCalledTimes(1);
  });

  it("dispose removes listeners so later clicks are inert", () => {
    const host = mount();
    const handlers = {
      onReveal: vi.fn(),
      onReplayAudio: vi.fn(),
      onGotIt: vi.fn(),
      onNeedsPractice: vi.fn(),
    };
    const dispose = wireDrawBoard(host, handlers);
    dispose();

    host.querySelector<HTMLButtonElement>('[data-action="reveal"]')!.click();
    host.querySelector<HTMLButtonElement>("[data-replay]")!.click();

    expect(handlers.onReveal).not.toHaveBeenCalled();
    expect(handlers.onReplayAudio).not.toHaveBeenCalled();
  });
});
