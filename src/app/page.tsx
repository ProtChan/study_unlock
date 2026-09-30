"use client";

import { useEffect } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Home() {
  useEffect(() => {
    window.location.replace(`${basePath}/dashboard/`);
  }, []);

  return <main className="page"><div className="empty-card">Opening Study Unlock…</div></main>;
}
