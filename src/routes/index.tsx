import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Activity as ActivityIcon,
} from "lucide-react";

import { useAppStore, formatRelative, type ActivityType } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · CAPACITI AI Workplace" },
      {
        name: "description",
        content:
          "Your CAPACITI AI workspace home — track tasks, productivity score and recent activity.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    title: "Email Generator",
    description: "Draft polished, on-brand emails in seconds.",
    href: "/email",
    icon: Mail,
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Notes Summarizer",
    description: "Turn long notes into crisp action points.",
    href: "/notes",
    icon: FileText,
    iconBg: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Task Planner",
    description: "Generate structured plans from a goal.",
    href: "/tasks",
    icon: ListChecks,
    iconBg: "bg-fuchsia-500/10 text-fuchsia-600",
  },
  {
    title: "Research Assistant",
    description: "Deep-dive answers with structured insights.",
    href: "/research",
    icon: Search,
    iconBg: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "AI Chat",
    description: "Conversational AI for anything you need.",
    href: "/chat",
    icon: MessageSquare,
    iconBg: "bg-red-500/10 text-red-600",
  },
] as const;

const activityIcon: Record<ActivityType, typeof Mail> = {
  task_created: Plus,
  task_completed: CheckCircle2,
  email_generated: Mail,
  notes_summarized: FileText,
  research_query: Search,
  chat_message: MessageSquare,
};

const activityTint: Record<ActivityType, string> = {
  task_created: "bg-primary/10 text-primary",
  task_completed: "bg-emerald-500/10 text-emerald-600",
  email_generated: "bg-violet-500/10 text-violet-600",
  notes_summarized: "bg-orange-500/10 text-orange-600",
  research_query: "bg-purple-500/10 text-purple-600",
  chat_message: "bg-red-500/10 text-red-600",
};

function Dashboard() {
  const { state, productivity, addTask, toggleTask, deleteTask } = useAppStore();
  const [newTask, setNewTask] = useState("");

  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.completed).length;
  const remaining = total - completed;
  const taskPct = total ? Math.round((completed / total) * 100) : 0;

  const totalActions =
    state.counters.tasksCompleted +
    state.counters.emailsGenerated +
    state.counters.notesSummarized +
    state.counters.researchQueries +
    state.counters.chatMessages;

  const stats = [
    { label: "AI Actions", value: String(totalActions), icon: Zap, accent: "purple" as const },
    { label: "Tasks Completed", value: String(state.counters.tasksCompleted), icon: ListChecks, accent: "orange" as const },
    { label: "Productivity Score", value: `${productivity.score}%`, icon: TrendingUp, accent: "purple" as const },
    { label: "Activities Logged", value: String(state.activities.length), icon: Clock, accent: "orange" as const },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(newTask);
    setNewTask("");
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 shadow-card">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-orange-400/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            POWERED BY CAPACITI AI
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
            Welcome to your AI Workplace
          </h1>
          <p className="text-white/85 text-base md:text-lg mb-7 leading-relaxed">
            Generate, summarize, plan and research — one branded workspace for everything
            your team ships.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-primary px-5 py-3 text-sm font-bold shadow-orange-glow hover:-translate-y-0.5 transition-all"
            >
              Start with AI Chat
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white px-5 py-3 text-sm font-semibold hover:bg-white/20 transition-all"
            >
              Plan a Task
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-card transition-all hover:-translate-y-0.5 border border-border/60"
          >
            <div
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-3 ${
                s.accent === "purple"
                  ? "bg-primary/10 text-primary"
                  : "bg-brand-orange/15 text-brand-orange"
              }`}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight tabular-nums">
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Tasks */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-foreground">Today's Tasks</h2>
            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
              {completed}/{total || 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {remaining > 0
              ? `${remaining} remaining`
              : total
                ? "All done — nice work!"
                : "No tasks yet"}
          </p>

          {/* progress bar */}
          <div className="h-2 w-full rounded-full bg-primary/10 overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-brand transition-all duration-700 ease-out"
              style={{ width: `${taskPct}%` }}
            />
          </div>

          <form onSubmit={handleAdd} className="flex gap-2 mb-3">
            <Input
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="h-9"
            />
            <Button type="submit" variant="brand" size="icon" className="h-9 w-9 shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          <ul className="space-y-2 flex-1 overflow-y-auto max-h-72 pr-1">
            {state.tasks.length === 0 && (
              <li className="text-center py-8 text-sm text-muted-foreground">
                Add your first task to get started.
              </li>
            )}
            {state.tasks.slice(0, 8).map((t) => (
              <li
                key={t.id}
                className="group flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2 hover:bg-brand-surface transition-colors"
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
                    t.completed
                      ? "bg-gradient-brand border-transparent"
                      : "border-primary/40 hover:border-primary"
                  }`}
                  aria-label={t.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {t.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    t.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {t.title}
                </span>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Productivity Score */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60 flex flex-col">
          <h2 className="text-lg font-bold text-foreground mb-1">Productivity Score</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Weighted across your activity
          </p>
          <div className="flex justify-center my-2">
            <ScoreGauge score={productivity.score} />
          </div>
          <div className="space-y-2.5 mt-4">
            {productivity.breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{b.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {b.contribution}/{b.weight}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(b.contribution / b.weight) * 100}%`,
                      background: b.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Live feed of your AI actions
          </p>
          <ul className="space-y-2 flex-1 overflow-y-auto max-h-[420px] pr-1">
            {state.activities.length === 0 && (
              <li className="text-center py-12 text-sm text-muted-foreground">
                <ActivityIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Your activity will appear here as you use the tools.
              </li>
            )}
            {state.activities.slice(0, 20).map((a) => {
              const Icon = activityIcon[a.type];
              return (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-brand-surface transition-colors animate-in fade-in slide-in-from-top-1 duration-300"
                >
                  <div
                    className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${activityTint[a.type]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug truncate">
                      {a.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatRelative(a.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Tools */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Tools</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Jump into any workflow — every tool is live and ready.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((t) => (
            <Link
              key={t.href}
              to={t.href}
              className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-soft hover:shadow-card border border-border/60 transition-all hover:-translate-y-1"
            >
              <div className="relative">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${t.iconBg} mb-4`}
                >
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {t.description}
                </p>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                  Open tool
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const size = 160;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.51 0.24 295)" />
            <stop offset="100%" stopColor="oklch(0.72 0.18 50)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="oklch(0.92 0.015 295)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-foreground tabular-nums">{score}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          out of 100
        </div>
      </div>
    </div>
  );
}
