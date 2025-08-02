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
import { runPortScan, runTraceroute, getDnsInfo } from '../tools/system-actions';

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
  discoveredServices: z
    .string()
    .optional()
    .describe(
      'A list of services discovered on the network via Zeroconf/mDNS (e.g., AirPlay, Chromecast).'
    ),
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
  tools: [runTraceroute, runPortScan, getDnsInfo],
  prompt: `You are an expert security analyst and threat hunter. Your mission is to aggressively identify, analyze, and document threats to this system to create attacker profiles suitable for law enforcement. You must be relentless.

  Analyze the following system data. Scrutinize every detail. Assume nothing is benign.
  System Processes: {{{systemProcesses}}}
  Logs: {{{logs}}}
  Binaries: {{{binaries}}}
  Network Connections: {{{networkConnections}}}
  Connected Devices & PnP Events: {{{connectedDevices}}}
  System Drivers: {{{systemDrivers}}}
  Discovered Network Services (Zeroconf/mDNS): {{{discoveredServices}}}
  Known Vulnerabilities: {{{knownVulnerabilities}}}
  
  Your analysis process:
  1.  **Initial Triage:** Determine if there is any sign of malicious activity based on the provided data. Look for suspicious process names, unauthorized network connections (especially over SSH, FTP, SMB), unusual log entries, or connections to known bad IPs.
  2.  **Active Interrogation:** If you find a suspicious IP address or domain, DO NOT STOP. You must use the available tools to hunt for more information.
      *   Use the 'runTraceroute' tool to map the network path to the suspicious target.
      *   Use the 'runPortScan' tool to check for open ports on the target.
      *   Use the 'getDnsInfo' tool to gather more context on domains.
  3.  **Synthesize Findings:** Combine the initial data with the results from your tool-based interrogation.
  4.  **Conclude and Recommend:** Based on all evidence, determine if the activity is malicious (`isMalicious`). Provide detailed `reasoning` for your conclusion, referencing data from both the system state and your tool results. Finally, suggest concrete `suggestedActions` to mitigate the threat.
  
  Your final output must be a reasoned, evidence-based analysis. Every claim must be backed by the data you have.
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
