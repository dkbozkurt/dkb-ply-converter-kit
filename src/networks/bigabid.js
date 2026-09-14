// BigaBid — MRAID host (DSP). Luna: single HTML, 5 MB, Store Click API.
// BigaBid's own template wraps creatives with bid-time tracking macros
// (BIGABID_BIDTIMEMACROS) on their side; the creative itself is plain MRAID.

import { mraidTarget } from "./shared/mraid.js";

export default {
  id: "bigabid",
  name: "BigaBid",
  color: "#00A3FF",
  platformIds: ["bigabid"],

  target: mraidTarget({ name: "BigaBid", platformId: "bigabid", zipSuffix: "BigaBid", shape: "single", maxMB: 5 }),
};
