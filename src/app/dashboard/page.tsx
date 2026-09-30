"use client";

import Link from "next/link";
import { ArrowRight, Banknote, Clock3, Gift, Play } from "lucide-react";
import { useStudy } from "@/lib/store";
import { balanceForType, formatReward, localDate, recommendedUnit } from "@/lib/utils";
import { UnitCard } from "@/components/unit-card";
import { DoneTodayButton } from "@/components/done-today";

export default function DashboardPage() {
  const { data, startUnit, hydrated } = useStudy();
  const today = localDate();
  const units = data.units.filter((u) => u.date === today);
  const completed = units.filter((u) => u.status === "completed").length;
  const next = recommendedUnit(data.units, today);
  const freeBalance = balanceForType(data, "free_time");
  const moneyBalance = balanceForType(data, "money");
  const earnedToday = data.transactions.filter((tx) => tx.type === "earn" && localDate(new Date(tx.createdAt)) === today && data.rewards.find((r) => r.id === tx.rewardId)?.type === "free_time").reduce((a,b)=>a+b.amount,0);
  const target = data.settings.dailyTargetUnits;

  if (!hydrated) return <div className="page"><div className="skeleton hero-skeleton"/></div>;
  return <div className="page">
    <header className="page-head"><div><div className="eyebrow">TODAY · {today}</div><h1>What gets finished next?</h1></div><DoneTodayButton/></header>

    <section className="hero-card">
      <div>
        <div className="eyebrow">NEXT UNIT</div>
        {next ? <><h2>{next.title}</h2><p>{next.completionCriteria}</p><div className="unit-meta hero-meta"><span><Clock3 size={15}/>{next.estimatedMinutes} min est.</span><span className="reward-chip">+ {formatReward(data.rewards.find((r)=>r.id===next.rewardId))}</span></div></> : <><h2>No Unit queued.</h2><p>Add one in a few seconds. Only title and reward are required.</p></>}
      </div>
      {next ? <Link href={`/unit/${next.id}`} onClick={() => next.status === "todo" && startUnit(next.id)} className="start-next"><Play fill="currentColor"/> START NEXT UNIT</Link> : <Link href="/templates" className="start-next"><ArrowRight/> USE A TEMPLATE</Link>}
    </section>

    <section className="metric-grid">
      <div className="metric"><span>Today&apos;s goal</span><strong>{completed} <em>/ {target}</em></strong><small>Units completed</small></div>
      <div className="metric"><span>Reward earned</span><strong>{Math.round(earnedToday)} <em>min</em></strong><small>Free time today</small></div>
      <div className="metric"><span><Gift size={15}/> Free time</span><strong>{Math.round(freeBalance)} <em>min</em></strong><small>Available now</small></div>
      <div className="metric"><span><Banknote size={15}/> Money</span><strong>¥{Math.round(moneyBalance).toLocaleString()}</strong><small>Available now</small></div>
    </section>

    <section className="section-block">
      <div className="section-head"><div><div className="eyebrow">TODAY&apos;S UNITS</div><h2>{completed} completed · {units.filter(u=>u.status!=="completed"&&u.status!=="skipped").length} available</h2></div><Link href="/today" className="text-link">Open today <ArrowRight size={14}/></Link></div>
      <div className="unit-list">{units.length ? units.slice(0,5).map((u)=><UnitCard key={u.id} unit={u} compact/>) : <div className="empty-card">No Units yet. Use <strong>+ Add Unit</strong> or a template.</div>}</div>
    </section>
  </div>;
}
