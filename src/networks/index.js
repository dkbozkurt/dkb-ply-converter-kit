// Network registry. Order here is the display order in the UI.
import applovin from "./applovin.js";
import unity from "./unity.js";
import google from "./google.js";
import meta from "./meta.js";
import liftoff from "./liftoff.js";
import mintegral from "./mintegral.js";
import moloco from "./moloco.js";
import vungle from "./vungle.js";
import tiktok from "./tiktok.js";
import mraid from "./mraid.js";
import adcolony from "./adcolony.js";

export const NETWORKS = [
  applovin,
  unity,
  google,
  meta,
  liftoff,
  mintegral,
  moloco,
  vungle,
  tiktok,
  mraid,
  adcolony,
];

export const NETWORK_BY_ID = Object.fromEntries(NETWORKS.map((n) => [n.id, n]));

/** Networks whose exports the kit can read. */
export const SOURCE_NETWORKS = NETWORKS.filter((n) => n.source && n.source.supported);

/** Networks that appear as target options (supported or not). */
export const TARGET_NETWORKS = NETWORKS.filter((n) => n.target);

/** Networks the kit can currently write. */
export const SUPPORTED_TARGETS = TARGET_NETWORKS.filter((n) => n.target.supported);

/** Map a $environment.targetPlatform value back to a network definition. */
export function networkForPlatform(platformId) {
  if (!platformId) return null;
  return NETWORKS.find((n) => n.platformIds.includes(platformId)) || null;
}
