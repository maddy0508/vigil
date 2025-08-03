
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
    .describe('Detailed incident data including AI reasoning, logs, and system states.'),
  logs: z.string().describe('System logs related to the incident.'),
  descriptors: z.string().describe('A high-level descriptor of the incident.'),
  systemStates: z.string().describe('The states of the system during the incident.'),
});
export type AttackerProfileGeneratorInput =
  z.infer<typeof AttackerProfileGeneratorInputSchema>;

const AttackerProfileGeneratorOutputSchema = z.object({
  attackerProfile: z.object({
    threatLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The assessed threat level.'),
    techniques: z.array(z.string()).describe('Observed attacker techniques, tactics, and procedures (TTPs). This is their "behavioral fingerprint".'),
    motives: z.array(z.string()).describe('Potential motives of the attacker (e.g., financial, espionage, disruption).'),
    indicatorsOfCompromise: z.array(z.string()).describe('Specific indicators of compromise (IoCs) like IP addresses, file hashes, or domains. These are the "virtual airtags".'),
    summary: z.string().describe('A summary of the attacker profile suitable for a law enforcement report.'),
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
  prompt: `You are an expert cybersecurity analyst creating a detailed attacker profile for a law enforcement report.
  Analyze the provided incident data, logs, descriptors, and system states to construct a comprehensive profile. Your goal is to create a "virtual airtag" by identifying the adversary's unique behavioral fingerprint.

  Incident Data: {{{incidentData}}}
  Logs: {{{logs}}}
  Descriptors: {{{descriptors}}}
  System States: {{{systemStates}}}
  
  Your report must contain:
  - A clear assessment of the threat level.
  - A list of observed techniques, tactics, and procedures (TTPs). Analyze the sequence of actions to identify the attacker's unique methods. This is their "behavioral fingerprint".
  - A list of potential motives.
  - A list of concrete Indicators of Compromise (IoCs). This is the most critical part of the "virtual airtag". Extract every IP address, domain name, file hash, or suspicious username you can find.
  - A professional summary of the attacker and the incident, written in a tone appropriate for law enforcement.
  `,
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
