// While running under `npm run dev`, ship the process log to the Vite dev
// server, which writes it to temp/logs/*.txt in the project root (see
// vite.config.js → devLogSink). In the static production build there is no
// server, so this is a no-op and the UI relies on the download button and
// the copy bundled inside the output zip.

export const DEV_LOG_ENABLED = Boolean(import.meta.env && import.meta.env.DEV);

/**
 * @returns {Promise<{ok: boolean, file?: string, error?: string}|null>}
 *          null when not in dev mode.
 */
export async function persistLog(name, text) {
  if (!DEV_LOG_ENABLED) return null;
  try {
    const res = await fetch("/__dev/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text }),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
