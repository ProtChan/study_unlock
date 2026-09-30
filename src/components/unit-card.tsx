"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock3, MoreHorizontal } from "lucide-react";
import type { StudyUnit } from "@/lib/types";
import { useStudy } from "@/lib/store";
import { formatReward, shiftDate } from "@/lib/utils";

export function UnitCard({ unit, compact = false }: { unit: StudyUnit; compact?: boolean }) {
  const { data, startUnit, moveUnit } = useStudy();
  const reward = data.rewards.find((r) => r.id === unit.rewardId);
  const statusLabel = unit.status === "completed" ? "Completed" : unit.status === "active" ? "Active" : unit.status === "skipped" ? "Skipped" : "Ready";
  return <article className={`unit-card ${unit.status === "completed" ? "is-complete" : ""}`}>
    <div className="unit-main">
      <div className="unit-topline"><span className={`status-dot ${unit.status}`}></span><span>{statusLabel}</span><span className="dot-sep">·</span><span>{unit.category}</span></div>
      <h3>{unit.title}</h3>
      {!compact && unit.completionCriteria && <p>{unit.completionCriteria}</p>}
      <div className="unit-meta"><span><Clock3 size={14}/>{unit.estimatedMinutes} min</span><span className="reward-chip">+ {formatReward(reward)}</span><span>{unit.difficulty}</span></div>
    </div>
    <div className="unit-actions">
      {unit.status === "completed" ? <span className="done-mark"><Check size={20}/></span> : unit.status === "skipped" ? <span className="muted"><MoreHorizontal/></span> : <>
        {unit.status === "todo" && <button className="ghost small" onClick={() => moveUnit(unit.id, shiftDate(1))}>Tomorrow</button>}
        <Link className="primary small" href={`/unit/${unit.id}`} onClick={() => unit.status === "todo" && startUnit(unit.id)}>{unit.status === "active" ? "Resume" : "Start"}<ArrowRight size={15}/></Link>
      </>}
    </div>
  </article>;
}
