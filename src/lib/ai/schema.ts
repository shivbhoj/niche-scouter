import { z } from "zod";

const pair = z.tuple([z.string(), z.string()]);

export const aiNicheSchema = z.object({
  name: z.string(),
  teaser: z.string(),
  demand: z.number().int().min(1).max(100),
  revenue: z.string(),
  revenueNote: z.string(),
  thesis: z.string(),
  metrics: z.array(pair).length(4),
  trend: z.array(z.number()).length(12),
  trendStart: z.string(),
  trendEnd: z.string(),
  trendNote: z.string(),
  audience: z.string(),
  audienceFacts: z.array(pair).length(3),
  keywords: z.array(z.tuple([z.string(), z.string(), z.string(), z.string()])).min(3).max(5),
  competitors: z.array(z.tuple([z.string(), z.string(), z.string()])).min(2).max(4),
  playbook: z.array(z.tuple([z.string(), z.string(), z.string(), z.string()])).length(3),
  ideas: z.array(z.string()).min(4).max(8),
  sourcing: z.array(z.string()).min(2).max(4),
  risks: z.array(pair).min(2).max(4),
  sources: z.array(z.tuple([z.string(), z.string()])).min(3).max(6),
});

export const aiMarketSchema = z.object({
  niches: z.array(aiNicheSchema).min(3).max(5),
});

export type AiNiche = z.infer<typeof aiNicheSchema>;
