// Appreciate (Triapodi) — MRAID host. Luna: zip file with resources, 4 MB.

import { mraidTarget } from "./shared/mraid.js";

export default {
  id: "appreciate",
  name: "Appreciate",
  color: "#7B61FF",
  platformIds: ["appreciate"],

  target: mraidTarget({
    name: "Appreciate",
    platformId: "appreciate",
    zipSuffix: "Appreciate",
    shape: "zip",
    maxMB: 4,
  }),
};
