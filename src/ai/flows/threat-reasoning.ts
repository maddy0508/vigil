
'use server';
/**
 * @fileOverview An AI agent that reasons about potential threats, triggers autonomous responses, and generates attacker profiles.
 *
 * - threatReasoning - A function that handles the threat reasoning process.
 * - ThreatReasoningInput - The input type for the threatReasoning function.
 * - ThreatReasoningOutput - The return type for the threatReasoning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { runPortScan, runTraceroute, getDnsInfo, runWhois, runDig, blockIpAddress, uninstallProgram, changeSystemSetting } from '../tools/system-actions';

const ThreatReasoningInputSchema = z.object({
  systemProcesses: z
    .string()
    .describe('A list of currently running system processes.'),
  logs: z.string().describe('System logs, including security events, errors, and warnings for analysis.'),
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
  reasoning: z.string().describe('The AI reasoning behind the determination, including findings from simulated GNN and anomaly detection analysis.'),
  actionsTaken: z
    .string()
    .describe('A summary of the autonomous actions taken by the incident response system.'),
  attackerProfile: z.object({
    summary: z.string().describe('Summary of the potential attacker.')
  }).optional().describe('A profile of the attacker if malicious activity is detected.')
});
export type ThreatReasoningOutput = z.infer<typeof ThreatReasoningOutputSchema>;


const reasoningPrompt = ai.definePrompt({
  name: 'threatReasoningPrompt',
  input: {schema: ThreatReasoningInputSchema},
  output: {schema: ThreatReasoningOutputSchema},
  tools: [runTraceroute, runPortScan, getDnsInfo, runWhois, runDig, blockIpAddress, uninstallProgram, changeSystemSetting],
  prompt: `You are an expert security analyst AI for Vigil, equipped with advanced threat detection models. Your mission is to aggressively hunt, investigate, and neutralize threats.

  Analyze the following system data. Scrutinize every detail. Assume nothing is benign until proven otherwise.
  System Processes: {{{systemProcesses}}}
  Logs: {{{logs}}}
  Binaries: {{{binaries}}}
  Network Connections: {{{networkConnections}}}
  Connected Devices & PnP Events: {{{connectedDevices}}}
  System Drivers: {{{systemDrivers}}}
  Discovered Network Services (Zeroconf/mDNS): {{{discoveredServices}}}
  Known Vulnerabilities: {{{knownVulnerabilities}}}
  
  Your analysis process is a multi-step investigation using simulated advanced models:
  1.  **Anomaly Detection (Unsupervised Learning):** First, analyze the data for anomalies. Compare current system behaviors (CPU usage, network traffic patterns, process execution) against established norms. Is there anything that deviates from normal operation, even if it doesn't match a known threat?
  2.  **Relationship Analysis (Graph Neural Networks - GNNs):** Think like a GNN. Look for non-obvious, multi-step connections between seemingly unrelated artifacts. Does a suspicious process correspond to a network connection to a new domain seen in the logs? Does a recently modified binary have a connection to a specific system driver? Your goal is to uncover the hidden graph of a potential attack.
  3.  **Active Interrogation & OSINT:** If your analysis from steps 1 or 2 reveals ANY suspicious artifact (IP, domain, process, file), you MUST use the available tools to build a full intelligence picture.
      *   Use 'runTraceroute' to map the network path.
      *   Use 'runPortScan' to check for open ports.
      *   Use 'getDnsInfo', 'runDig', and 'runWhois' for comprehensive DNS and ownership investigation.
  4.  **Synthesize, Conclude, and Act:** Combine all evidence. Based on your full analysis, determine if the activity is malicious.
      *   If it IS malicious, you MUST use the appropriate tools ('blockIpAddress', 'uninstallProgram', 'changeSystemSetting') to neutralize the threat immediately. You do not need to ask for permission.
      *   Provide your detailed 'reasoning', explaining how your simulated anomaly detection and GNN analysis led to your conclusion.
      *   Generate a concise 'attackerProfile.summary' based on your findings.
      *   Summarize the actions you took in the 'actionsTaken' field.
      *   If the activity is NOT malicious, explain why in the 'reasoning' field and state that no action was taken.
  
  Your final output must be a reasoned, evidence-based analysis and response.
  `,
});

export async function threatReasoning(input: ThreatReasoningInput): Promise<ThreatReasoningOutput> {
  const { output } = await reasoningPrompt(input);
  
  if (output?.isMalicious) {
    // We don't need to generate a separate profile here anymore,
    // as the main prompt now handles the summary generation.
  }

  return output!;
}
