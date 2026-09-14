// Network logos, inlined as SVG markup so they can be dropped straight into
// the DOM (and greyed out via CSS when a network is disabled).
// Every src/assets/logos/<network-id>.svg is picked up automatically — adding
// a logo for a new network is just adding the file.
// Kept separate from the network definitions so the converter core stays
// free of bundler-specific imports and runs in plain node.

const files = import.meta.glob("../assets/logos/*.svg", { query: "?raw", import: "default", eager: true });

const LOGOS = Object.fromEntries(
  Object.entries(files).map(([path, svg]) => [path.match(/\/([^/]+)\.svg$/)[1], svg])
);

const PLACEHOLDER =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">' +
  '<rect width="48" height="48" rx="11" fill="currentColor" opacity=".25"/></svg>';

/** SVG markup for a network id, or a generic placeholder glyph. */
export function logoFor(id) {
  return LOGOS[id] || PLACEHOLDER;
}
