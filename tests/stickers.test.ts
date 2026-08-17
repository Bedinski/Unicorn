import { afterEach, describe, expect, it } from "vitest";
import { STUDY_CATEGORIES } from "@/data/firstGrade";
import type { CategoryCorrect } from "@/game/state";
import { STICKER_THRESHOLD } from "@/game/state";
import { STICKERS, infoFor, renderStickerBook, stickerSummary } from "@/ui/stickers";

afterEach(() => { document.body.innerHTML = ""; });

function mount(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

describe("stickers", () => {
  it("has one sticker per First Grade study category", () => {
    expect(new Set(STICKERS.map((sticker) => sticker.category)).size).toBe(STUDY_CATEGORIES.length);
    expect(STICKERS).toHaveLength(STUDY_CATEGORIES.length);
  });

  it("returns category presentation details", () => {
    expect(infoFor("hfw-animals").label).toContain("Animals");
    expect(infoFor("hfw-opposites").label).toContain("Opposites");
    // @ts-expect-error runtime guard
    expect(() => infoFor("space")).toThrow();
  });

  it("counts and renders earned progress", () => {
    const progress: CategoryCorrect = {
      "hfw-animals": STICKER_THRESHOLD,
      "hfw-colors": 2,
      dictation: STICKER_THRESHOLD + 1,
    };
    expect(stickerSummary(progress).earnedCount).toBe(2);
    const host = mount(renderStickerBook(progress, ["hfw-animals", "dictation"]));
    expect(host.querySelectorAll(".sticker")).toHaveLength(STICKERS.length);
    expect(host.querySelectorAll(".sticker--earned")).toHaveLength(2);
    expect(Array.from(host.querySelectorAll(".sticker-status")).map((el) => el.textContent)).toContain(`2/${STICKER_THRESHOLD}`);
    expect(host.querySelector("[data-close]")).not.toBeNull();
  });
});
