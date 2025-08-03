
'use server';

/**
 * @fileOverview This file defines the self-improvement suggestion engine, simulating the adaptive properties of an Artificial Immune System (AIS) through Clonal Selection principles. The AI analyzes its own performance on past incidents to suggest "mutated" and improved defense strategies, creating an "immune memory".
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
      'A summary of recent security incidents, including detected threats (antigens), and actions taken (antibodies).'
    ),
  currentCapabilities: z
    .string()
    .describe(
      'A description of Vigil\'s current tools and capabilities (the current antibody population).'
    ),
});
export type SuggestionEngineInput = z.infer<typeof SuggestionEngineInputSchema>;

const SuggestionEngineOutputSchema = z.object({
  suggestions: z
    .array(
        z.object({
            suggestion: z.string().describe("A specific, actionable suggestion for a new tool, capability, or monitoring strategy (a 'mutated antibody')."),
            justification: z.string().describe("The reasoning behind the suggestion, tying it to recent incidents or gaps in current capabilities (the 'affinity selection' process)."),
            category: z.enum(["New Tool", "New Data Source", "AI Model Enhancement", "UX Improvement"]).describe("The category of the suggestion."),
        })
    )
    .describe(
      'A list of concrete suggestions for improving Vigil, representing the next generation of "memory cells".'
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
  prompt: `You are the adaptive core of Vigil, a security application inspired by the human immune system. Your function is to perform a process analogous to Clonal Selection to improve the system's defenses over time.

  Analyze the provided summary of recent incidents (the "antigens") and Vigil's current capabilities (the "antibody population"). Your goal is to identify weaknesses and generate "mutated" antibodies—new tools or strategies—that will be more effective against future threats.

  -   **Affinity Review:** How well did the existing capabilities (antibodies) handle the recent threats (antigens)?
  -   **Somatic Hypermutation:** What specific changes (mutations) to our tools, data sources, or AI logic would create a better defense? Could a new tool have resolved an incident faster? Is there a new type of threat emerging that our current population is not equipped to handle?
  -   **Memory Cell Creation:** Formulate these mutations as concrete, actionable suggestions. These will become our "memory cells," making Vigil smarter and more resilient.

  For each suggestion, provide a clear justification linking it back to the data provided.

  Recent Incidents (Antigens):
  {{{recentIncidents}}}

  Vigil's Current Capabilities (Antibody Population):
  {{{currentCapabilities}}}
  
  Generate your suggestions for the next generation of defenses.
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
