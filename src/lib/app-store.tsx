import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
};

export type ActivityType =
  | "task_created"
  | "task_completed"
  | "email_generated"
  | "notes_summarized"
  | "research_query"
  | "chat_message";

export type Activity = {
  id: string;
  type: ActivityType;
  label: string;
  timestamp: number;
};

type Counters = {
  tasksCompleted: number;
  emailsGenerated: number;
  notesSummarized: number;
  researchQueries: number;
  chatMessages: number;
};

type State = {
  tasks: Task[];
  activities: Activity[];
  counters: Counters;
};

const STORAGE_KEY = "capaciti.workplace.v1";

const initialState: State = {
  tasks: [],
  activities: [],
  counters: {
    tasksCompleted: 0,
    emailsGenerated: 0,
    notesSummarized: 0,
    researchQueries: 0,
    chatMessages: 0,
  },
};

function load(): State {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      tasks: parsed.tasks ?? [],
      activities: parsed.activities ?? [],
      counters: { ...initialState.counters, ...(parsed.counters ?? {}) },
    };
  } catch {
    return initialState;
  }
}

type Ctx = {
  state: State;
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTasksBulk: (titles: string[]) => void;
  logActivity: (type: ActivityType, label: string) => void;
  clearActivities: () => void;
  productivity: {
    score: number;
    breakdown: {
      label: string;
      value: number;
      weight: number;
      contribution: number;
      color: string;
    }[];
  };
};

const AppStoreCtx = createContext<Ctx | null>(null);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  // cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {
          /* noop */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const logActivity = useCallback((type: ActivityType, label: string) => {
    setState((s) => ({
      ...s,
      activities: [
        { id: uid(), type, label, timestamp: Date.now() },
        ...s.activities,
      ].slice(0, 100),
      counters: {
        ...s.counters,
        emailsGenerated:
          s.counters.emailsGenerated + (type === "email_generated" ? 1 : 0),
        notesSummarized:
          s.counters.notesSummarized + (type === "notes_summarized" ? 1 : 0),
        researchQueries:
          s.counters.researchQueries + (type === "research_query" ? 1 : 0),
        chatMessages:
          s.counters.chatMessages + (type === "chat_message" ? 1 : 0),
        tasksCompleted:
          s.counters.tasksCompleted + (type === "task_completed" ? 1 : 0),
      },
    }));
  }, []);

  const addTask = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      tasks: [
        { id: uid(), title: trimmed, completed: false, createdAt: Date.now() },
        ...s.tasks,
      ],
      activities: [
        {
          id: uid(),
          type: "task_created" as ActivityType,
          label: `Created task: ${trimmed}`,
          timestamp: Date.now(),
        },
        ...s.activities,
      ].slice(0, 100),
    }));
  }, []);

  const addTasksBulk = useCallback((titles: string[]) => {
    const clean = titles.map((t) => t.trim()).filter(Boolean);
    if (!clean.length) return;
    const now = Date.now();
    setState((s) => ({
      ...s,
      tasks: [
        ...clean.map((title, i) => ({
          id: uid(),
          title,
          completed: false,
          createdAt: now - i,
        })),
        ...s.tasks,
      ],
      activities: [
        {
          id: uid(),
          type: "task_created" as ActivityType,
          label: `Added ${clean.length} task${clean.length > 1 ? "s" : ""} from a plan`,
          timestamp: now,
        },
        ...s.activities,
      ].slice(0, 100),
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((s) => {
      const task = s.tasks.find((t) => t.id === id);
      if (!task) return s;
      const willComplete = !task.completed;
      const tasks = s.tasks.map((t) =>
        t.id === id
          ? { ...t, completed: willComplete, completedAt: willComplete ? Date.now() : undefined }
          : t,
      );
      const activities = willComplete
        ? [
            {
              id: uid(),
              type: "task_completed" as const,
              label: `Completed task: ${task.title}`,
              timestamp: Date.now(),
            },
            ...s.activities,
          ].slice(0, 100)
        : s.activities;
      const counters = willComplete
        ? { ...s.counters, tasksCompleted: s.counters.tasksCompleted + 1 }
        : s.counters;
      return { tasks, activities, counters };
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const clearActivities = useCallback(() => {
    setState((s) => ({ ...s, activities: [] }));
  }, []);

  const productivity = useMemo(() => {
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter((t) => t.completed).length;
    const taskRate = totalTasks ? completedTasks / totalTasks : 0;

    // Cap each counter at 10 to define "full" contribution
    const norm = (n: number) => Math.min(1, n / 10);
    const emailN = norm(state.counters.emailsGenerated);
    const notesN = norm(state.counters.notesSummarized);
    const researchN = norm(state.counters.researchQueries);

    const breakdown = [
      {
        label: "Task Completion",
        value: taskRate,
        weight: 40,
        contribution: Math.round(taskRate * 40),
        color: "hsl(265 80% 55%)",
      },
      {
        label: "Email Generation",
        value: emailN,
        weight: 25,
        contribution: Math.round(emailN * 25),
        color: "hsl(24 95% 53%)",
      },
      {
        label: "Notes Summaries",
        value: notesN,
        weight: 20,
        contribution: Math.round(notesN * 20),
        color: "hsl(280 85% 60%)",
      },
      {
        label: "Research Queries",
        value: researchN,
        weight: 15,
        contribution: Math.round(researchN * 15),
        color: "hsl(0 84% 60%)",
      },
    ];
    const score = breakdown.reduce((a, b) => a + b.contribution, 0);
    return { score, breakdown };
  }, [state]);

  const value: Ctx = {
    state,
    addTask,
    toggleTask,
    deleteTask,
    addTasksBulk,
    logActivity,
    clearActivities,
    productivity,
  };

  return <AppStoreCtx.Provider value={value}>{children}</AppStoreCtx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreCtx);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 5) return "Just now";
  if (sec < 60) return `${sec} seconds ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 12) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const d = new Date(ts);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (sameDay) return `Today at ${hh}:${mm}`;
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  const isYest =
    d.getFullYear() === yest.getFullYear() &&
    d.getMonth() === yest.getMonth() &&
    d.getDate() === yest.getDate();
  if (isYest) return `Yesterday at ${hh}:${mm}`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ` at ${hh}:${mm}`;
}
