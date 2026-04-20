import { describe, expect, it } from "vitest";
import { MAX_LEVEL } from "@/game/levels";
import { renderKitty } from "@/ui/kitty";

function parse(svgString: string): SVGElement {
  const host = document.createElement("div");
  host.innerHTML = svgString;
  const svg = host.querySelector("svg");
  if (!svg) throw new Error("renderKitty did not produce an <svg> root");
  return svg;
}

describe("renderKitty", () => {
  it("always renders an svg with a base body, head, and eyes", () => {
    const svg = parse(renderKitty(1));
    expect(svg.querySelector('[data-part="body"]')).not.toBeNull();
    expect(svg.querySelector('[data-part="head"]')).not.toBeNull();
    expect(svg.querySelector('[data-part="eye-l"]')).not.toBeNull();
    expect(svg.querySelector('[data-part="eye-r"]')).not.toBeNull();
  });

  it("tags the svg with its level", () => {
    for (let lv = 1; lv <= MAX_LEVEL; lv++) {
      const svg = parse(renderKitty(lv));
      expect(svg.getAttribute("data-kitty-level")).toBe(String(lv));
    }
  });

  it("level 1 has none of the magical features", () => {
    const svg = parse(renderKitty(1));
    expect(svg.querySelector('[data-feature="first-sparkle"]')).toBeNull();
    expect(svg.querySelector('[data-feature="collar"]')).toBeNull();
    expect(svg.querySelector('[data-feature="sparkle-aura"]')).toBeNull();
    expect(svg.querySelector('[data-feature="wizard-hat"]')).toBeNull();
    expect(svg.querySelector('[data-feature="glowing-eyes"]')).toBeNull();
    expect(svg.querySelector('[data-feature="fairy-wings"]')).toBeNull();
    expect(svg.querySelector('[data-feature="cosmic-aura"]')).toBeNull();
    expect(svg.querySelector('[data-feature="rainbow-trail"]')).toBeNull();
    expect(svg.querySelector('[data-feature="unicorn-horn"]')).toBeNull();
  });

  it("each level adds its expected feature cumulatively", () => {
    const expectations: Array<[number, string]> = [
      [2, "first-sparkle"],
      [3, "collar"],
      [4, "sparkle-aura"],
      [5, "wizard-hat"],
      [6, "glowing-eyes"],
      [7, "fairy-wings"],
      [9, "cosmic-aura"],
      [10, "rainbow-trail"],
      [10, "unicorn-horn"],
    ];
    for (const [level, feature] of expectations) {
      const svg = parse(renderKitty(level));
      expect(
        svg.querySelector(`[data-feature="${feature}"]`),
        `level ${level} should contain ${feature}`,
      ).not.toBeNull();
    }
  });

  it("level 10 contains the full stack of features (cumulative layering)", () => {
    const svg = parse(renderKitty(10));
    const features = [
      "first-sparkle",
      "collar",
      "sparkle-aura",
      "wizard-hat",
      "glowing-eyes",
      "fairy-wings",
      "cosmic-aura",
      "rainbow-trail",
      "unicorn-horn",
    ];
    for (const f of features) {
      expect(
        svg.querySelector(`[data-feature="${f}"]`),
        `missing ${f} at max level`,
      ).not.toBeNull();
    }
  });

  it("uses rainbow fur from level 8 onward", () => {
    const belowSvg = parse(renderKitty(7));
    const body7 = belowSvg.querySelector('[data-part="body"]');
    expect(body7?.getAttribute("fill")).not.toContain("rainbow-fur");

    const svg8 = parse(renderKitty(8));
    const body8 = svg8.querySelector('[data-part="body"]');
    expect(body8?.getAttribute("fill")).toContain("rainbow-fur");
  });

  it("clamps out-of-range levels", () => {
    const low = parse(renderKitty(-5));
    expect(low.getAttribute("data-kitty-level")).toBe("1");
    const high = parse(renderKitty(42));
    expect(high.getAttribute("data-kitty-level")).toBe(String(MAX_LEVEL));
  });

  it("includes all four face variants so CSS can swap expressions", () => {
    const svg = parse(renderKitty(1));
    for (const name of ["neutral", "happy", "sad", "surprised"]) {
      expect(
        svg.querySelector(`[data-face="${name}"]`),
        `missing data-face=${name}`,
      ).not.toBeNull();
    }
  });

  it("exposes idle-animation targets (tail, body, ears, eye groups)", () => {
    const svg = parse(renderKitty(1));
    for (const part of [
      "tail-group",
      "body-group",
      "ear-l-group",
      "ear-r-group",
      "eye-l-group",
      "eye-r-group",
    ]) {
      expect(
        svg.querySelector(`[data-part="${part}"]`),
        `missing data-part=${part}`,
      ).not.toBeNull();
    }
  });

  it("non-neutral faces start hidden (via CSS class) so only neutral shows by default", () => {
    const svg = parse(renderKitty(1));
    for (const name of ["happy", "sad", "surprised"]) {
      const el = svg.querySelector(`[data-face="${name}"]`);
      expect(el?.classList.contains("face-hidden"), name).toBe(true);
    }
    const neutral = svg.querySelector('[data-face="neutral"]');
    expect(neutral?.classList.contains("face-hidden")).toBe(false);
  });
});
