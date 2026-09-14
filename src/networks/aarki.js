// Aarki — MRAID host. Luna: single HTML, 5 MB, Store Click API.

import { mraidTarget } from "./shared/mraid.js";

export default {
  id: "aarki",
  name: "Aarki",
  color: "#E4322B",
  platformIds: ["aarki"],

  target: mraidTarget({ name: "Aarki", platformId: "aarki", zipSuffix: "Aarki", shape: "single", maxMB: 5 }),
};
