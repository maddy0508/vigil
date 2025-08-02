// threat-reasoning.ts
'use server';
/**
 * @fileOverview An AI agent that reasons about potential threats.
 *
 * - threatReasoning - A function that handles the threat reasoning process.
 * - ThreatReasoningInput - The input type for the threatReasoning function.
 * - ThreatReasoningOutput - The return type for the threatReasoning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ThreatReasoningInputSchema = z.object({
  systemProcesses: z
    .string()
    .describe('A list of currently running system processes.'),
  logs: z.string().describe('System logs for analysis.'),
  binaries: z.string().describe('List of recently accessed or modified binaries.'),
  knownVulnerabilities: z
    .string()
    .optional()
    .describe('List of known vulnerabilities.'),
});
export type ThreatReasoningInput = z.infer<typeof ThreatReasoningInputSchema>;

const ThreatReasoningOutputSchema = z.object({
  isMalicious: z.boolean().describe('Whether the activity is deemed malicious.'),
  reasoning: z.string().describe('The AI reasoning behind the determination.'),
  suggestedActions: z
    .string()
    .describe('Suggested actions to take based on the threat level.'),
});
export type ThreatReasoningOutput = z.infer<typeof ThreatReasoningOutputSchema>;

export async function threatReasoning(input: ThreatReasoningInput): Promise<ThreatReasoningOutput> {
  return threatReasoningFlow(input);
}

const threatReasoningPrompt = ai.definePrompt({
  name: 'threatReasoningPrompt',
  input: {schema: ThreatReasoningInputSchema},
  output: {schema: ThreatReasoningOutputSchema},
  prompt: `You are an expert security analyst whose job is to determine if a system is under attack.

  Based on the system processes, logs, and binaries, determine if there is malicious activity.
  Also take into account any known vulnerabilities that may be present.

  Provide reasoning for your determination, and suggest actions to take based on the threat level.

  System Processes: {{{systemProcesses}}}
  Logs: {{{logs}}}
  Binaries: {{{binaries}}}
  Known Vulnerabilities: {{{knownVulnerabilities}}}
  \nSet isMalicious to true or false.\nReason about why you are setting to true or false.\nSuggest actions to take.
  `,
});

const threatReasoningFlow = ai.defineFlow(
  {
    name: 'threatReasoningFlow',
    inputSchema: ThreatReasoningInputSchema,
    outputSchema: ThreatReasoningOutputSchema,
  },
  async input => {
    const {output} = await threatReasoningPrompt(input);
    return output!;
  }
);
