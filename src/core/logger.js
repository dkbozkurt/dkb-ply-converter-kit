// Process logger.
// One ProcessLog spans a whole "Convert" run. Every pipeline step reports into
// it via a scope (one per source × target job), and the log can be serialised
// to a plain .txt for debugging — downloaded from the UI, bundled into the
// output zip, and (in `npm run dev`) written to temp/logs/ by the dev server.

const LEVEL_TAG = { info: "    ", step: "  › ", warn: "WARN", error: "ERR " };

function now() {
  return typeof performance !== "undefined" && performance.now
    ? performance.now()
    : Date.now();
}

function pad(n, w) {
  return String(n).padStart(w, " ");
}

export function createProcessLog(title, meta = {}) {
  const startedAt = new Date();
  const t0 = now();
  const entries = []; // { t, level, scope, message }

  function record(level, scope, message) {
    const entry = { t: now() - t0, level, scope, message: String(message) };
    entries.push(entry);
    return entry;
  }

  function makeScope(name) {
    const scope = {
      name,
      /** Lines belonging to this scope, in order (for per-result UI rendering). */
      get entries() {
        return entries.filter((e) => e.scope === name);
      },
      info: (m) => record("info", name, m),
      step: (m) => record("step", name, m),
      warn: (m) => record("warn", name, m),
      error: (m) => record("error", name, m),
      section: (m) => record("info", name, `— ${m} —`),
    };
    return scope;
  }

  const root = makeScope("run");

  function toText() {
    const lines = [];
    lines.push(`${title}`);
    lines.push(`Started : ${startedAt.toISOString()}`);
    for (const [k, v] of Object.entries(meta)) lines.push(`${k.padEnd(8)}: ${v}`);
    lines.push(`Duration: ${(now() - t0).toFixed(0)} ms`);
    lines.push("=".repeat(72));

    let lastScope = null;
    for (const e of entries) {
      if (e.scope !== lastScope) {
        lines.push("");
        lines.push(`[${e.scope}]`);
        lastScope = e.scope;
      }
      const stamp = pad(e.t.toFixed(0), 6) + "ms";
      lines.push(`${stamp} ${LEVEL_TAG[e.level] || "    "} ${e.message}`);
    }

    const warnings = entries.filter((e) => e.level === "warn").length;
    const errors = entries.filter((e) => e.level === "error").length;
    lines.push("");
    lines.push("-".repeat(72));
    lines.push(`Summary : ${entries.length} entries, ${warnings} warning(s), ${errors} error(s)`);
    return lines.join("\n") + "\n";
  }

  return {
    title,
    meta,
    startedAt,
    entries,
    scope: makeScope,
    info: root.info,
    step: root.step,
    warn: root.warn,
    error: root.error,
    section: root.section,
    toText,
    hasErrors: () => entries.some((e) => e.level === "error"),
  };
}
