// Image asset extractor + rewriter.
// Walks every <img id="assets/bundles/..." data-src122="..."> tag, decodes
// the base-122 payload to loose bytes, and rewrites the tag to load from a
// relative file path (src="assets/<id>"). Targets that require every asset
// to be referenced by relative path (rather than inlined) opt into this via
// `packaging.externalizeImages`.
//
// The data-src122 value never contains a `"` (it is an escaped byte), so
// `data-src122="([^"]*)"` is always unambiguous. The value CAN contain `>`,
// so we capture the value first and only scan for `>` outside of it.

import { base122Decode } from "./base122.js";
import { htmlUnescape } from "./html.js";

const IMG_TAG_RE = /<img\b([^>]*?)\bdata-src122="([^"]*)"([^>]*)>/g;
const ID_RE = /\bid\s*=\s*"([^"]+)"/;

export function extractAndRewriteImages(html, log) {
  const assets = {};
  let count = 0;

  const next = html.replace(IMG_TAG_RE, function (tag, before, encoded, after) {
    const idMatch = (before + after).match(ID_RE);
    if (!idMatch) return tag; // can't place it without an id — leave untouched
    const id = idMatch[1];
    // base-122 can emit `<` and `>`; the serializer escapes them inside the
    // attribute. We read raw markup, so undo that before decoding.
    assets[id] = base122Decode(htmlUnescape(encoded));
    count++;

    let rebuilt = "<img" + before + after;
    rebuilt = rebuilt.replace(/\s*\bdata-startup-only\b/, "");
    if (/\bsrc\s*=\s*"/.test(rebuilt)) {
      rebuilt = rebuilt.replace(/\bsrc\s*=\s*"[^"]*"/, 'src="assets/' + id + '"');
    } else {
      rebuilt = rebuilt.replace(/<img/, '<img src="assets/' + id + '"');
    }
    if (!/\bstyle\s*=/.test(rebuilt)) rebuilt += ' style="display:none"';
    if (!/\bcrossorigin\s*=/.test(rebuilt)) rebuilt += ' crossorigin=""';
    return rebuilt + ">";
  });

  if (log) {
    if (count) {
      log.step(
        `Extracted ${count} image asset${count === 1 ? "" : "s"} and rewrote <img> tags to relative paths`
      );
    } else {
      log.warn("No data-src122 image assets found in source");
    }
  }
  return { html: next, assets };
}
