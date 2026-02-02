export interface MaxDiffState {
  totalItems: number;
  itemsPerScreen: number;
  nScreens: number;
  sampleSize: number;
}

export interface Attribute {
  id: string;
  name: string;
  levels: number;
}

export type DesignMethod = 'complete' | 'shortcut' | 'random' | 'balanced';

export interface ConjointState {
  attributes: Attribute[];
  nTasks: number;
  conceptsPerTask: number;
  sampleSize: number;
  percentNone: number;
  designMethod: DesignMethod;
}

export enum DesignStatus {
  CRITICAL = 'Critical',
  POOR = 'Poor',
  ACCEPTABLE = 'Acceptable',
  EXCELLENT = 'Excellent',
}

export interface ValidationResult {
  status: DesignStatus;
  message: string;
  score: number; // 0 to 100 normalized
}
