import { MRAID_STRIP_RULES, patchMraid } from "./shared/mraid.js";
import { createPackageAudit, MB } from "./shared/audit.js";

// AppLovin = MRAID + the ALPlayableAnalytics event stream (LOADING, LOADED,
// DISPLAYED, COMPLETED, CTA_CLICKED). Modelled on Luna's own AppLovin export.
const ANALYTICS =
  "<script>" +
  "!function(){var n=window.innerWidth,e=window.innerHeight;" +
  'window.addEventListener("resize",(function(){n=window.innerWidth,e=window.innerHeight})),' +
  'setInterval((function(){n===window.innerWidth&&e===window.innerHeight||window.dispatchEvent(new Event("resize"))}),300)}(),' +
  'window.APPLOVIN_ANALYTICS_EVENTS={LOADING:"LOADING",LOADED:"LOADED",DISPLAYED:"DISPLAYED",COMPLETED:"COMPLETED",CTA_CLICKED:"CTA_CLICKED",ENDCARD_SHOWN:"ENDCARD_SHOWN"},' +
  "window.callAnalyticsEvent=function(n){void 0!==window.ALPlayableAnalytics&&window.ALPlayableAnalytics.trackEvent(n)}," +
  'window.addEventListener("luna:starting",(function(){window.callAnalyticsEvent(window.APPLOVIN_ANALYTICS_EVENTS.LOADING),window.audioVolumeToggle&&window.audioVolumeToggle(!0)})),' +
  'window.addEventListener("luna:started",(function(){window.callAnalyticsEvent(window.APPLOVIN_ANALYTICS_EVENTS.LOADED);' +
  'var n=function(){["mousemove","scroll","keydown","click","touchstart","pointerdown"].forEach((function(e){document.body.removeEventListener(e,n)})),window.dispatchEvent(new Event("luna:unsafe:unmute"))};' +
  '["mousemove","scroll","keydown","click","touchstart","pointerdown"].forEach((function(e){document.body.addEventListener(e,n)}))})),' +
  'window.addEventListener("luna:ready",(function(){window.callAnalyticsEvent(window.APPLOVIN_ANALYTICS_EVENTS.DISPLAYED)})),' +
  'window.addEventListener("luna:ended",(function(){window.callAnalyticsEvent(window.APPLOVIN_ANALYTICS_EVENTS.COMPLETED)})),' +
  // Wrap the MRAID CTA installed by patchMraid so every exit reports CTA_CLICKED first.
  "!function(){var A=window.PlayableAdapter,e=A.exit;A.exit=function(n,i){window.callAnalyticsEvent(window.APPLOVIN_ANALYTICS_EVENTS.CTA_CLICKED),e.call(A,n,i)}}()" +
  "</script>";

export default {
  id: "applovin",
  name: "AppLovin",
  color: "#2D8CFF",
  platformIds: ["applovin"],
  group: "primary",

  source: {
    supported: true,
    // Present only in AppLovin exports.
    markers: [/APPLOVIN_ANALYTICS_EVENTS/, /ALPlayableAnalytics/],
    // Inline blocks that make up the AppLovin integration layer.
    strip: [/APPLOVIN_ANALYTICS_EVENTS/, /ALPlayableAnalytics/, ...MRAID_STRIP_RULES],
  },

  target: {
    supported: true,
    format: "Single .html",
    platformId: "applovin",
    zipSuffix: "AppLovin",
    // A loaded AppLovin build is already correct: hand it back renamed.
    passthrough: true,
    packaging: { entryName: "index.html", externalizeAssets: false, externalizeImages: false, raw: true },
    validation:
      "AppLovin output is a single html: an AppLovin source is passed through unchanged, other sources get the MRAID + ALPlayableAnalytics layer — verify those in AppLovin's Playable Preview (p.applov.in/playablePreview).",

    patch(html, ctx) {
      html = patchMraid(html, ctx);
      html = ctx.helpers.injectBefore(html, "</body>", ANALYTICS, { last: true });
      ctx.log.step("Wired ALPlayableAnalytics: LOADING / LOADED / DISPLAYED / COMPLETED on luna events, CTA_CLICKED before mraid.open()");
      return html;
    },

    audit: createPackageAudit({ label: "AppLovin", maxBytes: 5 * MB, allowWindowOpen: true }),
  },
};
