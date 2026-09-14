// AdColony — MRAID 2.0 host. Luna: single HTML, 2 MB cap (the tightest of
// the MRAID networks; a full Luna export usually exceeds it, so the audit
// will flag the size and the creative may need asset trimming upstream).

import { mraidTarget } from "./shared/mraid.js";

export default {
  id: "adcolony",
  name: "AdColony",
  color: "#E0457B",
  platformIds: ["adcolony"],

  target: mraidTarget({
    name: "AdColony",
    platformId: "adcolony",
    zipSuffix: "AdColony",
    shape: "single",
    maxMB: 2,
  }),
};
