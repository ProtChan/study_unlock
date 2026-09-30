"use client";

import { useRef, useState } from "react";
import { Download, FileJson, RotateCcw, Upload } from "lucide-react";
import { useStudy } from "@/lib/store";
import { formatReward } from "@/lib/utils";

export default function SettingsPage(){
  const {data,updateSettings,exportJson,exportCsv,importData,resetData}=useStudy(); const fileRef=useRef<HTMLInputElement>(null); const [message,setMessage]=useState("");
  async function toggleNotifications(value:boolean){ if(value && "Notification" in window){const p=await Notification.requestPermission(); if(p!=="granted"){setMessage("Notification permission was not granted.");updateSettings({notifications:false});return;}} updateSettings({notifications:value});}
  async function onFile(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return; const result=importData(await f.text());setMessage(result.message);e.target.value="";}
  return <div className="page narrow-page"><header className="page-head"><div><div className="eyebrow">SETTINGS</div><h1>Study Unlock</h1></div></header>
  <section className="settings-list">
    <SettingRow label="Appearance"><select value={data.settings.theme} onChange={e=>updateSettings({theme:e.target.value as "dark"|"light"})}><option value="dark">Dark</option><option value="light">Light</option></select></SettingRow>
    <SettingRow label="Default Reward"><select value={data.settings.defaultRewardId} onChange={e=>updateSettings({defaultRewardId:e.target.value})}>{data.rewards.map(r=><option key={r.id} value={r.id}>{formatReward(r)}</option>)}</select></SettingRow>
    <SettingRow label="Daily Target Units"><input type="number" min="1" max="99" value={data.settings.dailyTargetUnits} onChange={e=>updateSettings({dailyTargetUnits:Math.max(1,Number(e.target.value))})}/></SettingRow>
    <SettingRow label="Week Start Day"><select value={data.settings.weekStartDay} onChange={e=>updateSettings({weekStartDay:e.target.value as "monday"|"sunday"})}><option value="monday">Monday</option><option value="sunday">Sunday</option></select></SettingRow>
    <SettingRow label="Currency"><select value={data.settings.currency} onChange={e=>updateSettings({currency:e.target.value})}><option>JPY</option><option>USD</option><option>EUR</option></select></SettingRow>
    <SettingRow label="Notifications" note="Neutral reminders only. Browser/PWA support varies."><label className="switch"><input type="checkbox" checked={data.settings.notifications} onChange={e=>toggleNotifications(e.target.checked)}/><span/></label></SettingRow>
    <SettingRow label="Reduce Motion"><label className="switch"><input type="checkbox" checked={data.settings.reduceMotion} onChange={e=>updateSettings({reduceMotion:e.target.checked})}/><span/></label></SettingRow>
  </section>
  <section className="section-block"><div className="section-head"><div><div className="eyebrow">DATA</div><h2>Export / Import</h2></div></div><div className="data-actions"><button className="panel-button" onClick={exportJson}><FileJson/>Export JSON<span>Full backup</span></button><button className="panel-button" onClick={exportCsv}><Download/>Export CSV<span>Units table</span></button><button className="panel-button" onClick={()=>fileRef.current?.click()}><Upload/>Import JSON<span>Replace local data</span></button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile}/></div>{message&&<p className="subtle">{message}</p>}</section>
  <section className="section-block"><div className="section-head"><div><div className="eyebrow">RESET</div><h2>Reset local data</h2><p className="subtle">Clears Units, transactions and custom changes on this device.</p></div></div><button className="ghost danger-neutral" onClick={()=>{if(confirm("Reset Study Unlock data on this device?"))resetData()}}><RotateCcw size={17}/> Reset Data</button></section>
  </div>;
}
function SettingRow({label,note,children}:{label:string;note?:string;children:React.ReactNode}){return <div className="setting-row"><div><strong>{label}</strong>{note&&<span>{note}</span>}</div><div>{children}</div></div>}
