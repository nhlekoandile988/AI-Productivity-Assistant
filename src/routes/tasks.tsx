import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ListChecks,
  Loader2,
  Sparkles,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { askAI } from "@/lib/ai.functions";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner · CAPACITI AI" },
      { name: "description", content: "Plan tasks and generate AI-powered project plans." },
    ],
  }),
  component: TaskPlanner,
});

function extractTasks(markdown: string): string[] {
  const lines = markdown.split("\n");
  const tasks: string[] = [];
  for (const l of lines) {
    const m = l.match(/^\s*[-*]\s*\[\s?\]\s*(.+?)\s*$/i);
    if (m) tasks.push(m[1].replace(/\*\*/g, "").trim());
  }
  if (tasks.length === 0) {
    for (const l of lines) {
      const m = l.match(/^\s*[-*]\s+(.+?)\s*$/);
      if (m) tasks.push(m[1].replace(/\*\*/g, "").trim());
    }
  }
  return tasks.slice(0, 20);
}

function TaskPlanner() {
  const ai = useServerFn(askAI);
  const { state, addTask, toggleTask, deleteTask, addTasksBulk } = useAppStore();

  const [manual, setManual] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [constraints, setConstraints] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const total = state.tasks.length;
  const done = state.tasks.filter((t) => t.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const run = async () => {
    if (!goal.trim()) return toast.error("Add a goal");
    setLoading(true);
    setOutput("");
    try {
      const res = await ai({
        data: {
          messages: [
            {
              role: "system",
              content:
                "You are a senior project planner. Break a goal into a clear, prioritized plan. Use markdown headings and checkbox bullets like '- [ ] task name'. Keep each task short and actionable.",
            },
            {
              role: "user",
              content: `Goal: ${goal}\nDeadline: ${deadline || "Not specified"}\nConstraints / context:\n${constraints || "None"}`,
            },
          ],
        },
      });
      setOutput(res.content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to plan");
    } finally {
      setLoading(false);
    }
  };

  const importFromPlan = () => {
    const tasks = extractTasks(output);
    if (!tasks.length) return toast.error("No tasks found in the plan");
    addTasksBulk(tasks);
    toast.success(`Added ${tasks.length} tasks`);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manual.trim()) return;
    addTask(manual);
    setManual("");
  };

  return (
    <ToolShell
      icon={ListChecks}
      title="Task Planner"
      description="Manage your tasks and generate structured plans with AI."
    >
      {/* My tasks */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-foreground">My Tasks</h3>
            <p className="text-xs text-muted-foreground">
              {total === 0
                ? "No tasks yet"
                : `${done} of ${total} complete · ${pct}%`}
            </p>
          </div>
          <div className="w-48 h-2 rounded-full bg-primary/10 overflow-hidden">
            <div
              className="h-full bg-gradient-brand transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <Button type="submit" variant="brand">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </form>

        <ul className="space-y-2">
          {state.tasks.length === 0 && (
            <li className="text-center py-10 text-sm text-muted-foreground border-2 border-dashed border-border rounded-xl">
              No tasks yet — add one above or generate a plan below.
            </li>
          )}
          {state.tasks.map((t) => (
            <li
              key={t.id}
              className="group flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 hover:bg-brand-surface transition-colors"
            >
              <button
                onClick={() => toggleTask(t.id)}
                className={`h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
                  t.completed
                    ? "bg-gradient-brand border-transparent"
                    : "border-primary/40 hover:border-primary"
                }`}
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
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* AI plan generator */}
      <div className="grid lg:grid-cols-5 gap-6 mt-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-soft border border-border/60 space-y-4">
          <h3 className="font-bold text-foreground">Generate plan with AI</h3>
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Input
              id="goal"
              placeholder="e.g. Launch the Q1 marketing campaign"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              placeholder="e.g. End of February"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="constraints">Constraints / context</Label>
            <Textarea
              id="constraints"
              rows={5}
              placeholder="Team size, budget, must-haves..."
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
          </div>
          <Button variant="hero" className="w-full h-11" onClick={run} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Planning...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Plan
              </>
            )}
          </Button>
        </div>

        <div className="lg:col-span-3 bg-card rounded-2xl p-6 shadow-soft border border-border/60 flex flex-col">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="font-bold text-foreground">Your plan</h3>
            {output && (
              <div className="flex gap-2">
                <Button variant="brand" size="sm" onClick={importFromPlan}>
                  <Wand2 className="h-3.5 w-3.5" /> Add to my tasks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-[360px] rounded-xl bg-brand-surface p-4 text-sm whitespace-pre-wrap leading-relaxed text-foreground/90 font-mono">
            {output || (
              <span className="text-muted-foreground font-sans">
                Your structured plan will appear here.
              </span>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
