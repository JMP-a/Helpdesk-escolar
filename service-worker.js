
const CACHE_NAME = "helpdesk-escolar-v2";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./criar.html",
    "./chamados.html",
    "./style.css",
    "./app.js",
    "./chamados.js",
    "./JS/storage.js",
    "./banco/config.js",
    "./banco/supabase.js",
    "./manifest.json",
    "./icon.svg"
];

// Instala o Service Worker e armazena os arquivos.
self.addEventListener("install", evento => {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARQUIVOS))
            .then(() => self.skipWaiting())
    );
});

// Ativa o Service Worker e remove caches antigos.
self.addEventListener("activate", evento => {
    evento.waitUntil(
        caches.keys().then(chaves => {
            return Promise.all(
                chaves
                    .filter(chave => chave !== CACHE_NAME)
                    .map(chave => caches.delete(chave))
            );
        }).then(() => self.clients.claim())
    );
});

// Busca os arquivos no cache quando necessário.
self.addEventListener("fetch", evento => {
    if (evento.request.method !== "GET") return;

    const url = new URL(evento.request.url);

    // Não intercepta arquivos de outros sites.
    if (url.origin !== self.location.origin) return;

    evento.respondWith(
        fetch(evento.request)
            .then(resposta => {
                if (resposta.ok) {
                    const copia = resposta.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(evento.request, copia);
                    });
                }

                return resposta;
            })
            .catch(async () => {
                const arquivo = await caches.match(evento.request);

                if (arquivo) return arquivo;

                // Se uma página não estiver no cache,
                // tenta abrir a página inicial.
                if (evento.request.mode === "navigate") {
                    return caches.match("./index.html");
                }
            })
    );
});
