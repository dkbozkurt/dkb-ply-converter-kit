# Network definitions

Every ad network the kit knows about lives in its own file here and is
registered in `index.js`. The core engine (`src/core/converter.js`) never
references a network by name — it only reads these definitions. Adding a
network is a matter of adding a file and a registry entry.

```js
export default {
  id: "example",          // stable id, used in logs / zip folder names
  name: "Example",        // display name
  color: "#RRGGBB",       // brand accent used for chips and cards
  platformIds: ["example"], // values of $environment.targetPlatform this network emits

  // Optional — the kit can *read* playables exported for this network.
  source: {
    supported: true,
    markers: [/regex that only appears in this network's build/],
    strip:   [/regex identifying inline <script> blocks to delete/],
  },

  // Optional — the kit can *write* playables for this network.
  target: {
    supported: true,        // false => shown greyed out in the UI
    hint: "Coming soon",    // shown on the card when not supported
    platformId: "example",  // value written to $environment.targetPlatform
    zipSuffix: "Example",   // <source>_Example.zip
    packaging: {
      externalizeAssets: true,  // move inline scripts/jsons/blobs to assets/*.js
      externalizeImages: true,  // decode data-src122 images to assets/<id>
    },
    patch(html, ctx) { /* inject SDK, CTA, lifecycle — return new html */ },
  },
};
```

`ctx` passed to `patch` is `{ source, log, helpers }` where `helpers` exposes
`injectBefore`, `readTargetPlatform` and the `PLAYABLE_ADAPTER_GLOBAL` name.
Every target should route its CTA through `window.PlayableAdapter.exit()` so
the neutral adapter layer stays the single seam between game and network.
