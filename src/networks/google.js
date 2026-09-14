// Google Ads (App campaigns) target.
// Google's playables load ExitApi from googlesyndication and call
// ExitApi.exit() for the CTA. Assets must be referenced by relative path,
// hence externalized scripts + images.

const EXITAPI_SCRIPT =
  '<script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>';

const ORIENTATION_META = '<meta name="ad.orientation" content="portrait,landscape">';

const LIFECYCLE =
  '<script>window.addEventListener("DOMContentLoaded",(()=>{window.devicePixelRatio=2})),' +
  'window.addEventListener("luna:build",(function(){window.pi.logLoaded(),' +
  'window.dispatchEvent(new Event("luna:start"))}))</script>';

const CTA =
  "<script>window.PlayableAdapter.exit=function(){window.ExitApi&&window.ExitApi.exit()}," +
  'window.addEventListener("luna:build",(()=>{Bridge.ready((()=>{' +
  "Luna.Unity.Playable.InstallFullGame=function(){window.PlayableAdapter.exit()}})))}))</script>";

export default {
  id: "google",
  name: "Google",
  color: "#4285F4",
  platformIds: ["google"],

  target: {
    supported: true,
    platformId: "google",
    zipSuffix: "GoogleAds",
    packaging: { externalizeAssets: true, externalizeImages: true },
    validation: "Validate the result in the Google Playable Ad Testing Tool before launch.",

    patch(html, { log, helpers }) {
      let head = "";
      if (!html.includes(ORIENTATION_META)) {
        head += ORIENTATION_META;
        log.step("Added ad.orientation meta");
      }
      if (!/exitapi\.js/.test(html)) {
        head += EXITAPI_SCRIPT;
        log.step("Injected ExitApi SDK into <head>");
      }
      if (head) html = helpers.injectBefore(html, "</head>", head);

      html = helpers.injectBefore(html, "</body>", LIFECYCLE + CTA, { last: true });
      log.step("Wired lifecycle (luna:start on build) and CTA → ExitApi.exit() via PlayableAdapter");
      return html;
    },
  },
};
