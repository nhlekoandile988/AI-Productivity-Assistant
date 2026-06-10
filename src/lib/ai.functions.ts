import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1),
  model: z.string().optional(),
});

export const askAI = createServerFn({ method: "POST" })
  .inputValidator(RequestSchema)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: data.model ?? "google/gemini-2.5-flash",
        messages: data.messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      if (response.status === 429) {
        throw new Error("Rate limit reached. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Add credits to your workspace.");
      }
      throw new Error(`AI request failed (${response.status}): ${errText.slice(0, 200)}`);
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return { content };
  });
