import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { askAI } from "@/lib/ai.functions";
import { useAppStore } from "@/lib/app-store";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Generator · CAPACITI AI" },
      { name: "description", content: "Draft polished, on-brand emails with CAPACITI AI." },
    ],
  }),
  component: EmailGenerator,
});

function EmailGenerator() {
  const ai = useServerFn(askAI);
  const { logActivity } = useAppStore();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState("professional");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!context.trim()) return toast.error("Add some context for the email");
    setLoading(true);
    setOutput("");
    try {
      const res = await ai({
        data: {
          messages: [
            {
              role: "system",
              content:
                "You are an expert business email writer. Produce clear, well-structured emails with a greeting, body and sign-off. Output only the email text.",
            },
            {
              role: "user",
              content: `Write an email.\nRecipient: ${recipient || "the recipient"}\nSubject: ${
                subject || "(infer one)"
              }\nTone: ${tone}\nContext / what to say:\n${context}`,
            },
          ],
        },
      });
      setOutput(res.content);
      logActivity("email_generated", `Generated email${subject ? `: ${subject}` : recipient ? ` to ${recipient}` : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <ToolShell
      icon={Mail}
      title="Email Generator"
      description="Draft polished, on-brand emails in seconds."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60 space-y-4">
          <h3 className="font-bold text-foreground">Email details</h3>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="e.g. Sarah, hiring manager"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              placeholder="Leave blank for AI to suggest"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
                <SelectItem value="apologetic">Apologetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctx">What's the email about?</Label>
            <Textarea
              id="ctx"
              rows={6}
              placeholder="Describe the situation, key points, requests..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <Button variant="hero" className="w-full h-11" onClick={generate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Email
              </>
            )}
          </Button>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Generated email</h3>
            {output && (
              <Button variant="outline" size="sm" onClick={copy}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            )}
          </div>
          <div className="flex-1 min-h-[320px] rounded-xl bg-brand-surface p-4 text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
            {output || (
              <span className="text-muted-foreground">
                Your generated email will appear here.
              </span>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
