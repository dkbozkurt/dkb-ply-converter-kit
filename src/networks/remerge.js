// Remerge — MRAID host (retargeting DSP). Luna: zip file with resources, 5 MB.
// Remerge's Rich Media guide asks for index.html at the zip root with assets
// referenced relatively, mraid.js included, and everything under 5 MB
// (2.5 MB advised). Their self-hosted template additionally uses a
// {base_url} placeholder and bid-time macros; those are for creatives
// Remerge hosts themselves and are not needed for an uploaded zip.

import { mraidTarget } from "./shared/mraid.js";

export default {
  id: "remerge",
  name: "Remerge",
  color: "#F0506E",
  platformIds: ["remerge"],

  target: mraidTarget({
    name: "Remerge",
    platformId: "remerge",
    zipSuffix: "Remerge",
    shape: "zip",
    maxMB: 5,
  }),
};
