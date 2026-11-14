"use client";

import { useEffect } from "react";

/**
 * Self-healing cleanup for the old Firebase push service worker.
 *
 * Earlier builds registered `/firebase-messaging-sw.js`. That file is gone, so
 * any browser that still has it registered keeps re-fetching it (404 in the
 * dev log) and can serve stale cached responses. This unregisters every
 * service worker and clears their caches, once, on any page load.
 */
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((reg) => reg.unregister()))
      .catch(() => {});

    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => keys.forEach((k) => caches.delete(k)))
        .catch(() => {});
    }
  }, []);

  return null;
}
