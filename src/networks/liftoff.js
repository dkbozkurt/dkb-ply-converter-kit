// Liftoff (Liftoff Direct) target.
// Same Adaptive Creative integration as Vungle. Luna's network table lists
// Liftoff as "Zip file with resources, 5 MB", so startup scripts and images
// are externalized next to ad.html, mirroring a native Liftoff export.
import { patchAdaptiveCreative, ADAPTIVE_CREATIVE_VALIDATION } from "./shared/adaptiveCreative.js";

export default {
  id: "liftoff",
  name: "Liftoff",
  color: "#FF6A3D",
  platformIds: ["liftoff"],

  target: {
    supported: true,
    format: "ad.html + resources",
    platformId: "liftoff",
    zipSuffix: "Liftoff",
    packaging: { entryName: "ad.html", externalizeAssets: true, externalizeImages: true },
    validation: ADAPTIVE_CREATIVE_VALIDATION,
    patch: patchAdaptiveCreative,
  },
};
