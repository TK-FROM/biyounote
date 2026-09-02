// 美容ノート Service Worker
// 方針: ネットワーク優先（常に最新を取りに行き、オフライン時だけキャッシュで動く）。
// キャッシュ優先にすると「更新したのに古いまま」事故が起きるため採用しない。
var CACHE = "biyou-note-v1";

self.addEventListener("install", function(e){
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  e.respondWith(
    fetch(req).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, copy); }).catch(function(){});
      return res;
    }).catch(function(){
      return caches.match(req).then(function(m){
        if(m) return m;
        if(req.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});
