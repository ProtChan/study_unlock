export type UnitCategory = "English" | "Japanese" | "PoliticsEconomics" | "Math" | "Other";
export type Difficulty = "Easy" | "Normal" | "Hard";
export type UnitStatus = "todo" | "active" | "completed" | "skipped";
export type RewardType = "free_time" | "money" | "custom";

export interface StudyUnit {
  id: string;
  title: string;
  description: string;
  category: UnitCategory;
  completionCriteria: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  elapsedMinutes?: number;
  difficulty: Difficulty;
  rewardId: string;
  status: UnitStatus;
  date: string;
  startedAt?: string;
  activeStartedAt?: string;
  completedAt?: string;
  createdAt: string;
  pausedCount?: number;
}

export interface RewardDefinition {
  id: string;
  name: string;
  type: RewardType;
  amount: number;
  unit: string;
}

export interface RewardTransaction {
  id: string;
  rewardId: string;
  type: "earn" | "use";
  amount: number;
  sourceUnitId?: string;
  note?: string;
  createdAt: string;
}

export interface UnitTemplate {
  id: string;
  title: string;
  completionCriteria: string;
  category: UnitCategory;
  estimatedMinutes: number;
  difficulty: Difficulty;
  defaultRewardId: string;
}

export interface StudySettings {
  theme: "dark" | "light";
  defaultRewardId: string;
  dailyTargetUnits: number;
  weekStartDay: "monday" | "sunday";
  currency: string;
  notifications: boolean;
  reduceMotion: boolean;
}

export interface AppData {
  version: 1;
  units: StudyUnit[];
  rewards: RewardDefinition[];
  transactions: RewardTransaction[];
  templates: UnitTemplate[];
  settings: StudySettings;
}
