import { MRAID_STRIP_RULES, mraidTarget } from "./shared/mraid.js";

export default {
  id: "unity",
  name: "Unity",
  color: "#E0E4E8",
  platformIds: ["unityads", "unity"],
  group: "primary",

  source: {
    supported: true,
    // Unity exports are plain MRAID builds; the only reliable Unity-specific
    // marker is the analytics bootstrap that names the network.
    markers: [/window\.pi\.apply\s*\(\s*window\s*,\s*\[\s*"unityads"/],
    strip: [...MRAID_STRIP_RULES],
  },

  // Unity Ads playables are plain MRAID creatives delivered as one html.
  // A loaded Unity build is already correct and is passed through renamed;
  // any other source gets the shared MRAID layer.
  target: {
    ...mraidTarget({
      name: "Unity",
      platformId: "unityads",
      zipSuffix: "Unity",
      shape: "single",
      maxMB: 5,
      validation:
        "Unity output is a single MRAID html: a Unity source is passed through unchanged, other sources get the MRAID layer — verify in Unity's Playable Ad test tool or an MRAID container and confirm the CTA opens the store via mraid.open().",
    }),
    format: "Single .html",
    passthrough: true,
    packaging: { entryName: "index.html", externalizeAssets: false, externalizeImages: false, raw: true },
  },
};
