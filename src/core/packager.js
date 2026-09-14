// Packaging: turns conversion results into downloadable zips.
//
//  - one source × one target  → <source>_<TargetSuffix>.zip handed back directly
//  - anything else            → Converted_Playables.zip containing
//                                 <TargetName>/<source>_<TargetSuffix>.zip …
//                                 conversion-log.txt
// Inner zips are DEFLATE-compressed; the parent stores them as-is.

import JSZip from "jszip";

export const BUNDLE_NAME = "Converted_Playables.zip";
export const LOG_FILE_NAME = "conversion-log.txt";

/** "<original>_<Suffix>.zip" — strips .html/.htm from the source name. */
export function zipNameFor(sourceName, target) {
  return sourceName.replace(/\.html?$/i, "") + "_" + target.target.zipSuffix + ".zip";
}

/** Zip a single conversion result (index.html + files). */
export async function zipResult(result) {
  const zip = new JSZip();
  zip.file("index.html", result.html);
  for (const [path, content] of Object.entries(result.files)) zip.file(path, content);
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

/** Ensure no two jobs collapse to the same zip name inside the same folder. */
export function uniqueName(name, used) {
  let candidate = name;
  let i = 2;
  while (used.has(candidate)) candidate = name.replace(/\.zip$/i, `_${i++}.zip`);
  used.add(candidate);
  return candidate;
}

/**
 * Build the final download.
 * @param {Array<{ zipName, zipBlob, target }>} jobs
 * @param {string} logText  contents of the debug log to bundle
 */
export async function bundle(jobs, logText) {
  if (jobs.length === 1) {
    return { blob: jobs[0].zipBlob, name: jobs[0].zipName, nested: false };
  }
  const parent = new JSZip();
  for (const job of jobs) parent.file(`${job.target.name}/${job.zipName}`, job.zipBlob);
  if (logText) parent.file(LOG_FILE_NAME, logText);
  const blob = await parent.generateAsync({ type: "blob", compression: "STORE" });
  return { blob, name: BUNDLE_NAME, nested: true };
}
