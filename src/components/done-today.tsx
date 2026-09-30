"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStudy } from "@/lib/store";
import { balanceForType, localDate } from "@/lib/utils";

export function DoneTodayButton() {
  const { data } = useStudy();
  const [open, setOpen] = useState(false);
  const today = localDate();
  const completed = data.units.filter((u) => u.date === today && u.status === "completed").length;
  const todayEarn = data.transactions.filter((tx) => tx.type === "earn" && localDate(new Date(tx.createdAt)) === today)
    .reduce((sum, tx) => {
      const r = data.rewards.find((x) => x.id === tx.rewardId);
      return sum + (r?.type === "free_time" ? tx.amount : 0);
    }, 0);
  return <>
    <button className="ghost" onClick={() => setOpen(true)}>Done for today</button>
    {open && <div className="modal-backdrop" onMouseDown={() => setOpen(false)}><div className="sheet compact-sheet" onMouseDown={(e) => e.stopPropagation()}>
      <div className="sheet-head"><div><div className="eyebrow">TODAY</div><h2>Done for now.</h2></div><button className="icon-btn" onClick={() => setOpen(false)}><X/></button></div>
      <div className="summary-grid"><div><span>Units completed</span><strong>{completed}</strong></div><div><span>Free time earned</span><strong>{Math.round(todayEarn)} min</strong></div><div><span>Free time balance</span><strong>{Math.round(balanceForType(data,"free_time"))} min</strong></div></div>
      <button className="primary big" onClick={() => setOpen(false)}>Close</button>
    </div></div>}
  </>;
}
