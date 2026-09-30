"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStudy } from "@/lib/store";
import { formatReward } from "@/lib/utils";
import type { Difficulty, UnitCategory } from "@/lib/types";

export default function TemplatesPage(){
  const {data,addFromTemplate,addTemplate,deleteTemplate}=useStudy();
  const [title,setTitle]=useState(""); const [criteria,setCriteria]=useState(""); const [category,setCategory]=useState<UnitCategory>("Other"); const [mins,setMins]=useState(15); const [difficulty,setDifficulty]=useState<Difficulty>("Normal"); const [rewardId,setRewardId]=useState(data.settings.defaultRewardId);
  function submit(e:React.FormEvent){e.preventDefault(); if(!title.trim()) return; addTemplate({title:title.trim(),completionCriteria:criteria||"完了条件を満たす",category,estimatedMinutes:Math.max(1,mins),difficulty,defaultRewardId:rewardId}); setTitle("");setCriteria("");}
  return <div className="page"><header className="page-head"><div><div className="eyebrow">UNIT TEMPLATES</div><h1>One tap to Today</h1><p className="subtle">Keep repeatable outputs ready without rebuilding the Unit each time.</p></div></header>
  <section className="template-grid">{data.templates.map(t=>{const reward=data.rewards.find(r=>r.id===t.defaultRewardId);return <article className="template-card" key={t.id}><div className="eyebrow">{t.category}</div><h3>{t.title}</h3><p>{t.completionCriteria}</p><div className="unit-meta"><span>{t.estimatedMinutes} min</span><span>{t.difficulty}</span><span className="reward-chip">+ {formatReward(reward)}</span></div><div className="template-actions"><button className="primary" onClick={()=>addFromTemplate(t.id)}>Add to Today</button><button className="icon-btn" onClick={()=>deleteTemplate(t.id)} aria-label="Delete template"><Trash2 size={16}/></button></div></article>})}</section>
  <section className="section-block"><div className="section-head"><div><div className="eyebrow">NEW TEMPLATE</div><h2>Create template</h2></div></div><form className="panel form-grid" onSubmit={submit}><label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="過去問 大問1つ"/></label><label>Completion criteria<input value={criteria} onChange={e=>setCriteria(e.target.value)} placeholder="全問回答＋採点"/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value as UnitCategory)}>{["English","Japanese","PoliticsEconomics","Math","Other"].map(x=><option key={x}>{x}</option>)}</select></label><label>Estimated minutes<input type="number" min="1" value={mins} onChange={e=>setMins(Number(e.target.value))}/></label><label>Difficulty<select value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}>{["Easy","Normal","Hard"].map(x=><option key={x}>{x}</option>)}</select></label><label>Default reward<select value={rewardId} onChange={e=>setRewardId(e.target.value)}>{data.rewards.map(r=><option value={r.id} key={r.id}>{formatReward(r)}</option>)}</select></label><button className="primary big"><Plus size={17}/> Save Template</button></form></section>
  </div>;
}
