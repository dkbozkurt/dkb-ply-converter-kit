// Network registry. Order here is the display order in the UI, within each group.
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
import aarki from "./aarki.js";
import appreciate from "./appreciate.js";
import remerge from "./remerge.js";
import tencent from "./tencent.js";
import adikteev from "./adikteev.js";
import bigabid from "./bigabid.js";
import inmobi from "./inmobi.js";
import kayzen from "./kayzen.js";
import snapchat from "./snapchat.js";
import thetradedesk from "./thetradedesk.js";
import youappi from "./youappi.js";

export const NETWORKS = [
  // group: "primary" — shown first
  applovin,
  unity,
  google,
  meta,
  liftoff,
  mintegral,
  // group: "others"
  moloco,
  vungle,
  tiktok,
  mraid,
  adcolony,
  aarki,
  appreciate,
  remerge,
  tencent,
  adikteev,
  bigabid,
  inmobi,
  kayzen,
  snapchat,
  thetradedesk,
  youappi,
];

export const NETWORK_BY_ID = Object.fromEntries(NETWORKS.map((n) => [n.id, n]));

/** Networks whose exports the kit can read. */
export const SOURCE_NETWORKS = NETWORKS.filter((n) => n.source && n.source.supported);

/** Networks that appear as target options (supported or not). */
export const TARGET_NETWORKS = NETWORKS.filter((n) => n.target);

/** Networks the kit can currently write. */
export const SUPPORTED_TARGETS = TARGET_NETWORKS.filter((n) => n.target.supported);

/**
 * Target picker sections. A network opts into the first section with
 * `group: "primary"`; everything else lands under "Others".
 */
export const TARGET_GROUPS = [
  { id: "primary", title: null, networks: TARGET_NETWORKS.filter((n) => n.group === "primary") },
  { id: "others", title: "Others", networks: TARGET_NETWORKS.filter((n) => n.group !== "primary") },
].filter((g) => g.networks.length);

/** Map a $environment.targetPlatform value back to a network definition. */
export function networkForPlatform(platformId) {
  if (!platformId) return null;
  return NETWORKS.find((n) => n.platformIds.includes(platformId)) || null;
}
