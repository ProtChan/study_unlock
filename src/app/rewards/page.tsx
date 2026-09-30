"use client";

import { useMemo, useState } from "react";
import { Banknote, Clock3, Gift, Plus } from "lucide-react";
import { useStudy } from "@/lib/store";
import { balanceForType, formatClock, formatReward } from "@/lib/utils";
import type { RewardType } from "@/lib/types";

export default function RewardsPage() {
  const { data, rewardBalance, useReward, addReward } = useStudy();
  const [freeAmount,setFreeAmount]=useState(10);
  const [moneyAmount,setMoneyAmount]=useState(100);
  const [name,setName]=useState(""); const [type,setType]=useState<RewardType>("custom"); const [amount,setAmount]=useState(1);
  const free = balanceForType(data,"free_time"), money=balanceForType(data,"money");
  const custom = data.rewards.filter((r)=>r.type==="custom" && rewardBalance(r.id)>0);
  const freeReward = data.rewards.find(r=>r.type==="free_time");
  const moneyReward = data.rewards.find(r=>r.type==="money");
  const history = useMemo(()=>data.transactions.slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,30),[data.transactions]);

  function create(e:React.FormEvent){ e.preventDefault(); if(!name.trim()) return; addReward({name:name.trim(),type,amount:Math.max(1,amount),unit:type==="free_time"?"minutes":type==="money"?"JPY":"use"}); setName(""); }
  return <div className="page">
    <header className="page-head"><div><div className="eyebrow">REWARD WALLET</div><h1>Available now</h1></div></header>
    <section className="wallet-grid">
      <div className="wallet-card"><Clock3/><span>Free Time</span><strong>{Math.round(free)} <em>min</em></strong><div className="use-row"><input type="number" min="1" value={freeAmount} onChange={e=>setFreeAmount(Number(e.target.value))}/><button className="primary" disabled={!freeReward||freeAmount>free} onClick={()=>freeReward&&useReward(freeReward.id,freeAmount)}>Use</button></div></div>
      <div className="wallet-card"><Banknote/><span>Money</span><strong>¥{Math.round(money).toLocaleString()}</strong><div className="use-row"><input type="number" min="1" value={moneyAmount} onChange={e=>setMoneyAmount(Number(e.target.value))}/><button className="primary" disabled={!moneyReward||moneyAmount>money} onClick={()=>moneyReward&&useReward(moneyReward.id,moneyAmount)}>Use</button></div></div>
      <div className="wallet-card"><Gift/><span>Custom Rewards</span><strong>{custom.reduce((s,r)=>s+rewardBalance(r.id),0)} <em>available</em></strong><div className="custom-wallet">{custom.length?custom.map(r=><button key={r.id} className="custom-use" onClick={()=>useReward(r.id,1)}><span>{r.name}</span><b>{rewardBalance(r.id)} ×</b></button>):<small>None available yet.</small>}</div></div>
    </section>

    <section className="section-block split-section"><div><div className="section-head"><div><div className="eyebrow">HISTORY</div><h2>Transactions</h2></div></div><div className="history-list">{history.length?history.map(tx=>{const r=data.rewards.find(x=>x.id===tx.rewardId); const u=data.units.find(x=>x.id===tx.sourceUnitId); return <div className="history-row" key={tx.id}><span>{formatClock(tx.createdAt)}</span><div><strong>{u?`${u.title} completed`:r?.name??"Reward"}</strong><small>{tx.type==="earn"?"Earned":"Used"}</small></div><b className={tx.type==="earn"?"positive":""}>{tx.type==="earn"?"+":"−"}{formatReward(r,tx.amount)}</b></div>}):<div className="empty-card">No reward activity yet.</div>}</div></div>
      <div><div className="section-head"><div><div className="eyebrow">REWARD DEFINITIONS</div><h2>Add a reward</h2></div></div><form className="panel form-stack" onSubmit={create}><label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="スタバ"/></label><label>Type<select value={type} onChange={e=>setType(e.target.value as RewardType)}><option value="free_time">Free Time</option><option value="money">Money</option><option value="custom">Custom</option></select></label><label>Amount<input type="number" min="1" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label><button className="primary big"><Plus size={17}/> Add Reward</button></form></div>
    </section>
  </div>;
}
