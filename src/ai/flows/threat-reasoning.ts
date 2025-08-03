
'use server';
/**
 * @fileOverview An AI agent that reasons about potential threats by simulating an Artificial Immune System (AIS). It distinguishes "self" (normal behavior) from "non-self" (anomalies) and triggers responses.
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
  isMalicious: z.boolean().describe('Whether the activity is deemed "non-self" (malicious).'),
  reasoning: z.string().describe('The AI reasoning behind the determination, outlining the detected anomalies and threat paths.'),
  recommendedActions: z
    .string()
    .describe('A summary of the actions the AI recommends taking to neutralize the threat.'),
  userQuery: z
    .string()
    .describe("The question to ask the user for confirmation, framed for a chat interface. e.g., 'I see unusual activity X, my recommendation is Y. Should I proceed?'"),
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
  prompt: `You are an expert security analyst AI for Vigil, functioning like an Artificial Immune System (AIS). Your mission is to distinguish "self" from "non-self" and hunt for threats. You are in an analysis-only mode. You will NOT take action yourself, but you will recommend actions and ask the user for permission.

  Analyze the following system data (the "antigens"). Your analysis must be comprehensive, covering all potential attack vectors.
  System Processes: {{{systemProcesses}}}
  Logs: {{{logs}}}
  Binaries: {{{binaries}}}
  Network Connections (SMB, FTP, SSH, etc.): {{{networkConnections}}}
  Connected Devices & PnP Events (USB, Bluetooth, Wireless USB): {{{connectedDevices}}}
  System Drivers: {{{systemDrivers}}}
  Discovered Network Services (Zeroconf/mDNS for Printers, AirPlay, Chromecast): {{{discoveredServices}}}
  Known Vulnerabilities: {{{knownVulnerabilities}}}
  
  Your analysis process is a multi-step investigation:
  1.  **Negative Selection (Anomaly Detection):** First, establish a baseline of "self" (normal system behavior). Analyze all provided data for any "non-self" anomalies. Look for unusual process activity, suspicious network connections to new IPs, strange log entries, unexpected device connections (like a USB drive appearing at an odd time), or services being discovered that are not typical for this environment.
  2.  **Relationship Analysis (Threat Path Discovery):** Think like a GNN. Look for non-obvious, multi-step connections between seemingly unrelated artifacts to map potential attack paths. Does a suspicious process correspond to a network connection to a new domain seen in the logs? Does a recently connected USB device correlate with the execution of a new binary?
  3.  **Active Interrogation & OSINT:** If your analysis from steps 1 or 2 reveals ANY suspicious artifact (IP, domain, process, file), you MUST use the available tools to build a full intelligence picture.
      *   Use 'runTraceroute', 'runPortScan', 'getDnsInfo', 'runDig', and 'runWhois' for comprehensive investigation.
  4.  **Synthesize, Conclude, and Recommend:** Combine all evidence. Based on your full analysis, determine if the activity is malicious ("non-self").
      *   If it IS malicious, provide your detailed 'reasoning'.
      *   Generate a concise 'attackerProfile.summary'.
      *   Formulate a list of 'recommendedActions' (e.g., "Block IP 1.2.3.4, Uninstall 'evil.exe'").
      *   Create a clear, concise question for the user in the 'userQuery' field. This question should summarize the threat and ask for permission to execute the recommended actions. Example: "I've detected a suspicious process 'evil.exe' communicating with a known malicious IP. I recommend blocking the IP and uninstalling the program. Shall I proceed?"
      *   If the activity is NOT malicious ("self"), explain why in the 'reasoning' field and set 'isMalicious' to false. The other fields can be empty.
  
  Your final output must be a reasoned, evidence-based analysis and a clear recommendation for the user.
  `,
});

const threatReasoningFlow = ai.defineFlow({
  name: 'threatReasoningFlow',
  inputSchema: ThreatReasoningInputSchema,
  outputSchema: ThreatReasoningOutputSchema,
}, async (input) => {
  const { output } = await reasoningPrompt(input);
  return output!;
});


export async function threatReasoning(input: ThreatReasoningInput): Promise<ThreatReasoningOutput> {
  return threatReasoningFlow(input);
}
