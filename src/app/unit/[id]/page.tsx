"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Clock3, Pause, SkipForward, Zap } from "lucide-react";
import { useStudy } from "@/lib/store";
import { balanceForType, durationMinutes, formatReward, recommendedUnit } from "@/lib/utils";

export default function ActiveUnitPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, startUnit, pauseUnit, skipUnit, completeUnit, useReward } = useStudy();
  const unit = data.units.find((u)=>u.id===id);
  const [tick,setTick]=useState(Date.now());
  const [finished,setFinished]=useState(false);
  const [rewardUsed,setRewardUsed]=useState(false);

  useEffect(()=>{ if(unit && unit.status==="todo") startUnit(unit.id); },[unit?.id]);
  useEffect(()=>{ const t=setInterval(()=>setTick(Date.now()),1000); return()=>clearInterval(t); },[]);
  const reward = data.rewards.find((r)=>r.id===unit?.rewardId);
  const elapsed = unit ? durationMinutes(unit,tick) : 0;
  const balance = reward ? (reward.type==="custom" ? data.transactions.reduce((s,t)=>t.rewardId===reward.id?s+(t.type==="earn"?t.amount:-t.amount):s,0) : balanceForType(data,reward.type)) : 0;
  const next = useMemo(()=>recommendedUnit(data.units),[data.units]);

  if (!unit) return <div className="page"><div className="empty-card">Unit not found.</div></div>;
  if (unit.status === "completed" && !finished) return <div className="page focus-page"><div className="completed-panel"><Check size={42}/><div className="eyebrow">COMPLETED</div><h1>{unit.title}</h1><p>This Unit is already complete.</p><button className="primary big" onClick={()=>router.push("/today")}>Back to Today</button></div></div>;

  function doComplete(){ completeUnit(unit.id); setFinished(true); }
  function doPause(){ pauseUnit(unit.id); router.push("/today"); }
  function doSkip(){ skipUnit(unit.id); router.push("/today"); }
  function doUse(){ if(reward && useReward(reward.id,reward.amount)) setRewardUsed(true); }
  function startNext(){ const n=recommendedUnit(data.units); if(n){ startUnit(n.id); router.replace(`/unit/${n.id}`); setFinished(false); setRewardUsed(false); } else router.push("/today"); }

  if (finished) {
    return <div className="page focus-page"><div className="completed-panel pulse-in">
      <Check size={46}/><div className="eyebrow">COMPLETED.</div><h1>+ {formatReward(reward)}</h1><div className="balance-display"><span>Balance</span><strong>{balance}{reward?.type==="free_time"?" min":reward?.type==="money"?" JPY":""}</strong></div>
      <div className="completion-actions"><button className="ghost big" onClick={doUse} disabled={rewardUsed}>{rewardUsed ? "Reward used" : "Use Reward"}</button><button className="primary big" onClick={startNext}>{next && next.id!==unit.id ? "Start Next Unit" : "Back to Today"}</button><button className="ghost big" onClick={()=>router.push("/dashboard")}>Done for Now</button></div>
    </div></div>;
  }

  return <div className="page focus-page">
    <div className="focus-top"><button className="ghost small" onClick={doPause}>Exit / Pause</button><span className="timer"><Clock3 size={15}/>{Math.floor(elapsed)}:{String(Math.floor((elapsed%1)*60)).padStart(2,"0")}</span></div>
    <section className="active-card">
      <div className="eyebrow">ACTIVE UNIT</div><h1>{unit.title}</h1>
      <div className="criteria"><span>Completion criteria</span><strong>{unit.completionCriteria || "完了条件を満たす"}</strong></div>
      <div className="active-stats"><div><span>Estimated</span><strong>{unit.estimatedMinutes} min</strong></div><div><span>Reward</span><strong><Zap size={17}/> + {formatReward(reward)}</strong></div></div>
      <button className="complete-button" onClick={doComplete}><Check size={27}/> COMPLETE</button>
      <div className="secondary-row"><button className="ghost big" onClick={doPause}><Pause size={17}/> PAUSE</button><button className="ghost big" onClick={doSkip}><SkipForward size={17}/> SKIP</button></div>
    </section>
    <p className="focus-note">The timer is informational. Only COMPLETE grants the reward.</p>
  </div>;
}
