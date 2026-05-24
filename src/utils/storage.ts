import AsyncStorage from '@react-native-async-storage/async-storage';

// --- FINANCE TYPES ---
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  description?: string;
  deadline?: string;
}

// --- JOURNAL TYPES ---
export interface JournalEntry {
  date: string; // YYYY-MM-DD
  content: string;
  mood: 'happy' | 'neutral' | 'sad' | 'stressed' | 'excited' | 'none';
  createdAt: string;
}

// --- WORKOUT TYPES ---
export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface ExerciseLog {
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  splitName: string; // e.g. "Спина + Бицепс"
  exercises: ExerciseLog[];
}

export interface WorkoutSplit {
  id: string;
  name: string;
  exercises: string[];
}

// --- HABIT TYPES ---
export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  completedDates: string[]; // YYYY-MM-DD
}

// --- KEYS ---
const KEYS = {
  TRANSACTIONS: '@custom_app_transactions',
  GOALS: '@custom_app_goals',
  JOURNAL: '@custom_app_journal',
  WORKOUT_SESSIONS: '@custom_app_workout_sessions',
  WORKOUT_SPLITS: '@custom_app_workout_splits',
  HABITS: '@custom_app_habits',
};

// --- DEFAULT WORKOUT SPLITS ---
const DEFAULT_SPLITS: WorkoutSplit[] = [
  {
    id: '1',
    name: 'Спина + Бицепс',
    exercises: [],
  },
  {
    id: '2',
    name: 'Грудь + Трицепс',
    exercises: [],
  },
  {
    id: '3',
    name: 'Ноги + Плечи',
    exercises: [],
  },
];

// --- STORAGE HELPER ---
const save = async <T>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving data for key ${key}:`, e);
  }
};

const load = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error(`Error loading data for key ${key}:`, e);
    return defaultValue;
  }
};

export const Storage = {
  // Finance
  getTransactions: () => load<Transaction[]>(KEYS.TRANSACTIONS, []),
  saveTransactions: (data: Transaction[]) => save(KEYS.TRANSACTIONS, data),
  
  getGoals: () => load<SavingGoal[]>(KEYS.GOALS, []),
  saveGoals: (data: SavingGoal[]) => save(KEYS.GOALS, data),

  // Journal
  getJournalEntries: () => load<Record<string, JournalEntry>>(KEYS.JOURNAL, {}),
  saveJournalEntries: (data: Record<string, JournalEntry>) => save(KEYS.JOURNAL, data),

  // Workout
  getWorkoutSessions: () => load<WorkoutSession[]>(KEYS.WORKOUT_SESSIONS, []),
  saveWorkoutSessions: (data: WorkoutSession[]) => save(KEYS.WORKOUT_SESSIONS, data),

  getWorkoutSplits: async () => {
    const splits = await load<WorkoutSplit[]>(KEYS.WORKOUT_SPLITS, []);
    if (splits.length === 0) {
      await save(KEYS.WORKOUT_SPLITS, DEFAULT_SPLITS);
      return DEFAULT_SPLITS;
    }
    return splits;
  },
  saveWorkoutSplits: (data: WorkoutSplit[]) => save(KEYS.WORKOUT_SPLITS, data),

  // Habits
  getHabits: () => load<Habit[]>(KEYS.HABITS, []),
  saveHabits: (data: Habit[]) => save(KEYS.HABITS, data),
};
