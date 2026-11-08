// TikTok comment endpoint probe V2
// Metadata only: never logs URLs, tokens, cookies, or response bodies.
(() => {
  const u = typeof $request !== "undefined" ? ($request.url || "") : "";
  const m = u.match(/^https?:\/\/([^/]+)(\/[^?]*)?/i);
  const host = m ? m[1] : "unknown";
  const path = m ? (m[2] || "/") : "/";
  const isComment = /comment/i.test(path);
  console.log("[TikTok Probe V2] host=" + host + " commentPath=" + isComment + " bodyAvailable=" + (typeof $response !== "undefined" && typeof $response.body === "string"));
  $done({});
})();
