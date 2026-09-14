// Low-level HTML helpers shared by the converter. No DOM access — these
// operate on the raw markup string so they run in the browser and in node.

/** Find every <script> block with its byte range, attributes and body. */
export function scanScripts(html) {
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

/**
 * Parse-check every inline classic <script> body. Returns the list of
 * { index, error, preview } for blocks that fail to parse. Catches the
 * "one stray paren in an injected layer" class of bug that otherwise makes
 * the whole block silently dead at runtime.
 */
export function findScriptSyntaxErrors(html) {
  const errors = [];
  scanScripts(html).forEach((b, index) => {
    if (b.external) return;
    const type = (b.attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
    if (type && !/^(?:text|application)\/javascript$/i.test(type)) return; // modules, JSON, templates…
    try {
      // eslint-disable-next-line no-new-func
      new Function(b.body);
    } catch (e) {
      errors.push({ index, error: String(e && e.message ? e.message : e), preview: b.body.slice(0, 80) });
    }
  });
  return errors;
}

/** Apply { start, end, text } replacements from the back so offsets stay valid. */
export function applyEdits(html, edits) {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  for (const e of sorted) html = html.slice(0, e.start) + e.text + html.slice(e.end);
  return html;
}

/** Insert markup right before the closing tag (e.g. "</head>" or "</body>"). */
export function injectBefore(html, closingTag, markup, { last = false } = {}) {
  const idx = last ? html.lastIndexOf(closingTag) : html.indexOf(closingTag);
  if (idx < 0) throw new Error(`No ${closingTag} found in entry point`);
  return html.slice(0, idx) + markup + html.slice(idx);
}

/** Undo the HTML serializer's attribute escaping. */
export function htmlUnescape(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Read the value of $environment.targetPlatform, if present. */
export function readTargetPlatform(html) {
  const m = html.match(/targetPlatform:\s*"([^"]*)"/);
  return m ? m[1] : null;
}

/** Byte length of a string / ArrayBuffer / typed array. */
export function byteLength(value) {
  if (typeof value === "string") return new TextEncoder().encode(value).length;
  if (value && value.byteLength != null) return value.byteLength;
  return 0;
}
