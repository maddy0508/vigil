'use server';

/**
 * @fileOverview A flow for generating attacker profiles based on incident data.
 *
 * - attackerProfileGenerator - A function that generates an attacker profile.
 * - AttackerProfileGeneratorInput - The input type for the attackerProfileGenerator function.
 * - AttackerProfileGeneratorOutput - The return type for the attackerProfileGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttackerProfileGeneratorInputSchema = z.object({
  incidentData: z
    .string()
    .describe('Detailed incident data including logs and system states.'),
  logs: z.string().describe('System logs related to the incident.'),
  descriptors: z.string().describe('Descriptors of the incident.'),
  systemStates: z.string().describe('The states of the system during the incident.'),
});
export type AttackerProfileGeneratorInput =
  z.infer<typeof AttackerProfileGeneratorInputSchema>;

const AttackerProfileGeneratorOutputSchema = z.object({
  attackerProfile: z.object({
    techniques: z.array(z.string()).describe('Techniques used by the attacker.'),
    motives: z.array(z.string()).describe('Potential motives of the attacker.'),
    summary: z.string().describe('A summary of the attacker profile.'),
  }),
});
export type AttackerProfileGeneratorOutput =
  z.infer<typeof AttackerProfileGeneratorOutputSchema>;

export async function attackerProfileGenerator(
  input: AttackerProfileGeneratorInput
): Promise<AttackerProfileGeneratorOutput> {
  return attackerProfileGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'attackerProfileGeneratorPrompt',
  input: {schema: AttackerProfileGeneratorInputSchema},
  output: {schema: AttackerProfileGeneratorOutputSchema},
  prompt: `You are an expert cybersecurity analyst. Analyze the provided incident data, logs,
descriptors, and system states to construct a comprehensive attacker profile.

Identify the techniques used by the attacker, potential motives, and provide a summary of the
attacker profile.

Incident Data: {{{incidentData}}}
Logs: {{{logs}}}
Descriptors: {{{descriptors}}}
System States: {{{systemStates}}}`,
});

const attackerProfileGeneratorFlow = ai.defineFlow(
  {
    name: 'attackerProfileGeneratorFlow',
    inputSchema: AttackerProfileGeneratorInputSchema,
    outputSchema: AttackerProfileGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
