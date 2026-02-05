export enum FrequencyType {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly'
}

export interface Log {
  id: string;
  date: string; // ISO string
  durationMinutes: number;
  notes: string;
  rating: number; // 1-5
}

export interface Hobby {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., "Creative", "Sports", "Learning"
  icon: string; // Emoji or generic identifier
  targetFrequency: number; // e.g., 3 times
  frequencyType: FrequencyType; // e.g., per Weekly
  logs: Log[];
  createdAt: string;
}

export interface AIAdvice {
  tip: string;
  motivation: string;
  challenge: string;
}

export interface AISuggestion {
  name: string;
  description: string;
  reason: string;
}
