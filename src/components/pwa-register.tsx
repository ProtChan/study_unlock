"use client";

import { useEffect } from "react";
import { useStudy } from "@/lib/store";
import { balanceForType, localDate, recommendedUnit } from "@/lib/utils";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function PwaRegister() {
  const { data, hydrated } = useStudy();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath}/` }).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || !data.settings.notifications || !("Notification" in window) || Notification.permission !== "granted") return;
    const key = `study_unlock_notification_${localDate()}`;
    if (localStorage.getItem(key)) return;
    const timer = window.setTimeout(async () => {
      const free = balanceForType(data, "free_time");
      const next = recommendedUnit(data.units);
      const body = free > 0 ? `Unused reward: ${Math.round(free)} min available` : next ? "1 Unit available" : "Study Unlock is ready";
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification("Study Unlock", { body, icon: `${basePath}/icon.svg`, badge: `${basePath}/icon.svg` });
      localStorage.setItem(key, "1");
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [data, hydrated]);

  return null;
}
