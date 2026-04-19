import { MAX_LEVEL } from "@/game/levels";

/**
 * Render the magical kitty as an SVG string. Later levels layer additional
 * magical elements on top of earlier ones. Each level embeds a
 * `data-kitty-level` attribute and level-specific feature markers
 * (data-feature="hat", "wings", etc.) so tests can assert structure without
 * pixel-snapshotting.
 */
export function renderKitty(level: number): string {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 240 240"
     data-kitty
     data-kitty-level="${clamped}"
     role="img"
     aria-label="Magical kitty at level ${clamped}"
     class="kitty-svg kitty-level-${clamped}">
  <defs>
    <radialGradient id="cosmic-aura-gradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8a2be2" stop-opacity="0.6"/>
      <stop offset="60%" stop-color="#4b0082" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000022" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rainbow-fur" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff5e7e"/>
      <stop offset="20%" stop-color="#ffb347"/>
      <stop offset="40%" stop-color="#ffe066"/>
      <stop offset="60%" stop-color="#6ee7a7"/>
      <stop offset="80%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <linearGradient id="rainbow-trail" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff5e7e" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffe066" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#60a5fa" stop-opacity="0"/>
    </linearGradient>
  </defs>

  ${clamped >= 9 ? cosmicAura() : ""}
  ${clamped >= 10 ? rainbowTrail() : ""}
  ${clamped >= 4 ? sparkleAura() : ""}
  ${clamped >= 7 ? fairyWings() : ""}

  <g data-feature="body">
    ${body(clamped)}
    ${tail(clamped)}
    ${head(clamped)}
  </g>

  ${clamped >= 3 ? collar() : ""}
  ${clamped >= 5 ? wizardHat() : ""}
  ${clamped >= 10 ? unicornHorn() : ""}
  ${clamped >= 2 ? firstSparkle() : ""}
</svg>`.trim();
}

function body(level: number): string {
  const fill = level >= 8 ? "url(#rainbow-fur)" : "#c9c9d1";
  return `
    <ellipse data-part="body" cx="120" cy="160" rx="60" ry="45" fill="${fill}" stroke="#3a3a44" stroke-width="2"/>
    <circle data-part="back-paw-l" cx="80" cy="200" r="10" fill="${fill}" stroke="#3a3a44" stroke-width="2"/>
    <circle data-part="back-paw-r" cx="160" cy="200" r="10" fill="${fill}" stroke="#3a3a44" stroke-width="2"/>
  `;
}

function tail(level: number): string {
  const fill = level >= 8 ? "url(#rainbow-fur)" : "#c9c9d1";
  return `
    <path data-part="tail" d="M178 160 Q210 130 200 100"
          stroke="${fill === "url(#rainbow-fur)" ? "#c084fc" : fill}"
          stroke-width="14" fill="none" stroke-linecap="round"/>
  `;
}

function head(level: number): string {
  const furFill = level >= 8 ? "url(#rainbow-fur)" : "#d4d4dc";
  const eyeInner = level >= 6 ? "#ffe066" : "#222";
  const eyeGlow = level >= 6 ? `<circle cx="100" cy="98" r="7" fill="#fff7cc" opacity="0.55"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="140" cy="98" r="7" fill="#fff7cc" opacity="0.55"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.6s" repeatCount="indefinite"/></circle>` : "";
  const eyeMarker = level >= 6 ? `<g data-feature="glowing-eyes"></g>` : "";

  return `
    <circle data-part="head" cx="120" cy="105" r="50" fill="${furFill}" stroke="#3a3a44" stroke-width="2"/>
    <!-- ears -->
    <polygon data-part="ear-l" points="78,72 94,40 104,78" fill="${furFill}" stroke="#3a3a44" stroke-width="2"/>
    <polygon data-part="ear-r" points="162,72 146,40 136,78" fill="${furFill}" stroke="#3a3a44" stroke-width="2"/>
    <polygon data-part="ear-inner-l" points="86,70 95,52 100,74" fill="#f7b6c2"/>
    <polygon data-part="ear-inner-r" points="154,70 145,52 140,74" fill="#f7b6c2"/>
    <!-- eyes -->
    ${eyeGlow}
    ${eyeMarker}
    <circle data-part="eye-l" cx="100" cy="100" r="5" fill="${eyeInner}"/>
    <circle data-part="eye-r" cx="140" cy="100" r="5" fill="${eyeInner}"/>
    <circle data-part="eye-highlight-l" cx="102" cy="98" r="1.5" fill="#fff"/>
    <circle data-part="eye-highlight-r" cx="142" cy="98" r="1.5" fill="#fff"/>
    <!-- nose + mouth -->
    <polygon data-part="nose" points="117,116 123,116 120,122" fill="#f7709b"/>
    <path data-part="mouth" d="M112 128 Q120 136 128 128" stroke="#3a3a44" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- whiskers -->
    <path d="M75 122 L105 124" stroke="#3a3a44" stroke-width="1.5"/>
    <path d="M75 130 L105 130" stroke="#3a3a44" stroke-width="1.5"/>
    <path d="M165 122 L135 124" stroke="#3a3a44" stroke-width="1.5"/>
    <path d="M165 130 L135 130" stroke="#3a3a44" stroke-width="1.5"/>
  `;
}

function firstSparkle(): string {
  return `
    <g data-feature="first-sparkle">
      <polygon points="170,55 173,63 181,63 175,68 177,76 170,71 163,76 165,68 159,63 167,63"
               fill="#ffd93d" stroke="#b88a00" stroke-width="1"/>
    </g>
  `;
}

function collar(): string {
  return `
    <g data-feature="collar">
      <ellipse cx="120" cy="148" rx="40" ry="8" fill="#7c3aed" stroke="#3a003a" stroke-width="2"/>
      <circle cx="120" cy="152" r="6" fill="#ec4899" stroke="#3a003a" stroke-width="1.5"/>
      <circle cx="120" cy="151" r="2" fill="#fff0fa"/>
    </g>
  `;
}

function sparkleAura(): string {
  const stars: string[] = [];
  const positions = [
    [40, 90], [200, 90], [40, 180], [200, 180],
    [120, 30], [60, 40], [180, 40], [120, 225],
  ];
  for (const [cx, cy] of positions) {
    stars.push(
      `<polygon points="${cx},${cy - 6} ${cx + 1.5},${cy - 2} ${cx + 6},${cy} ${cx + 1.5},${cy + 2} ${cx},${cy + 6} ${cx - 1.5},${cy + 2} ${cx - 6},${cy} ${cx - 1.5},${cy - 2}" fill="#ffe066" opacity="0.85"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></polygon>`,
    );
  }
  return `<g data-feature="sparkle-aura">${stars.join("")}</g>`;
}

function wizardHat(): string {
  return `
    <g data-feature="wizard-hat">
      <polygon points="120,10 95,70 145,70" fill="#4c1d95" stroke="#1e0a3c" stroke-width="2"/>
      <ellipse cx="120" cy="70" rx="30" ry="6" fill="#6d28d9" stroke="#1e0a3c" stroke-width="2"/>
      <polygon points="110,38 112,43 117,43 113,46 114,51 110,48 106,51 107,46 103,43 108,43" fill="#ffe066"/>
      <polygon points="128,52 130,57 135,57 131,60 132,65 128,62 124,65 125,60 121,57 126,57" fill="#ffe066"/>
    </g>
  `;
}

function fairyWings(): string {
  return `
    <g data-feature="fairy-wings" opacity="0.8">
      <path d="M60 150 Q20 120 30 180 Q55 175 65 165 Z"
            fill="#bae6fd" stroke="#38bdf8" stroke-width="2"/>
      <path d="M180 150 Q220 120 210 180 Q185 175 175 165 Z"
            fill="#bae6fd" stroke="#38bdf8" stroke-width="2"/>
      <path d="M60 150 Q35 140 40 170" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.6"/>
      <path d="M180 150 Q205 140 200 170" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.6"/>
    </g>
  `;
}

function cosmicAura(): string {
  return `
    <g data-feature="cosmic-aura">
      <circle cx="120" cy="130" r="115" fill="url(#cosmic-aura-gradient)"/>
      <g opacity="0.9">
        <circle cx="30" cy="30" r="1.5" fill="#fff"/>
        <circle cx="210" cy="40" r="1" fill="#fff"/>
        <circle cx="220" cy="180" r="1.5" fill="#fff"/>
        <circle cx="20" cy="200" r="1" fill="#fff"/>
        <circle cx="190" cy="220" r="1.2" fill="#fff"/>
        <circle cx="50" cy="220" r="1" fill="#fff"/>
        <animateTransform attributeName="transform" type="rotate"
                          from="0 120 130" to="360 120 130"
                          dur="30s" repeatCount="indefinite"/>
      </g>
    </g>
  `;
}

function rainbowTrail(): string {
  return `
    <g data-feature="rainbow-trail">
      <ellipse cx="120" cy="225" rx="95" ry="8" fill="url(#rainbow-trail)">
        <animate attributeName="rx" values="85;100;85" dur="2.5s" repeatCount="indefinite"/>
      </ellipse>
    </g>
  `;
}

function unicornHorn(): string {
  return `
    <g data-feature="unicorn-horn">
      <polygon points="120,18 113,60 127,60" fill="#fde68a" stroke="#b45309" stroke-width="1.5"/>
      <path d="M115 55 L125 45 M114 48 L124 38 M117 60 L127 52" stroke="#b45309" stroke-width="1" fill="none"/>
    </g>
  `;
}
