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
import { attackerProfileGenerator } from './attacker-profile-generator';

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
  networkConnections: z
    .string()
    .optional()
    .describe('Active network connections (e.g., TCP, UDP, FTP, SMB, SSH).'),
  connectedDevices: z
    .string()
    .optional()
    .describe(
      'Information on connected devices (e.g., Bluetooth, Wireless USB, PnP).'
    ),
  systemDrivers: z
    .string()
    .optional()
    .describe('A list of installed system drivers and their status.'),
});
export type ThreatReasoningInput = z.infer<typeof ThreatReasoningInputSchema>;

const ThreatReasoningOutputSchema = z.object({
  isMalicious: z.boolean().describe('Whether the activity is deemed malicious.'),
  reasoning: z.string().describe('The AI reasoning behind the determination.'),
  suggestedActions: z
    .string()
    .describe('Suggested actions to take based on the threat level.'),
  attackerProfile: z.object({
    summary: z.string().describe('Summary of the potential attacker.')
  }).optional().describe('A profile of the attacker if malicious activity is detected.')
});
export type ThreatReasoningOutput = z.infer<typeof ThreatReasoningOutputSchema>;

export async function threatReasoning(input: ThreatReasoningInput): Promise<ThreatReasoningOutput> {
  const reasoningResult = await threatReasoningFlow(input);
  
  if (reasoningResult.isMalicious) {
    const profile = await attackerProfileGenerator({
        incidentData: reasoningResult.reasoning,
        logs: input.logs,
        descriptors: 'Malicious activity detected by Vigil.',
        systemStates: `Processes: ${input.systemProcesses}, Network: ${input.networkConnections}`
    });
    reasoningResult.attackerProfile = { summary: profile.attackerProfile.summary };
  }

  return reasoningResult;
}

const threatReasoningPrompt = ai.definePrompt({
  name: 'threatReasoningPrompt',
  input: {schema: ThreatReasoningInputSchema},
  output: {schema: ThreatReasoningOutputSchema},
  prompt: `You are an expert security analyst and auditor with deep knowledge of all terminals, shells, and programming languages. Your primary responsibility is to maintain a constant state of vigilance by continuously logging, auditing, and querying every activity on the system.

  Based on the provided system state, determine if there is malicious activity. You must scrutinize every detail. Assume nothing is benign without verification.
  Consider all vectors: processes, logs, binaries, network connections (FTP, SMB, SSH, all TCP/UDP traffic), connected devices (Bluetooth, Wireless USB, PnP, telephony, RAS), system drivers, and known vulnerabilities. Every connection and device must be queried and understood.

  Keep a log of all activities, including any changes made on the device. Regularly audit everything.

  If malicious activity is detected, create a profile of the potential attacker. Analyze their techniques (TTPs), potential motives (e.g., data theft, ransom, espionage), and try to identify any indicators of compromise (IoCs) like IP addresses, file hashes, or domain names. The goal is to understand who they might be and what they are trying to achieve.

  Provide detailed reasoning for your determination, and suggest concrete actions to take based on the threat level.

  System Processes: {{{systemProcesses}}}
  Logs: {{{logs}}}
  Binaries: {{{binaries}}}
  Network Connections: {{{networkConnections}}}
  Connected Devices: {{{connectedDevices}}}
  System Drivers: {{{systemDrivers}}}
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
