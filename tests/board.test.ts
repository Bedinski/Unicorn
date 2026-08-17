import { describe, expect, it } from "vitest";
import {
  choiceFromEvent,
  disableChoices,
  markChoice,
  renderBoard,
} from "@/ui/board";
import type { McqRound } from "@/game/rounds";
import { WORDS } from "@/data/words";

function fakeRound(): McqRound {
  const answer = WORDS[0];
  const choices = [WORDS[0], WORDS[1], WORDS[2]];
  return { kind: "mcq", answer, choices };
}

describe("renderBoard", () => {
  it("renders the prompt hanzi, pinyin, and three choice buttons", () => {
    const container = document.createElement("div");
    container.innerHTML = renderBoard(fakeRound());

    expect(container.querySelector('[data-hanzi]')?.textContent).toBe(
      WORDS[0].hanzi,
    );
    expect(container.querySelector('[data-pinyin]')?.textContent).toBe(
      WORDS[0].pinyin,
    );

    const choices = container.querySelectorAll("button.choice");
    expect(choices).toHaveLength(3);
    expect(choices[0].getAttribute("data-choice")).toBe(WORDS[0].hanzi);
  });

  it("includes a replay-audio button", () => {
    const container = document.createElement("div");
    container.innerHTML = renderBoard(fakeRound());
    expect(container.querySelector('[data-replay]')).not.toBeNull();
  });
});

describe("markChoice / disableChoices", () => {
  it("adds the status class to the chosen button", () => {
    const container = document.createElement("div");
    container.innerHTML = renderBoard(fakeRound());
    markChoice(container, WORDS[0].hanzi, "correct");
    const btn = container.querySelector(
      `[data-choice="${WORDS[0].hanzi}"]`,
    );
    expect(btn?.classList.contains("choice--correct")).toBe(true);
  });

  it("disables all choice buttons", () => {
    const container = document.createElement("div");
    container.innerHTML = renderBoard(fakeRound());
    disableChoices(container);
    container.querySelectorAll<HTMLButtonElement>("button.choice").forEach(
      (b) => expect(b.disabled).toBe(true),
    );
  });
});

describe("choiceFromEvent", () => {
  it("returns the data-choice when a choice button is clicked", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = renderBoard(fakeRound());

    const inner = container.querySelector(
      `[data-choice="${WORDS[0].hanzi}"] .choice-label`,
    ) as HTMLElement;
    const evt = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(evt, "target", { value: inner });
    expect(choiceFromEvent(evt)).toBe(WORDS[0].hanzi);
  });

  it("returns null when the click is outside a choice button", () => {
    const evt = new MouseEvent("click");
    Object.defineProperty(evt, "target", {
      value: document.createElement("div"),
    });
    expect(choiceFromEvent(evt)).toBeNull();
  });
});
