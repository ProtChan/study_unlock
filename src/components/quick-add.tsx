"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useStudy } from "@/lib/store";
import { formatReward } from "@/lib/utils";

export function QuickAdd() {
  const { data, addUnit } = useStudy();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [rewardId, setRewardId] = useState(data.settings.defaultRewardId);

  useEffect(() => setRewardId(data.settings.defaultRewardId), [data.settings.defaultRewardId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addUnit({ title, rewardId });
    setTitle("");
    setOpen(false);
  }

  return <>
    <button className="quick-add" onClick={() => setOpen(true)} aria-label="Add Unit"><Plus size={20}/> <span>Add Unit</span></button>
    {open && <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
      <div className="sheet" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sheet-head"><div><div className="eyebrow">QUICK ADD</div><h2>New Study Unit</h2></div><button className="icon-btn" onClick={() => setOpen(false)}><X/></button></div>
        <form onSubmit={submit} className="form-stack">
          <label>Title<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="英語長文1題" /></label>
          <label>Reward<select value={rewardId} onChange={(e) => setRewardId(e.target.value)}>{data.rewards.map((r) => <option key={r.id} value={r.id}>{formatReward(r)}</option>)}</select></label>
          <button className="primary big" type="submit" disabled={!title.trim()}>Add to Today</button>
        </form>
      </div>
    </div>}
  </>;
}
