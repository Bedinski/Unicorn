import { afterEach, describe, expect, it, vi } from "vitest";
import { WORDS } from "@/data/words";
import { renderTeacherCard, wireTeacherCard } from "@/ui/teacherCard";

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

describe("renderTeacherCard", () => {
  it("renders the hanzi, pinyin, and english of the current word", () => {
    const host = mount(renderTeacherCard(WORDS[0], 0, 5));
    expect(host.querySelector("[data-teacher-hanzi]")?.textContent).toBe(
      WORDS[0].hanzi,
    );
    expect(host.querySelector(".teacher-pinyin")?.textContent).toBe(
      WORDS[0].pinyin,
    );
    expect(host.querySelector(".teacher-english")?.textContent).toBe(
      WORDS[0].english,
    );
  });

  it("includes a Listen and a Next button on a normal card", () => {
    const host = mount(renderTeacherCard(WORDS[0], 0, 5));
    expect(host.querySelector("[data-teacher-listen]")).not.toBeNull();
    expect(host.querySelector("[data-teacher-next]")).not.toBeNull();
  });

  it("shows progress as 'Card N of M' and a filled progress bar", () => {
    const host = mount(renderTeacherCard(WORDS[2], 2, 8));
    expect(host.querySelector(".teacher-progress-text")?.textContent)
      .toContain("Card 3 of 8");
    const fill = host.querySelector<HTMLElement>(".teacher-progress-fill");
    // 3/8 = 37.5% -> rounds to 38%
    expect(fill?.style.width).toBe("38%");
  });

  it("hides Previous on the first card and shows it from card 2 onward", () => {
    const first = mount(renderTeacherCard(WORDS[0], 0, 5));
    expect(first.querySelector("[data-teacher-prev]")).toBeNull();
    const second = mount(renderTeacherCard(WORDS[1], 1, 5));
    expect(second.querySelector("[data-teacher-prev]")).not.toBeNull();
  });

  it("labels the Next button '🎉 Finish' on the last card", () => {
    const host = mount(renderTeacherCard(WORDS[4], 4, 5));
    expect(host.querySelector("[data-teacher-next]")?.textContent)
      .toContain("Finish");
  });

  it("renders a completion screen when index >= total with Restart button", () => {
    const host = mount(renderTeacherCard(null, 5, 5));
    expect(host.querySelector(".teacher-card--complete")).not.toBeNull();
    expect(host.querySelector("[data-teacher-restart]")).not.toBeNull();
  });

  it("renders an empty-deck message when total is 0", () => {
    const host = mount(renderTeacherCard(null, 0, 0));
    expect(host.querySelector(".teacher-card--empty")).not.toBeNull();
  });
});

describe("wireTeacherCard", () => {
  it("Listen, Next, and Previous fire their respective handlers", () => {
    const host = mount(renderTeacherCard(WORDS[1], 1, 4));
    const handlers = {
      onListen: vi.fn(),
      onNext: vi.fn(),
      onPrev: vi.fn(),
      onRestart: vi.fn(),
    };
    wireTeacherCard(host, handlers);
    host.querySelector<HTMLButtonElement>("[data-teacher-listen]")!.click();
    host.querySelector<HTMLButtonElement>("[data-teacher-next]")!.click();
    host.querySelector<HTMLButtonElement>("[data-teacher-prev]")!.click();
    expect(handlers.onListen).toHaveBeenCalledTimes(1);
    expect(handlers.onNext).toHaveBeenCalledTimes(1);
    expect(handlers.onPrev).toHaveBeenCalledTimes(1);
  });

  it("Restart fires on the completion screen", () => {
    const host = mount(renderTeacherCard(null, 3, 3));
    const handlers = {
      onListen: vi.fn(),
      onNext: vi.fn(),
      onPrev: vi.fn(),
      onRestart: vi.fn(),
    };
    wireTeacherCard(host, handlers);
    host
      .querySelector<HTMLButtonElement>("[data-teacher-restart]")!
      .click();
    expect(handlers.onRestart).toHaveBeenCalledTimes(1);
  });

  it("dispose removes all listeners", () => {
    const host = mount(renderTeacherCard(WORDS[1], 1, 4));
    const handlers = {
      onListen: vi.fn(),
      onNext: vi.fn(),
      onPrev: vi.fn(),
      onRestart: vi.fn(),
    };
    const dispose = wireTeacherCard(host, handlers);
    dispose();
    host.querySelector<HTMLButtonElement>("[data-teacher-listen]")!.click();
    host.querySelector<HTMLButtonElement>("[data-teacher-next]")!.click();
    expect(handlers.onListen).not.toHaveBeenCalled();
    expect(handlers.onNext).not.toHaveBeenCalled();
  });
});
