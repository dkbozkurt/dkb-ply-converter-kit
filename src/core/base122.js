// base-122 decoder.
// Luna embeds each image as a base-122 string in the <img data-src122="...">
// attribute. base-122 (Kevin Albertson's scheme) packs 7 bits per char and
// escapes the 6 bytes that are unsafe in HTML/JS string contexts
// [0x00, 0x0a, 0x0d, 0x22("), 0x26(&), 0x5c(\)] into two-byte UTF-8
// sequences. Decoding yields the raw PNG/JPEG bytes directly — no Brotli,
// no game boot. This mirrors Luna's own window._base122ToArrayBuffer
// bit-for-bit (verified byte-exact against a known-good Google Ads export).

const B122_ILLEGAL = [0, 10, 13, 34, 38, 92];

export function base122Decode(str) {
  // Upper bound on output size, trimmed to the real length at the end.
  // Each char yields up to 14 bits (an escaped illegal byte + 7 data bits),
  // i.e. up to 1.75 bytes per char — matching Luna's own 1.75*len sizing.
  const out = new Uint8Array(((str.length * 7) >> 2) + 8);
  let curByte = 0;
  let bitOfByte = 0;
  let n = 0;

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
