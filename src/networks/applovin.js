import { MRAID_STRIP_RULES } from "./shared/mraid.js";

export default {
  id: "applovin",
  name: "AppLovin",
  color: "#2D8CFF",
  platformIds: ["applovin"],

  source: {
    supported: true,
    // Present only in AppLovin exports.
    markers: [/APPLOVIN_ANALYTICS_EVENTS/, /ALPlayableAnalytics/],
    // Inline blocks that make up the AppLovin integration layer.
    strip: [/APPLOVIN_ANALYTICS_EVENTS/, /ALPlayableAnalytics/, ...MRAID_STRIP_RULES],
  },

  target: {
    supported: false,
    hint: "Source only for now",
    platformId: "applovin",
    zipSuffix: "AppLovin",
  },
};
