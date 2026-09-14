import { MRAID_STRIP_RULES } from "./shared/mraid.js";

export default {
  id: "unity",
  name: "Unity",
  color: "#E0E4E8",
  platformIds: ["unityads", "unity"],

  source: {
    supported: true,
    // Unity exports are plain MRAID builds; the only reliable Unity-specific
    // marker is the analytics bootstrap that names the network.
    markers: [/window\.pi\.apply\s*\(\s*window\s*,\s*\[\s*"unityads"/],
    strip: [...MRAID_STRIP_RULES],
  },

  target: {
    supported: false,
    hint: "Source only for now",
    platformId: "unityads",
    zipSuffix: "Unity",
  },
};
