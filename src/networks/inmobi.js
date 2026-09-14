// InMobi — MRAID 3.0 host. Luna: single HTML, 5 MB. InMobi's spec accepts a
// single inlined index.html or a zip with subfolders; forbids external
// network requests and auto-redirects; CTA via mraid.open().

import { mraidTarget } from "./shared/mraid.js";

export default {
  id: "inmobi",
  name: "InMobi",
  color: "#D9232E",
  platformIds: ["inmobi"],

  target: mraidTarget({ name: "InMobi", platformId: "inmobi", zipSuffix: "InMobi", shape: "single", maxMB: 5 }),
};
