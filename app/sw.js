var CACHE = "zzs-pwa-v15";
var PRECACHE = [
  "./",
  "./index.html",
  "./version.json"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(PRECACHE);
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  // 网络优先：先向服务器请求最新版，离线时才回落缓存
  e.respondWith(
    fetch(e.request).then(function (resp) {
      if (resp && resp.ok) {
        var copy = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) {
        return r || caches.match("./index.html");
      });
    })
  );
});
