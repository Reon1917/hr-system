"use client";

import { useEffect } from "react";

const DEV_CACHE_RESET_KEY = "hr-system-dev-cache-reset-v1";

export function LocalhostReset() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocalhost) {
      return;
    }

    console.info("[localhost-reset] init", {
      href: window.location.href,
      pathname: window.location.pathname,
      hostname: window.location.hostname,
      hasServiceWorkerApi: "serviceWorker" in navigator,
      hasCacheApi: "caches" in window,
    });

    let cancelled = false;

    async function clearLocalhostArtifacts() {
      try {
        const shouldReload = sessionStorage.getItem(DEV_CACHE_RESET_KEY) !== "done";
        let didMutate = false;

        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();

          console.info("[localhost-reset] service workers", {
            count: registrations.length,
            scopes: registrations.map((registration) => registration.scope),
            controlled: Boolean(navigator.serviceWorker.controller),
          });

          for (const registration of registrations) {
            didMutate = (await registration.unregister()) || didMutate;
            console.info("[localhost-reset] unregistered service worker", {
              scope: registration.scope,
            });
          }
        }

        if ("caches" in window) {
          const cacheKeys = await caches.keys();

          console.info("[localhost-reset] caches", {
            count: cacheKeys.length,
            keys: cacheKeys,
          });

          for (const cacheKey of cacheKeys) {
            didMutate = (await caches.delete(cacheKey)) || didMutate;
            console.info("[localhost-reset] deleted cache", { cacheKey });
          }
        }

        console.info("[localhost-reset] mutation summary", {
          didMutate,
          shouldReload,
          cancelled,
        });

        if (cancelled || !didMutate || !shouldReload) {
          return;
        }

        sessionStorage.setItem(DEV_CACHE_RESET_KEY, "done");
        console.info("[localhost-reset] reloading page after cleanup");
        window.location.reload();
      } catch (error) {
        console.error("[localhost-reset] cleanup failed", error);
      }
    }

    void clearLocalhostArtifacts();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
