// MRAID is the common denominator for several ad networks. Builds that
// target an MRAID network ship the same two integration blocks:
//   1. a viewability/state watcher that drives luna:start / pause / resume
//   2. a CTA handler that routes InstallFullGame through mraid.open()
// Any source network built on MRAID can reuse these strip rules.

export const MRAID_STRIP_RULES = [
  /mraid\.open\s*\(/,
  /mraid\.addEventListener\s*\(\s*["']viewableChange["']/,
  /mraid\.isViewable\s*\(\)/,
];
