"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppData, RewardDefinition, StudySettings, StudyUnit, UnitTemplate } from "./types";
import { balanceForReward, balanceForType, csvEscape, durationMinutes, localDate } from "./utils";

const STORAGE_KEY = "study_unlock_data_v1";
const nowIso = () => new Date().toISOString();
const id = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const defaultRewards: RewardDefinition[] = [
  { id: "free-15", name: "Free Time", type: "free_time", amount: 15, unit: "minutes" },
  { id: "free-10", name: "YouTube", type: "free_time", amount: 10, unit: "minutes" },
  { id: "money-200", name: "Free Budget", type: "money", amount: 200, unit: "JPY" },
  { id: "custom-game", name: "Game 1 match", type: "custom", amount: 1, unit: "use" },
  { id: "custom-drink", name: "Favorite drink", type: "custom", amount: 1, unit: "use" },
];

export const defaultTemplates: UnitTemplate[] = [
  { id: "tpl-reading", title: "英語長文1題", completionCriteria: "本文を読み、全設問回答＋採点", category: "English", estimatedMinutes: 20, difficulty: "Normal", defaultRewardId: "free-15" },
  { id: "tpl-politics", title: "政経1テーマ", completionCriteria: "1テーマを確認し、要点を自力で再生", category: "PoliticsEconomics", estimatedMinutes: 15, difficulty: "Easy", defaultRewardId: "free-10" },
  { id: "tpl-kobun", title: "古文単語20個", completionCriteria: "20語を確認し、意味を答えられる状態にする", category: "Japanese", estimatedMinutes: 10, difficulty: "Easy", defaultRewardId: "free-10" },
];

const initialData: AppData = {
  version: 1,
  units: [],
  rewards: defaultRewards,
  transactions: [],
  templates: defaultTemplates,
  settings: {
    theme: "dark",
    defaultRewardId: "free-15",
    dailyTargetUnits: 3,
    weekStartDay: "monday",
    currency: "JPY",
    notifications: false,
    reduceMotion: false,
  },
};

type AddUnitInput = Partial<Omit<StudyUnit, "id" | "status" | "createdAt">> & Pick<StudyUnit, "title" | "rewardId">;

type StoreValue = {
  data: AppData;
  hydrated: boolean;
  addUnit: (input: AddUnitInput) => string;
  startUnit: (unitId: string) => void;
  pauseUnit: (unitId: string) => void;
  skipUnit: (unitId: string) => void;
  completeUnit: (unitId: string) => void;
  copyUnitToDate: (unitId: string, date: string) => void;
  moveUnit: (unitId: string, date: string) => void;
  deleteUnit: (unitId: string) => void;
  addReward: (reward: Omit<RewardDefinition, "id">) => string;
  useReward: (rewardId: string, amount: number) => boolean;
  addTemplate: (template: Omit<UnitTemplate, "id">) => string;
  deleteTemplate: (templateId: string) => void;
  addFromTemplate: (templateId: string, date?: string) => string | null;
  updateSettings: (patch: Partial<StudySettings>) => void;
  importData: (raw: string) => { ok: boolean; message: string };
  resetData: () => void;
  exportJson: () => void;
  exportCsv: () => void;
  balanceByType: (type: RewardDefinition["type"]) => number;
  rewardBalance: (rewardId: string) => number;
};

const StudyContext = createContext<StoreValue | null>(null);

