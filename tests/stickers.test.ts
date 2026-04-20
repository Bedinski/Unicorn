import { afterEach, describe, expect, it } from "vitest";
import type { CategoryCorrect } from "@/game/state";
import { STICKER_THRESHOLD } from "@/game/state";
import {
  STICKERS,
  infoFor,
  renderStickerBook,
  stickerSummary,
} from "@/ui/stickers";

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

describe("stickers", () => {
  it("has one sticker per known category", () => {
    const cats = new Set(STICKERS.map((s) => s.category));
    expect(cats.size).toBe(STICKERS.length);
    // Sanity: expected categories present
    for (const c of ["animals", "colors", "numbers", "opposites"] as const) {
      expect(cats.has(c)).toBe(true);
    }
  });

  it("infoFor returns the sticker for a known category", () => {
    expect(infoFor("animals").emoji).toBe("🐾");
    expect(infoFor("opposites").label).toContain("Opposite");
  });

  it("infoFor throws for an unknown category", () => {
    // @ts-expect-error testing runtime guard
    expect(() => infoFor("space")).toThrow();
  });

  it("stickerSummary counts earned vs total", () => {
    const partial: CategoryCorrect = {
      animals: STICKER_THRESHOLD,
      colors: STICKER_THRESHOLD - 1,
      numbers: STICKER_THRESHOLD + 3,
    };
    const summary = stickerSummary(partial);
    expect(summary.earnedCount).toBe(2);
    expect(summary.total).toBe(STICKERS.length);
  });
});

describe("renderStickerBook", () => {
  it("renders a tile for every sticker and marks earned vs locked", () => {
    const progress: CategoryCorrect = {
      animals: STICKER_THRESHOLD,
      colors: 2,
    };
    const earned = ["animals" as const];
    const host = mount(renderStickerBook(progress, earned));

    const tiles = host.querySelectorAll(".sticker");
    expect(tiles.length).toBe(STICKERS.length);
    expect(host.querySelectorAll(".sticker--earned")).toHaveLength(1);
    expect(host.querySelectorAll(".sticker--locked")).toHaveLength(
      STICKERS.length - 1,
    );

    // Summary reflects counts
    expect(host.querySelector(".sticker-book-summary")?.textContent).toContain(
      "1 of",
    );
  });

  it("shows progress x/threshold for locked stickers", () => {
    const progress: CategoryCorrect = { colors: 2 };
    const host = mount(renderStickerBook(progress, []));
    const statuses = Array.from(host.querySelectorAll(".sticker-status"))
      .map((el) => el.textContent ?? "");
    expect(statuses).toContain(`2/${STICKER_THRESHOLD}`);
  });

  it("includes a close button", () => {
    const host = mount(renderStickerBook({}, []));
    expect(host.querySelector("[data-close]")).not.toBeNull();
  });
});
