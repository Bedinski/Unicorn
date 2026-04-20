// jsdom does not implement <canvas>; stub getContext so drawBoard's
// initCanvas path can run silently in tests. Returning null is already
// handled by the production code (it short-circuits).
const proto = (globalThis as typeof globalThis & {
  HTMLCanvasElement?: { prototype: { getContext: unknown } };
}).HTMLCanvasElement?.prototype;
if (proto && typeof proto.getContext !== "function") {
  // leave alone — real canvas support is available
}
if (proto) {
  Object.defineProperty(proto, "getContext", {
    configurable: true,
    value: () => null,
  });
}
