"use client";

import { useStudy } from "@/lib/store";
import { localDate, shiftDate } from "@/lib/utils";
import { UnitCard } from "@/components/unit-card";
import { DoneTodayButton } from "@/components/done-today";

export default function TodayPage() {
  const { data, copyUnitToDate, skipUnit, deleteUnit } = useStudy();
  const today = localDate();
  const yesterday = shiftDate(-1);
  const units = data.units.filter((u)=>u.date===today);
  const unfinished = data.units.filter((u)=>u.date===yesterday && !["completed","skipped"].includes(u.status));
  const completed = units.filter((u)=>u.status==="completed").length;
  const target = data.settings.dailyTargetUnits;
  return <div className="page">
    <header className="page-head"><div><div className="eyebrow">TODAY</div><h1>{completed} / {target} Units</h1><p className="subtle">Going past {target} is fine. The target is not a stopping rule.</p></div><DoneTodayButton/></header>
    <section className="unit-list large-gap">{units.length ? units.map((u)=><UnitCard key={u.id} unit={u}/>) : <div className="empty-card">Nothing assigned to today yet.</div>}</section>
    {unfinished.length > 0 && <section className="section-block">
      <div className="section-head"><div><div className="eyebrow">YESTERDAY&apos;S UNFINISHED UNITS</div><h2>Choose what happens next.</h2><p className="subtle">No automatic failure state is applied.</p></div></div>
      <div className="carry-list">{unfinished.map((u)=><div className="carry-card" key={u.id}><div><strong>{u.title}</strong><span>{u.estimatedMinutes} min · {u.difficulty}</span></div><div className="carry-actions"><button className="primary small" onClick={()=>copyUnitToDate(u.id,today)}>Add to Today</button><button className="ghost small" onClick={()=>skipUnit(u.id)}>Ignore</button><button className="ghost small" onClick={()=>deleteUnit(u.id)}>Delete</button></div></div>)}</div>
    </section>}
  </div>;
}
