// Generic MRAID target — the IAB standard rather than a specific network.
// Luna lists this as "MRAID (generic build) · single HTML · platform-dependent
// size". Use it for any MRAID host that isn't listed separately (Chartboost,
// ironSource / LevelPlay, Smadex, MyTarget, …).

import { mraidTarget } from "./shared/mraid.js";

export default {
  id: "mraid",
  name: "MRAID",
  color: "#8FA3B8",
  platformIds: ["mraid"],

  target: mraidTarget({
    name: "MRAID",
    platformId: "mraid",
    zipSuffix: "MRAID",
    shape: "single",
    // no maxMB: the cap depends on the receiving host
  }),
};
