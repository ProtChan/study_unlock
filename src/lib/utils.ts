import type { AppData, Difficulty, RewardDefinition, StudyUnit } from "./types";

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

export function localDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localDate(d);
}

export function formatClock(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function formatReward(reward?: RewardDefinition, amount?: number) {
  if (!reward) return "No reward";
  const value = amount ?? reward.amount;
  if (reward.type === "free_time") return `${value} min ${reward.name.replace(/^\d+\s*min\s*/i, "") || "Free Time"}`.trim();
  if (reward.type === "money") return `¥${value.toLocaleString()} ${reward.name === "Money" ? "" : reward.name}`.trim();
  return value === 1 ? reward.name : `${reward.name} ×${value}`;
}

export function balanceForType(data: AppData, type: RewardDefinition["type"]) {
  const ids = new Set(data.rewards.filter((r) => r.type === type).map((r) => r.id));
  return data.transactions.reduce((sum, tx) => {
    if (!ids.has(tx.rewardId)) return sum;
    return sum + (tx.type === "earn" ? tx.amount : -tx.amount);
  }, 0);
}

export function balanceForReward(data: AppData, rewardId: string) {
  return data.transactions.reduce((sum, tx) => {
    if (tx.rewardId !== rewardId) return sum;
    return sum + (tx.type === "earn" ? tx.amount : -tx.amount);
  }, 0);
}

const difficultyRank: Record<Difficulty, number> = { Easy: 0, Normal: 1, Hard: 2 };

export function recommendedUnit(units: StudyUnit[], date = localDate()) {
  const active = units.find((u) => u.date === date && u.status === "active");
  if (active) return active;
  return [...units]
    .filter((u) => u.date === date && u.status === "todo")
    .sort((a, b) =>
      difficultyRank[a.difficulty] - difficultyRank[b.difficulty] ||
      a.estimatedMinutes - b.estimatedMinutes ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];
}

export function durationMinutes(unit: StudyUnit, now = Date.now()) {
  const carried = unit.elapsedMinutes ?? 0;
  if (!unit.activeStartedAt) return Math.max(0, carried);
  return Math.max(0, carried + (now - new Date(unit.activeStartedAt).getTime()) / 60000);
}

export function csvEscape(value: unknown) {
  const s = String(value ?? "");
  return `"${s.replaceAll('"', '""')}"`;
}
