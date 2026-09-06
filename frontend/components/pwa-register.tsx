"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const register = async () => {
      try {
        await navigator.serviceWorker.register(`${basePath}/sw.js`, {
          scope: `${basePath}/`,
        });
      } catch (error) {
        console.error("VoteDine PWA registration failed", error);
      }
    };

    register();
  }, []);

  return null;
}
