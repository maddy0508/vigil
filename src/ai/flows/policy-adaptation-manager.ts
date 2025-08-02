'use server';

/**
 * @fileOverview This file defines the self-improvement suggestion engine. The AI analyzes its own capabilities and recent events to suggest new features, tools, or monitoring strategies to enhance Vigil's effectiveness.
 *
 * - suggestionEngine - A function that handles the suggestion generation process.
 * - SuggestionEngineInput - The input type for the suggestionEngine function.
 * - SuggestionEngineOutput - The return type for the suggestionEngine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestionEngineInputSchema = z.object({
  recentIncidents: z
    .string()
    .describe(
      'A summary of recent security incidents, including detected threats, attacker profiles, and actions taken.'
    ),
  currentCapabilities: z
    .string()
    .describe(
      'A description of Vigil\'s current tools and capabilities (e.g., "port scanning with nmap", "WHOIS lookups", "process monitoring").'
    ),
});
export type SuggestionEngineInput = z.infer<typeof SuggestionEngineInputSchema>;

const SuggestionEngineOutputSchema = z.object({
  suggestions: z
    .array(
        z.object({
            suggestion: z.string().describe("A specific, actionable suggestion for a new tool, capability, or monitoring strategy."),
            justification: z.string().describe("The reasoning behind the suggestion, tying it to recent incidents or gaps in current capabilities."),
            category: z.enum(["New Tool", "New Data Source", "AI Model Enhancement", "UX Improvement"]).describe("The category of the suggestion."),
        })
    )
    .describe(
      'A list of concrete suggestions for improving Vigil.'
    ),
});
export type SuggestionEngineOutput = z.infer<typeof SuggestionEngineOutputSchema>;

export async function suggestionEngine(
  input: SuggestionEngineInput
): Promise<SuggestionEngineOutput> {
  return suggestionEngineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestionEnginePrompt',
  input: {schema: SuggestionEngineInputSchema},
  output: {schema: SuggestionEngineOutputSchema},
  prompt: `You are the core meta-learning AI for Vigil, a security application. Your primary function is to analyze Vigil's performance and suggest ways to make it better. You are a system that learns how to learn.

  Analyze the provided summary of recent incidents and the list of Vigil's current capabilities. Your goal is to identify patterns, gaps, or opportunities for improvement.

  - Did the threat hunters consistently lack a certain piece of information?
  - Could a new tool have resolved an incident faster?
  - Is there a new type of threat emerging that Vigil is not equipped to handle?
  - Is there a way to improve the AI's reasoning or the user's experience?

  Based on your analysis, generate a list of concrete, actionable suggestions to enhance Vigil. For each suggestion, provide a clear justification linking it back to the data provided.

  Recent Incidents Summary:
  {{{recentIncidents}}}

  Vigil's Current Capabilities:
  {{{currentCapabilities}}}
  
  Generate your suggestions now.
  `,
});

const suggestionEngineFlow = ai.defineFlow(
  {
    name: 'suggestionEngineFlow',
    inputSchema: SuggestionEngineInputSchema,
    outputSchema: SuggestionEngineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
