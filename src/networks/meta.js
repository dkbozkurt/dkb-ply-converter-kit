// Meta (Facebook / Instagram / Audience Network) playable ads target.
//
// Spec — facebook.com/business/help/412951382532338:
//   • single HTML with everything data-URI inlined, or a ZIP with index.html
//     at the root and assets referenced relatively; ≤ 5 MB, ≤ 100 files
//   • must work without mraid.js or similar frameworks
//   • no external network calls (no XMLHttpRequest / fetch to the outside),
//     no dynamic asset loading, no JavaScript redirects
//   • portrait, responsive
//   • CTA → FbPlayableAd.onCTAClick()
//
// There is no SDK to load: Meta's host injects window.FbPlayableAd itself.
// Luna's own table (2 MB single HTML / 5 MB zip) makes the ZIP form the safe
// choice for a Luna export, so startup scripts and images are externalized.

import { createPackageAudit, MB } from "./shared/audit.js";

const LIFECYCLE =
  '<script>window.addEventListener("luna:build",(function(){window.pi&&window.pi.logLoaded(),' +
  'window.dispatchEvent(new Event("luna:start"))}))</script>';

// No window.open fallback on purpose — JS redirects are not allowed on Meta.
const CTA =
  "<script>window.PlayableAdapter.exit=function(){" +
  'window.FbPlayableAd&&"function"==typeof window.FbPlayableAd.onCTAClick?' +
  'window.FbPlayableAd.onCTAClick():console.warn("[playable] FbPlayableAd.onCTAClick is not available")},' +
  'window.addEventListener("luna:build",(()=>{Bridge.ready((()=>{' +
  "Luna.Unity.Playable.InstallFullGame=function(){window.PlayableAdapter.exit()}}))}))</script>";

export default {
  id: "meta",
  name: "Meta",
  color: "#0081FB",
  platformIds: ["facebook", "meta"],
  group: "primary",

  target: {
    supported: true,
    format: "index.html + resources",
    platformId: "facebook",
    zipSuffix: "Meta",
    packaging: { entryName: "index.html", externalizeAssets: true, externalizeImages: true },
    validation:
      "Check Meta output in the Meta Playable Preview tool (developers.facebook.com/tools/playable-preview) — all spec items must be green and the CTA message must appear.",

    patch(html, { log, helpers }) {
      html = helpers.injectBefore(html, "</body>", LIFECYCLE + CTA, { last: true });
      log.step("Wired lifecycle: luna:start on build (no SDK script — Meta injects FbPlayableAd)");
      log.step("Wired CTA → FbPlayableAd.onCTAClick() via PlayableAdapter.exit(), no window.open fallback");
      return html;
    },

    audit: createPackageAudit({ label: "Meta", maxBytes: 5 * MB, maxFiles: 100, forbidMraidScript: true }),
  },
};