function sanitize(parsed: unknown): AppData {
  if (!parsed || typeof parsed !== "object") return initialData;
  const p = parsed as Partial<AppData>;
  return {
    ...initialData,
    ...p,
    version: 1,
    units: Array.isArray(p.units) ? p.units : [],
    rewards: Array.isArray(p.rewards) && p.rewards.length ? p.rewards : defaultRewards,
    transactions: Array.isArray(p.transactions) ? p.transactions : [],
    templates: Array.isArray(p.templates) ? p.templates : defaultTemplates,
    settings: { ...initialData.settings, ...(p.settings ?? {}) },
  };
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(sanitize(JSON.parse(raw)));
    } catch {
      // Keep defaults if storage is unreadable.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    document.documentElement.dataset.theme = data.settings.theme;
    document.documentElement.classList.toggle("reduce-motion", data.settings.reduceMotion);
  }, [data, hydrated]);

  const addUnit = useCallback((input: AddUnitInput) => {
    const unitId = id();
    const unit: StudyUnit = {
      id: unitId,
      title: input.title.trim(),
      description: input.description ?? "",
      category: input.category ?? "Other",
      completionCriteria: input.completionCriteria ?? "完了条件を満たす",
      estimatedMinutes: Math.max(1, Number(input.estimatedMinutes ?? 15)),
      difficulty: input.difficulty ?? "Normal",
      rewardId: input.rewardId,
      status: "todo",
      date: input.date ?? localDate(),
      createdAt: nowIso(),
      elapsedMinutes: 0,
      pausedCount: 0,
    };
    setData((d) => ({ ...d, units: [unit, ...d.units] }));
    return unitId;
  }, []);

  const startUnit = useCallback((unitId: string) => {
    setData((d) => ({
      ...d,
      units: d.units.map((u) => u.id === unitId && u.status !== "completed" ? {
        ...u,
        status: "active",
        startedAt: u.startedAt ?? nowIso(),
        activeStartedAt: nowIso(),
      } : u),
    }));
  }, []);

  const pauseUnit = useCallback((unitId: string) => {
    const now = Date.now();
    setData((d) => ({
      ...d,
      units: d.units.map((u) => {
        if (u.id !== unitId || u.status !== "active") return u;
        return {
          ...u,
          status: "todo",
          elapsedMinutes: durationMinutes(u, now),
          activeStartedAt: undefined,
          pausedCount: (u.pausedCount ?? 0) + 1,
        };
      }),
    }));
  }, []);

  const skipUnit = useCallback((unitId: string) => {
    const now = Date.now();
    setData((d) => ({
      ...d,
      units: d.units.map((u) => u.id === unitId ? {
        ...u,
        status: "skipped",
        elapsedMinutes: u.status === "active" ? durationMinutes(u, now) : u.elapsedMinutes,
        activeStartedAt: undefined,
      } : u),
    }));
  }, []);

  const completeUnit = useCallback((unitId: string) => {
    const stamp = nowIso();
    const now = Date.now();
    setData((d) => {
      const unit = d.units.find((u) => u.id === unitId);
      if (!unit || unit.status === "completed") return d;
      const reward = d.rewards.find((r) => r.id === unit.rewardId);
      if (!reward) return d;
      const actualMinutes = Math.max(1, Math.round(durationMinutes(unit, now)) || 1);
      const units = d.units.map((u) => u.id === unitId ? {
        ...u,
        status: "completed" as const,
        completedAt: stamp,
        actualMinutes,
        elapsedMinutes: actualMinutes,
        activeStartedAt: undefined,
      } : u);
      return {
        ...d,
        units,
        transactions: [{ id: id(), rewardId: reward.id, type: "earn" as const, amount: reward.amount, sourceUnitId: unitId, createdAt: stamp }, ...d.transactions],
      };
    });
  }, []);

  const copyUnitToDate = useCallback((unitId: string, date: string) => {
    setData((d) => {
      const source = d.units.find((u) => u.id === unitId);
      if (!source) return d;
      const clone: StudyUnit = {
        ...source,
        id: id(),
        date,
        status: "todo",
        createdAt: nowIso(),
        startedAt: undefined,
        activeStartedAt: undefined,
        completedAt: undefined,
        actualMinutes: undefined,
        elapsedMinutes: 0,
        pausedCount: 0,
      };
      return { ...d, units: [clone, ...d.units] };
    });
  }, []);

  const moveUnit = useCallback((unitId: string, date: string) => {
    setData((d) => ({ ...d, units: d.units.map((u) => u.id === unitId ? { ...u, date, status: u.status === "completed" ? u.status : "todo", activeStartedAt: undefined } : u) }));
  }, []);

  const deleteUnit = useCallback((unitId: string) => {
    setData((d) => ({ ...d, units: d.units.filter((u) => u.id !== unitId) }));
  }, []);

  const addReward = useCallback((reward: Omit<RewardDefinition, "id">) => {
    const rewardId = id();
    setData((d) => ({ ...d, rewards: [...d.rewards, { ...reward, id: rewardId }] }));
    return rewardId;
  }, []);

  const useReward = useCallback((rewardId: string, amount: number) => {
    const requested = Math.max(0, Number(amount));
    const reward = data.rewards.find((r) => r.id === rewardId);
    if (!reward || requested <= 0) return false;
    const available = reward.type === "custom" ? balanceForReward(data, rewardId) : balanceForType(data, reward.type);
    if (requested > available) return false;
    setData((d) => ({
      ...d,
      transactions: [{ id: id(), rewardId, type: "use", amount: requested, createdAt: nowIso() }, ...d.transactions],
    }));
    return true;
  }, [data]);

  const addTemplate = useCallback((template: Omit<UnitTemplate, "id">) => {
    const templateId = id();
    setData((d) => ({ ...d, templates: [...d.templates, { ...template, id: templateId }] }));
    return templateId;
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    setData((d) => ({ ...d, templates: d.templates.filter((t) => t.id !== templateId) }));
  }, []);

  const addFromTemplate = useCallback((templateId: string, date = localDate()) => {
    const template = data.templates.find((t) => t.id === templateId);
    if (!template) return null;
    return addUnit({
      title: template.title,
      completionCriteria: template.completionCriteria,
      category: template.category,
      estimatedMinutes: template.estimatedMinutes,
      difficulty: template.difficulty,
      rewardId: template.defaultRewardId,
      date,
    });
  }, [addUnit, data.templates]);

  const updateSettings = useCallback((patch: Partial<StudySettings>) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })), []);

  const importData = useCallback((raw: string) => {
    try {
      const parsed = sanitize(JSON.parse(raw));
      setData(parsed);
      return { ok: true, message: "Data imported." };
    } catch {
      return { ok: false, message: "That JSON could not be imported." };
    }
  }, []);

  const resetData = useCallback(() => setData(initialData), []);

  const exportJson = useCallback(() => download(`study-unlock-${localDate()}.json`, JSON.stringify(data, null, 2), "application/json"), [data]);

  const exportCsv = useCallback(() => {
    const header = ["id","date","title","category","difficulty","status","estimatedMinutes","actualMinutes","rewardId","startedAt","completedAt"];
    const rows = data.units.map((u) => header.map((k) => csvEscape((u as unknown as Record<string, unknown>)[k])).join(","));
    download(`study-unlock-units-${localDate()}.csv`, [header.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
  }, [data]);

  const balanceByType = useCallback((type: RewardDefinition["type"]) => balanceForType(data, type), [data]);
  const rewardBalance = useCallback((rewardId: string) => balanceForReward(data, rewardId), [data]);

  const value = useMemo<StoreValue>(() => ({
    data, hydrated, addUnit, startUnit, pauseUnit, skipUnit, completeUnit, copyUnitToDate, moveUnit, deleteUnit,
    addReward, useReward, addTemplate, deleteTemplate, addFromTemplate, updateSettings, importData, resetData,
    exportJson, exportCsv, balanceByType, rewardBalance,
  }), [data, hydrated, addUnit, startUnit, pauseUnit, skipUnit, completeUnit, copyUnitToDate, moveUnit, deleteUnit, addReward, useReward, addTemplate, deleteTemplate, addFromTemplate, updateSettings, importData, resetData, exportJson, exportCsv, balanceByType, rewardBalance]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error("useStudy must be used inside StudyProvider");
  return context;
}
