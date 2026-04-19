const CHEERS = ["Yay!", "Nice!", "Great job!", "Awesome!", "You got it!"];
const ENCOURAGE = [
  "Try again, you got this!",
  "Almost! Let's try again.",
  "No worries, try once more!",
];

function pick(arr: readonly string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function cheerMessage(): string {
  return pick(CHEERS);
}

export function encourageMessage(): string {
  return pick(ENCOURAGE);
}

export function flash(el: Element, className: string, ms = 900): void {
  el.classList.add(className);
  window.setTimeout(() => el.classList.remove(className), ms);
}
