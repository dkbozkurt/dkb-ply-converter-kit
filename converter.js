// Playable ad network converter.
// Takes an exported playable (currently AppLovin) and rewrites only the
// ad-network integration layer to target another network (currently Google Ads),
// leaving the game core, scaffold and assets untouched.

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PlayableConverter = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function scanScripts(html) {
    const blocks = [];
    const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html))) {
      const attrs = m[1].trim();
      blocks.push({
        start: m.index,
        end: m.index + m[0].length,
        attrs,
        body: m[2],
        external: /\bsrc\s*=/.test(attrs),
      });
    }
    return blocks;
  }

  // --- Dependency analyzer -------------------------------------------------
  // Classifies an inline script by what it does, not by where it sits.

  const NETWORK_RULES = {
    applovin: [
      /APPLOVIN_ANALYTICS_EVENTS/,
      /ALPlayableAnalytics/,
      /mraid\.open\s*\(/,
      /mraid\.addEventListener\s*\(\s*["']viewableChange["']/,
      /mraid\.isViewable\s*\(\)/,
    ],
  };

  function detectNetwork(html) {
    for (const network in NETWORK_RULES) {
      if (NETWORK_RULES[network].some((re) => re.test(html))) return network;
    }
    return "unknown";
  }

  function isNetworkBlock(body, network) {
    const rules = NETWORK_RULES[network];
    return !!rules && rules.some((re) => re.test(body));
  }

  function assetKind(attrs, body) {
    if (!/data-startup-only/.test(attrs)) return null;
    if (!/_compressedAssets/.test(body)) return null;
    if (/^\s*window\.jsons\s*=/.test(body)) return "jsons";
    if (/^\s*window\.blobs\s*=/.test(body)) return "blobs";
    if (/decompress(String|ArrayBuffer)\s*\(/.test(body)) return "scripts";
    return null;
  }

  function analyze(html) {
    const network = detectNetwork(html);
    const scripts = scanScripts(html);
    const networkBlocks = [];
    const assetBlocks = [];
    for (const s of scripts) {
      if (s.external) continue;
      if (isNetworkBlock(s.body, network)) networkBlocks.push(s);
      else {
        const kind = assetKind(s.attrs, s.body);
        if (kind) assetBlocks.push(Object.assign({ kind }, s));
      }
    }
    return { network, scripts, networkBlocks, assetBlocks };
  }

  // --- Google Ads adapter --------------------------------------------------
  // The neutral PlayableAdapter shim is the intermediate layer every target
  // wires into. Google's CTA maps to ExitApi.exit().

  const GOOGLE_EXITAPI =
    '<script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>';

  const GOOGLE_ORIENTATION_META =
    '<meta name="ad.orientation" content="portrait,landscape">';

  const PLAYABLE_ADAPTER_SHIM =
    '<script>window.PlayableAdapter=window.PlayableAdapter||{' +
    "ready(){},complete(){},trackEvent(){},exit(){}};</script>";

  const GOOGLE_LIFECYCLE =
    '<script>window.addEventListener("DOMContentLoaded",(()=>{window.devicePixelRatio=2})),' +
    'window.addEventListener("luna:build",(function(){window.pi.logLoaded(),' +
    'window.dispatchEvent(new Event("luna:start"))}))</script>';

  const GOOGLE_CTA =
    '<script>window.PlayableAdapter.exit=function(){window.ExitApi&&window.ExitApi.exit()},' +
    'window.addEventListener("luna:build",(()=>{Bridge.ready((()=>{' +
    "Luna.Unity.Playable.InstallFullGame=function(){window.PlayableAdapter.exit()}})))}))</script>";

  function patchHead(html, log) {
    const close = html.indexOf("</head>");
    if (close < 0) throw new Error("No </head> found in entry point");
    let inject = "";
    if (!html.includes(GOOGLE_ORIENTATION_META)) {
      inject += GOOGLE_ORIENTATION_META;
      log.push("Added ad.orientation meta");
    }
    if (!/exitapi\.js/.test(html)) {
      inject += GOOGLE_EXITAPI;
      log.push("Injected Google exitapi.js into <head>");
    }
    return html.slice(0, close) + inject + html.slice(close);
  }

  function patchEnvironment(html, network, log) {
    const next = html.replace(
      /targetPlatform:\s*"[^"]*"/,
      'targetPlatform:"google"'
    );
    if (next !== html) log.push('Set targetPlatform "' + network + '" \u2192 "google"');
    return next;
  }

  function externalize(blocks, log) {
    const files = {};
    const edits = [];
    for (const b of blocks) {
      files["assets/" + b.kind + ".js"] = b.body;
      const tag =
        '<script src="assets/' + b.kind + '.js" defer data-startup-only></script>';
      edits.push({ start: b.start, end: b.end, text: tag });
    }
    if (blocks.length)
      log.push("Externalized " + blocks.length + " asset blocks into assets/");
    return { files, edits };
  }

  function applyEdits(html, edits) {
    edits.sort((a, b) => b.start - a.start);
    for (const e of edits) html = html.slice(0, e.start) + e.text + html.slice(e.end);
    return html;
  }

  function convertToGoogleAds(html, options) {
    const opts = options || {};
    const log = [];
    const info = analyze(html);
    if (info.network === "unknown")
      log.push("No known ad-network markers found; applying Google layer only");

    const edits = info.networkBlocks.map((b) => ({ start: b.start, end: b.end, text: "" }));
    log.push("Removed " + info.networkBlocks.length + " " + info.network + " network blocks");

    let files = {};
    if (opts.externalizeAssets !== false) {
      const ext = externalize(info.assetBlocks, log);
      files = ext.files;
      edits.push(...ext.edits);
    }

    html = applyEdits(html, edits);
    html = patchHead(html, log);
    html = patchEnvironment(html, info.network, log);

    const bodyClose = html.lastIndexOf("</body>");
    if (bodyClose < 0) throw new Error("No </body> found in entry point");
    const inject = PLAYABLE_ADAPTER_SHIM + GOOGLE_LIFECYCLE + GOOGLE_CTA;
    html = html.slice(0, bodyClose) + inject + html.slice(bodyClose);
    log.push("Wired CTA to ExitApi.exit() via PlayableAdapter");

    return { html, files, source: info.network, log };
  }

  // --- base-122 decoder ----------------------------------------------------
  // Luna embeds each image as a base-122 string in the <img data-src122="...">
  // attribute. base-122 (Kevin Albertson's scheme) packs 7 bits per char and
  // escapes the 6 bytes that are unsafe in HTML/JS string contexts
  // [0x00, 0x0a, 0x0d, 0x22(") , 0x26(&), 0x5c(\)] into two-byte UTF-8
  // sequences. Decoding yields the raw PNG/JPEG bytes directly — no Brotli,
  // no game boot. This mirrors Luna's own window._base122ToArrayBuffer
  // bit-for-bit (verified byte-exact against a known-good Google Ads export).

  const B122_ILLEGAL = [0, 10, 13, 34, 38, 92];

  function base122Decode(str) {
    // Upper bound on output size, trimmed to the real length at the end.
    // Each char yields up to 14 bits (an escaped illegal byte + 7 data bits),
    // i.e. up to 1.75 bytes per char — matching Luna's own 1.75*len sizing.
    const out = new Uint8Array(((str.length * 7) >> 2) + 8);
    let curByte = 0,
      bitOfByte = 0,
      n = 0;
    function push7(seven) {
      seven = seven << 1;
      curByte |= seven >>> bitOfByte;
      bitOfByte += 7;
      if (bitOfByte >= 8) {
        out[n++] = curByte;
        bitOfByte -= 8;
        curByte = (seven << (7 - bitOfByte)) & 255;
      }
    }
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c > 127) {
        const idx = (c >>> 8) & 7;
        if (idx !== 7) push7(B122_ILLEGAL[idx]);
        push7(c & 127);
      } else {
        push7(c);
      }
    }
    return out.subarray(0, n);
  }

  // --- Image asset extractor + rewriter ------------------------------------
  // Walks every <img id="assets/bundles/..." data-src122="..."> tag, decodes
  // the base-122 payload to loose bytes, and rewrites the tag to load from a
  // relative file path (src="assets/<id>") — matching Google's requirement
  // that all assets be referenced by relative path, and matching the layout
  // of a Luna-produced Google Ads export.
  //
  // The data-src122 value never contains a `"` (it is an escaped byte), so
  // `data-src122="([^"]*)"` is always unambiguous. The value CAN contain `>`,
  // so we capture the value first and only scan for `>` outside of it.

  const IMG_TAG_RE = /<img\b([^>]*?)\bdata-src122="([^"]*)"([^>]*)>/g;
  const ID_RE = /\bid\s*=\s*"([^"]+)"/;

  // base-122 can emit `<` (0x3c) and `>` (0x3e); the HTML serializer escapes
  // them inside the attribute value. The browser would auto-unescape via
  // getAttribute, but we read raw markup, so undo it before decoding. (`"`,
  // `&`, and control bytes are base-122-illegal, so they only appear as part
  // of an escape sequence — unescaping is safe.)
  function htmlUnescape(s) {
    return s
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0*39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  }

  function extractAndRewriteImages(html, log) {
    const assets = {};
    let count = 0;
    const next = html.replace(IMG_TAG_RE, function (tag, before, encoded, after) {
      const idMatch = (before + after).match(ID_RE);
      if (!idMatch) return tag; // can't place it without an id — leave untouched
      const id = idMatch[1];
      assets[id] = base122Decode(htmlUnescape(encoded));
      count++;
      let rebuilt = "<img" + before + after;
      // Point at the loose file and clean up startup-only attrs.
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
      log.push(
        count
          ? "Extracted " + count + " image asset" + (count === 1 ? "" : "s") +
            " and rewrote <img> tags to relative paths"
          : "No data-src122 image assets found in source"
      );
    }
    return { html: next, assets: assets };
  }

  return {
    analyze: analyze,
    detectNetwork: detectNetwork,
    scanScripts: scanScripts,
    convertToGoogleAds: convertToGoogleAds,
    base122Decode: base122Decode,
    extractAndRewriteImages: extractAndRewriteImages,
  };
});
