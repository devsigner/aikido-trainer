// Horizontal swipe detection: pure, so it can be tested without touch events.
const MIN_DISTANCE = 60; // px travelled horizontally
const MAX_SLOPE = 0.6; // |dy| / |dx| above this is a scroll, not a swipe
const EDGE = 24; // px: a start this close to a screen edge belongs to the native browser gesture
const MAX_DURATION = 600; // ms

// start/end: { x, y, time }. Returns "right", "left" or null.
export function swipeDirection(start, end, screenWidth) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (end.time - start.time > MAX_DURATION) return null;
  if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dy) > Math.abs(dx) * MAX_SLOPE) return null;
  if (start.x < EDGE || start.x > screenWidth - EDGE) return null;
  return dx > 0 ? "right" : "left";
}
