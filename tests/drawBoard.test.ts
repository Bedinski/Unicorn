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
  it("renders an instruction, replay button, canvas, and two control buttons", () => {
    const host = mount();
    expect(host.querySelector(".draw-instruction")).not.toBeNull();
    expect(host.querySelector("[data-replay]")).not.toBeNull();
    expect(host.querySelector("canvas[data-canvas]")).not.toBeNull();
    expect(host.querySelector('[data-action="clear"]')).not.toBeNull();
    expect(host.querySelector('[data-action="done"]')).not.toBeNull();
  });

  it("shows the reference character and pinyin from the start (no hiding)", () => {
    const host = mount();
    const ref = host.querySelector<HTMLElement>("[data-reference]");
    expect(ref).not.toBeNull();
    expect(ref!.hidden).toBe(false);
    expect(ref!.querySelector("[data-hanzi]")?.textContent).toBe(
      WORDS[0].hanzi,
    );
    expect(ref!.querySelector("[data-pinyin]")?.textContent).toBe(
      WORDS[0].pinyin,
    );
  });

  it("does not apply an inline height to the canvas so CSS aspect-ratio can keep it square", () => {
    const host = mount();
    const canvas = host.querySelector<HTMLCanvasElement>("[data-canvas]")!;
    expect(canvas.style.height).toBe("");
  });
});

describe("wireDrawBoard", () => {
  it("Done fires onDone", () => {
    const host = mount();
    const handlers = {
      onReplayAudio: vi.fn(),
      onDone: vi.fn(),
    };
    wireDrawBoard(host, handlers);

    host.querySelector<HTMLButtonElement>('[data-action="done"]')!.click();
    expect(handlers.onDone).toHaveBeenCalledTimes(1);
  });

  it("replay button fires onReplayAudio", () => {
    const host = mount();
    const handlers = {
      onReplayAudio: vi.fn(),
      onDone: vi.fn(),
    };
    wireDrawBoard(host, handlers);

    host.querySelector<HTMLButtonElement>("[data-replay]")!.click();
    expect(handlers.onReplayAudio).toHaveBeenCalledTimes(1);
  });

  it("clear button does not fire onDone", () => {
    const host = mount();
    const handlers = {
      onReplayAudio: vi.fn(),
      onDone: vi.fn(),
    };
    wireDrawBoard(host, handlers);

    host.querySelector<HTMLButtonElement>('[data-action="clear"]')!.click();
    expect(handlers.onDone).not.toHaveBeenCalled();
  });

  it("dispose removes listeners so later clicks are inert", () => {
    const host = mount();
    const handlers = {
      onReplayAudio: vi.fn(),
      onDone: vi.fn(),
    };
    const dispose = wireDrawBoard(host, handlers);
    dispose();

    host.querySelector<HTMLButtonElement>('[data-action="done"]')!.click();
    host.querySelector<HTMLButtonElement>("[data-replay]")!.click();

    expect(handlers.onDone).not.toHaveBeenCalled();
    expect(handlers.onReplayAudio).not.toHaveBeenCalled();
  });
});
