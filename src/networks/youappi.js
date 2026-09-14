// YouAppi — MRAID host. Luna: single HTML (5 MB) or zip (10 MB); the single
// HTML form is what Luna exports.

import { mraidTarget } from "./shared/mraid.js";

export default {
  id: "youappi",
  name: "YouAppi",
  color: "#B83B9E",
  platformIds: ["youappi"],

  target: mraidTarget({ name: "YouAppi", platformId: "youappi", zipSuffix: "YouAppi", shape: "single", maxMB: 5 }),
};
