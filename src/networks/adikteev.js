// Adikteev — MRAID host (DSP). Luna: single HTML, 5 MB, Store Click API.
// Adikteev's programmatic template can additionally carry bid-time macros
// (AK_CLICK_DESTINATION_URL / AK_CLICK_PIXEL_URL); those are added by their
// ad server, not by the creative, so the plain MRAID build is what to upload.

import { mraidTarget } from "./shared/mraid.js";

export default {
  id: "adikteev",
  name: "Adikteev",
  color: "#F5A524",
  platformIds: ["adikteev"],

  target: mraidTarget({ name: "Adikteev", platformId: "adikteev", zipSuffix: "Adikteev", shape: "single", maxMB: 5 }),
};
