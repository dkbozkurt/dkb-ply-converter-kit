// Generic MRAID target — the IAB standard rather than a specific network.
// Several networks accept plain MRAID playables; the shared MRAID rules in
// ./shared/mraid.js describe the integration blocks such a build carries.

export default {
  id: "mraid",
  name: "MRAID",
  color: "#8FA3B8",
  platformIds: ["mraid"],

  target: {
    supported: false,
    hint: "Coming soon",
    platformId: "mraid",
    zipSuffix: "MRAID",
  },
};
