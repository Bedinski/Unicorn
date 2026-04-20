import { MAX_LEVEL } from "@/game/levels";

/**
 * Render the magical kitty as an SVG string. Four face variants (neutral,
 * happy, sad, surprised) coexist in the output; CSS on the parent
 * kitty-stage reveals whichever matches the current reaction class. Idle
 * animations (blink, breathing, tail sway, ear twitch) target sub-parts by
 * data-part so they can all run in parallel.
 *
 * Level composition adds cumulative magical features:
 *   2 first-sparkle, 3 collar, 4 sparkle-aura, 5 wizard-hat,
 *   6 glowing-eyes, 7 fairy-wings, 8 rainbow-fur, 9 cosmic-aura,
 *   10 unicorn-horn + rainbow-trail.
 */
export function renderKitty(level: number): string {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  const bodyFill = clamped >= 8 ? "url(#rainbow-fur)" : "#d7d4e0";
  const bodyStroke = "#3a3a44";

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
      <stop offset="0%"   stop-color="#ff8fb5"/>
      <stop offset="25%"  stop-color="#ffd27a"/>
      <stop offset="50%"  stop-color="#b8f6c0"/>
      <stop offset="75%"  stop-color="#9cd7ff"/>
      <stop offset="100%" stop-color="#d0a6ff"/>
    </linearGradient>
    <linearGradient id="rainbow-trail" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="#ff5e7e" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffe066" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#60a5fa" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="fur-shading" cx="35%" cy="30%" r="70%">
      <stop offset="0%"  stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="eye-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#fff3a8" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="#ffd166" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffd166" stop-opacity="0"/>
    </radialGradient>
  </defs>

  ${clamped >= 9 ? cosmicAura() : ""}
  ${clamped >= 10 ? rainbowTrail() : ""}
  ${clamped >= 4 ? sparkleAura() : ""}
  ${clamped >= 7 ? fairyWings() : ""}

  <!-- back paws (sit behind body) -->
  <ellipse data-part="back-paw-l" cx="86" cy="205" rx="14" ry="9"
           fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="2"/>
  <ellipse data-part="back-paw-r" cx="154" cy="205" rx="14" ry="9"
           fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="2"/>

  <!-- tail (behind body) -->
  <g data-part="tail-group">
    <path data-part="tail"
          d="M 170 180
             C 205 180, 220 145, 210 110
             C 204 95, 195 92, 192 104
             C 198 125, 190 150, 168 165 Z"
          fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="2"/>
  </g>

  <!-- body -->
  <g data-part="body-group">
    <path data-part="body"
          d="M 64 175
             C 64 135, 92 120, 120 120
             C 148 120, 176 135, 176 175
             C 176 210, 152 220, 120 220
             C 88 220, 64 210, 64 175 Z"
          fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="2"/>
    <path d="M 70 155
             C 72 140, 94 132, 120 132
             C 146 132, 168 140, 170 155"
          fill="url(#fur-shading)" />
    <!-- belly patch -->
    <ellipse cx="120" cy="185" rx="28" ry="22" fill="#fff" opacity="0.75"/>
  </g>

  <!-- front paws (on top of body) -->
  <ellipse data-part="front-paw-l" cx="100" cy="217" rx="11" ry="8"
           fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="2"/>
  <ellipse data-part="front-paw-r" cx="140" cy="217" rx="11" ry="8"
           fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="2"/>
  <ellipse cx="100" cy="219" rx="6" ry="3.5" fill="#fbe3ea"/>
  <ellipse cx="140" cy="219" rx="6" ry="3.5" fill="#fbe3ea"/>

  <!-- ears -->
  <g data-part="ear-l-group">
    <path data-part="ear-l"
          d="M 72 88 Q 76 44 104 66 Q 98 82 84 92 Z"
          fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="2"/>
    <path d="M 82 82 Q 87 58 99 70 Q 94 80 84 88 Z"
          fill="#f7b6c2"/>
  </g>
  <g data-part="ear-r-group">
    <path data-part="ear-r"
          d="M 168 88 Q 164 44 136 66 Q 142 82 156 92 Z"
          fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="2"/>
    <path d="M 158 82 Q 153 58 141 70 Q 146 80 156 88 Z"
          fill="#f7b6c2"/>
  </g>

  <!-- head (with subtle cheek bumps) -->
  <g data-part="head-group">
    <path data-part="head"
          d="M 70 110
             C 70 78, 88 62, 120 62
             C 152 62, 170 78, 170 110
             C 170 140, 150 158, 120 158
             C 90 158, 70 140, 70 110 Z"
          fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="2"/>
    <path d="M 78 98
             C 82 82, 106 78, 118 84"
          fill="url(#fur-shading)"/>
  </g>

  ${clamped >= 6 ? eyeGlow() : ""}

  ${faceNeutral()}
  ${faceHappy()}
  ${faceSad()}
  ${faceSurprised()}

  ${clamped >= 3 ? collar() : ""}
  ${clamped >= 5 ? wizardHat() : ""}
  ${clamped >= 10 ? unicornHorn() : ""}
  ${clamped >= 2 ? firstSparkle() : ""}
</svg>`.trim();
}

// ───── Face variants ─────

function faceNeutral(): string {
  return `
  <g data-face="neutral">
    ${cheekBlushes()}
    ${whiskers()}
    <!-- eyes: round with highlight -->
    <g data-part="eye-l-group">
      <ellipse data-part="eye-l" cx="100" cy="108" rx="6.5" ry="8" fill="#2d1b2a"/>
      <circle cx="102" cy="105" r="2" fill="#fff"/>
      <circle cx="98" cy="111" r="1" fill="#fff" opacity="0.7"/>
    </g>
    <g data-part="eye-r-group">
      <ellipse data-part="eye-r" cx="140" cy="108" rx="6.5" ry="8" fill="#2d1b2a"/>
      <circle cx="142" cy="105" r="2" fill="#fff"/>
      <circle cx="138" cy="111" r="1" fill="#fff" opacity="0.7"/>
    </g>
    ${nose()}
    <!-- little smile -->
    <path d="M 110 132 Q 115 138 120 134 Q 125 138 130 132"
          stroke="#3a2a3a" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>`;
}

function faceHappy(): string {
  return `
  <g data-face="happy" class="face-hidden">
    ${cheekBlushes("#ffb5c8")}
    ${whiskers()}
    <!-- closed smiling eyes (^ ^) -->
    <path d="M 93 107 Q 100 100 107 107" stroke="#2d1b2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M 133 107 Q 140 100 147 107" stroke="#2d1b2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${nose()}
    <!-- open happy smile -->
    <path d="M 105 130 Q 120 146 135 130" stroke="#3a2a3a" stroke-width="2" fill="#f7709b" stroke-linecap="round"/>
    <path d="M 108 132 Q 120 143 132 132 Z" fill="#ff8fa3" opacity="0.6"/>
  </g>`;
}

function faceSad(): string {
  return `
  <g data-face="sad" class="face-hidden">
    ${cheekBlushes("#c8b5d2", 0.55)}
    ${whiskers(0.5)}
    <!-- worried brows -->
    <path d="M 90 94 L 108 100" stroke="#3a2a3a" stroke-width="2" stroke-linecap="round"/>
    <path d="M 150 94 L 132 100" stroke="#3a2a3a" stroke-width="2" stroke-linecap="round"/>
    <!-- small oval eyes looking down-ish -->
    <ellipse cx="100" cy="112" rx="5" ry="6" fill="#2d1b2a"/>
    <ellipse cx="140" cy="112" rx="5" ry="6" fill="#2d1b2a"/>
    <circle cx="100" cy="114" r="1.4" fill="#fff"/>
    <circle cx="140" cy="114" r="1.4" fill="#fff"/>
    ${nose()}
    <!-- slight frown -->
    <path d="M 110 138 Q 120 132 130 138"
          stroke="#3a2a3a" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>`;
}

function faceSurprised(): string {
  return `
  <g data-face="surprised" class="face-hidden">
    ${cheekBlushes("#ffd0e0")}
    ${whiskers()}
    <!-- big round eyes -->
    <circle cx="100" cy="108" r="9" fill="#fff" stroke="#2d1b2a" stroke-width="2"/>
    <circle cx="140" cy="108" r="9" fill="#fff" stroke="#2d1b2a" stroke-width="2"/>
    <circle cx="100" cy="108" r="4.5" fill="#2d1b2a"/>
    <circle cx="140" cy="108" r="4.5" fill="#2d1b2a"/>
    <circle cx="102" cy="106" r="1.6" fill="#fff"/>
    <circle cx="142" cy="106" r="1.6" fill="#fff"/>
    ${nose()}
    <!-- O mouth -->
    <ellipse cx="120" cy="136" rx="5" ry="7" fill="#3a2a3a"/>
    <ellipse cx="120" cy="136" rx="3" ry="4.5" fill="#ff8fa3"/>
  </g>`;
}

function cheekBlushes(color = "#ffc1d2", opacity = 0.75): string {
  return `
  <ellipse cx="88" cy="128" rx="8" ry="5" fill="${color}" opacity="${opacity}"/>
  <ellipse cx="152" cy="128" rx="8" ry="5" fill="${color}" opacity="${opacity}"/>`;
}

function whiskers(opacity = 0.85): string {
  return `
  <g stroke="#3a2a3a" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="${opacity}">
    <path d="M 62 122 Q 76 122 88 124"/>
    <path d="M 62 128 Q 76 130 88 130"/>
    <path d="M 66 136 Q 78 134 90 134"/>
    <path d="M 178 122 Q 164 122 152 124"/>
    <path d="M 178 128 Q 164 130 152 130"/>
    <path d="M 174 136 Q 162 134 150 134"/>
  </g>`;
}

function nose(): string {
  return `
  <path data-part="nose"
        d="M 115 120 Q 120 118 125 120 Q 125 125 120 128 Q 115 125 115 120 Z"
        fill="#f7709b" stroke="#a84a6a" stroke-width="1"/>`;
}

// ───── Level overlays ─────

function eyeGlow(): string {
  return `
  <g data-feature="glowing-eyes" pointer-events="none">
    <circle cx="100" cy="108" r="14" fill="url(#eye-glow)">
      <animate attributeName="opacity" values="0.55;1;0.55" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="140" cy="108" r="14" fill="url(#eye-glow)">
      <animate attributeName="opacity" values="0.55;1;0.55" dur="1.8s" repeatCount="indefinite"/>
    </circle>
  </g>`;
}

function firstSparkle(): string {
  return `
  <g data-feature="first-sparkle">
    <polygon points="175,52 178,60 186,60 180,65 182,73 175,68 168,73 170,65 164,60 172,60"
             fill="#ffd93d" stroke="#b88a00" stroke-width="1"/>
  </g>`;
}

function collar(): string {
  return `
  <g data-feature="collar">
    <ellipse cx="120" cy="158" rx="40" ry="8" fill="#7c3aed" stroke="#3a003a" stroke-width="2"/>
    <circle cx="120" cy="162" r="7" fill="#ec4899" stroke="#3a003a" stroke-width="1.5"/>
    <circle cx="120" cy="161" r="2.5" fill="#fff0fa"/>
  </g>`;
}

function sparkleAura(): string {
  const positions: Array<[number, number]> = [
    [40, 90], [200, 90], [40, 180], [200, 180],
    [120, 24], [60, 40], [180, 40], [120, 226],
  ];
  const stars = positions.map(([cx, cy]) =>
    `<polygon points="${cx},${cy - 6} ${cx + 1.5},${cy - 2} ${cx + 6},${cy} ${cx + 1.5},${cy + 2} ${cx},${cy + 6} ${cx - 1.5},${cy + 2} ${cx - 6},${cy} ${cx - 1.5},${cy - 2}" fill="#ffe066" opacity="0.85"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></polygon>`,
  ).join("");
  return `<g data-feature="sparkle-aura">${stars}</g>`;
}

function wizardHat(): string {
  return `
  <g data-feature="wizard-hat">
    <polygon points="120,6 94,66 146,66" fill="#4c1d95" stroke="#1e0a3c" stroke-width="2"/>
    <ellipse cx="120" cy="66" rx="32" ry="6" fill="#6d28d9" stroke="#1e0a3c" stroke-width="2"/>
    <polygon points="110,34 112,40 118,40 113,44 115,50 110,46 105,50 107,44 102,40 108,40" fill="#ffe066"/>
    <polygon points="128,48 130,54 136,54 131,58 133,64 128,60 123,64 125,58 120,54 126,54" fill="#ffe066"/>
  </g>`;
}

function fairyWings(): string {
  return `
  <g data-feature="fairy-wings" opacity="0.85">
    <path d="M 60 160 Q 18 128 30 188 Q 56 183 66 172 Z"
          fill="#bae6fd" stroke="#38bdf8" stroke-width="2"/>
    <path d="M 180 160 Q 222 128 210 188 Q 184 183 174 172 Z"
          fill="#bae6fd" stroke="#38bdf8" stroke-width="2"/>
    <path d="M 60 160 Q 35 148 40 178" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.6"/>
    <path d="M 180 160 Q 205 148 200 178" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.6"/>
  </g>`;
}

function cosmicAura(): string {
  return `
  <g data-feature="cosmic-aura">
    <circle cx="120" cy="130" r="118" fill="url(#cosmic-aura-gradient)"/>
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
  </g>`;
}

function rainbowTrail(): string {
  return `
  <g data-feature="rainbow-trail">
    <ellipse cx="120" cy="228" rx="95" ry="7" fill="url(#rainbow-trail)">
      <animate attributeName="rx" values="85;102;85" dur="2.5s" repeatCount="indefinite"/>
    </ellipse>
  </g>`;
}

function unicornHorn(): string {
  return `
  <g data-feature="unicorn-horn">
    <polygon points="120,14 113,58 127,58" fill="#fde68a" stroke="#b45309" stroke-width="1.5"/>
    <path d="M 115 52 L 125 42 M 114 46 L 124 36 M 117 56 L 127 48"
          stroke="#b45309" stroke-width="1" fill="none"/>
  </g>`;
}
