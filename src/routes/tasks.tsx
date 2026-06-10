import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Loader2, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";

import { askAI } from "@/lib/ai.functions";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner · CAPACITI AI" },
      { name: "description", content: "Generate structured task plans from any goal." },
    ],
  }),
  component: TaskPlanner,
});

function TaskPlanner() {
  const ai = useServerFn(askAI);
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [constraints, setConstraints] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

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
                "You are a senior project planner. Break a goal into a clear, prioritized plan with phases, tasks, owners (suggested roles), estimated effort, and dependencies. Use markdown headings and checkboxes.",
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

  return (
    <ToolShell
      icon={ListChecks}
      title="Task Planner"
      description="Generate structured plans from a goal."
    >
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-soft border border-border/60 space-y-4">
          <h3 className="font-bold text-foreground">Your project</h3>
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
              rows={6}
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Your plan</h3>
            {output && (
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
            )}
          </div>
          <div className="flex-1 min-h-[420px] rounded-xl bg-brand-surface p-4 text-sm whitespace-pre-wrap leading-relaxed text-foreground/90 font-mono">
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
