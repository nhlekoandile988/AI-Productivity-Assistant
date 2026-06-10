import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · CAPACITI AI Workplace" },
      {
        name: "description",
        content:
          "Your CAPACITI AI workspace home — quick access to email, notes, tasks, research and chat.",
      },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "AI Actions Today", value: "248", icon: Zap, accent: "purple" },
  { label: "Time Saved", value: "12.4h", icon: Clock, accent: "orange" },
  { label: "Productivity Lift", value: "+38%", icon: TrendingUp, accent: "purple" },
  { label: "Tasks Completed", value: "57", icon: ListChecks, accent: "orange" },
];

const tools = [
  {
    title: "Email Generator",
    description: "Draft polished, on-brand emails in seconds.",
    href: "/email",
    icon: Mail,
    tint: "from-violet-500/10 to-violet-500/0",
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Notes Summarizer",
    description: "Turn long notes into crisp action points.",
    href: "/notes",
    icon: FileText,
    tint: "from-orange-500/10 to-orange-500/0",
    iconBg: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Task Planner",
    description: "Generate structured plans from a goal.",
    href: "/tasks",
    icon: ListChecks,
    tint: "from-fuchsia-500/10 to-fuchsia-500/0",
    iconBg: "bg-fuchsia-500/10 text-fuchsia-600",
  },
  {
    title: "Research Assistant",
    description: "Deep-dive answers with structured insights.",
    href: "/research",
    icon: Search,
    tint: "from-purple-500/10 to-purple-500/0",
    iconBg: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "AI Chat",
    description: "Conversational AI for anything you need.",
    href: "/chat",
    icon: MessageSquare,
    tint: "from-red-500/10 to-red-500/0",
    iconBg: "bg-red-500/10 text-red-600",
  },
];

function Dashboard() {
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
              to="/email"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white px-5 py-3 text-sm font-semibold hover:bg-white/20 transition-all"
            >
              Draft an Email
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group bg-card rounded-2xl p-5 shadow-soft hover:shadow-card transition-all hover:-translate-y-0.5 border border-border/60"
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
            <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
          </div>
        ))}
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
              className={`group relative overflow-hidden rounded-2xl bg-card p-6 shadow-soft hover:shadow-card border border-border/60 transition-all hover:-translate-y-1`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${t.tint} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
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
