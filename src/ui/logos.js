// Network logos, inlined as SVG markup so they can be dropped straight into
// the DOM (and greyed out via CSS when a network is disabled).
// Kept separate from the network definitions so the converter core stays
// free of bundler-specific imports and runs in plain node.
import applovin from "../assets/logos/applovin.svg?raw";
import unity from "../assets/logos/unity.svg?raw";
import google from "../assets/logos/google.svg?raw";
import meta from "../assets/logos/meta.svg?raw";
import liftoff from "../assets/logos/liftoff.svg?raw";
import mintegral from "../assets/logos/mintegral.svg?raw";
import moloco from "../assets/logos/moloco.svg?raw";
import vungle from "../assets/logos/vungle.svg?raw";
import tiktok from "../assets/logos/tiktok.svg?raw";
import mraid from "../assets/logos/mraid.svg?raw";
import adcolony from "../assets/logos/adcolony.svg?raw";

const LOGOS = { applovin, unity, google, meta, liftoff, mintegral, moloco, vungle, tiktok, mraid, adcolony };

/** SVG markup for a network id, or a generic placeholder glyph. */
export function logoFor(id) {
  return (
    LOGOS[id] ||
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">' +
      '<rect width="48" height="48" rx="11" fill="currentColor" opacity=".25"/></svg>'
  );
}
