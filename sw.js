/*
 * Service worker — é o que permite instalar o painel como app.
 *
 * Estratégia: rede primeiro, cache como reserva.
 *   - Sempre que houver internet, a Flávia vê a versão mais nova. Um `git push`
 *     chega nela sem precisar de loja de aplicativos.
 *   - Sem internet, abre a última versão guardada, em vez do dinossauro.
 *
 * Só mexe em arquivos do próprio site. Chamadas ao Supabase passam direto:
 * agenda é informação viva, não pode vir de cache.
 */

var VERSAO = "flavianails-v3";

// A "casca" do app: o suficiente para a tela abrir offline.
var ARQUIVOS = [
  "./admin.html",
  "./styles.css",
  "./admin.css",
  "./config.js",
  "./db.js",
  "./admin.js",
  "./manifest-admin.json",
  "./assets/logo.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches
      .open(VERSAO)
      .then(function (cache) {
        // addAll falha inteiro se um arquivo falhar; guardamos um a um.
        return Promise.all(
          ARQUIVOS.map(function (url) {
            return cache.add(url).catch(function () {});
          }),
        );
      })
      .then(function () {
        return self.skipWaiting();
      }),
  );
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches
      .keys()
      .then(function (nomes) {
        return Promise.all(
          nomes.map(function (nome) {
            if (nome !== VERSAO) return caches.delete(nome);
          }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

self.addEventListener("fetch", function (evento) {
  var pedido = evento.request;

  if (pedido.method !== "GET") return;

  // Supabase e qualquer outro domínio: sempre rede, nunca cache.
  var mesmaOrigem = new URL(pedido.url).origin === self.location.origin;
  if (!mesmaOrigem) return;

  evento.respondWith(
    fetch(pedido)
      .then(function (resposta) {
        if (resposta && resposta.ok) {
          var copia = resposta.clone();
          caches.open(VERSAO).then(function (cache) {
            cache.put(pedido, copia);
          });
        }
        return resposta;
      })
      .catch(function () {
        return caches.match(pedido).then(function (guardada) {
          if (guardada) return guardada;
          // navegação sem internet e sem cache da rota: cai na tela do painel
          if (pedido.mode === "navigate") return caches.match("./admin.html");
          return Response.error();
        });
      }),
  );
});
