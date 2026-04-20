import { describe, expect, it } from "vitest";
import { WORDS } from "@/data/words";
import type { MatchRound } from "@/game/rounds";
import {
  disableMatchChoices,
  markMatchChoice,
  matchChoiceFromEvent,
  renderMatchBoard,
} from "@/ui/matchBoard";

function fakeRound(): MatchRound {
  return {
    kind: "match",
    answer: WORDS[0],
    choices: [WORDS[0], WORDS[1], WORDS[2]],
  };
}

function mount(): HTMLElement {
  const host = document.createElement("div");
  document.body.appendChild(host);
  host.innerHTML = renderMatchBoard(fakeRound());
  return host;
}

describe("renderMatchBoard", () => {
  it("renders an instruction, listen button, and 3 hanzi choice buttons", () => {
    const host = mount();
    expect(host.querySelector(".draw-instruction")).not.toBeNull();
    expect(host.querySelector("[data-replay]")).not.toBeNull();
    const choices = host.querySelectorAll("button.choice");
    expect(choices).toHaveLength(3);
    expect(choices[0].getAttribute("data-choice")).toBe(WORDS[0].hanzi);
    expect(choices[0].querySelector(".choice-hanzi")?.textContent).toBe(
      WORDS[0].hanzi,
    );
  });

  it("does not show the answer in plain text before reveal", () => {
    const host = mount();
    // The prompt card shouldn't display the answer hanzi as part of the prompt.
    expect(host.querySelector(".prompt-card--match [data-hanzi]")).toBeNull();
  });
});

describe("markMatchChoice / disableMatchChoices", () => {
  it("marks a button with the correct state class", () => {
    const host = mount();
    markMatchChoice(host, WORDS[0].hanzi, "correct");
    expect(
      host.querySelector(`[data-choice="${WORDS[0].hanzi}"]`)!.classList.contains(
        "choice--correct",
      ),
    ).toBe(true);
  });

  it("disables all choices", () => {
    const host = mount();
    disableMatchChoices(host);
    host
      .querySelectorAll<HTMLButtonElement>("button.choice")
      .forEach((b) => expect(b.disabled).toBe(true));
  });
});

describe("matchChoiceFromEvent", () => {
  it("returns the hanzi of the clicked button", () => {
    const host = mount();
    const inner = host.querySelector(
      `[data-choice="${WORDS[0].hanzi}"] .choice-hanzi`,
    ) as HTMLElement;
    const evt = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(evt, "target", { value: inner });
    expect(matchChoiceFromEvent(evt)).toBe(WORDS[0].hanzi);
  });

  it("returns null when the click is outside a choice button", () => {
    const evt = new MouseEvent("click");
    Object.defineProperty(evt, "target", {
      value: document.createElement("div"),
    });
    expect(matchChoiceFromEvent(evt)).toBeNull();
  });
});
