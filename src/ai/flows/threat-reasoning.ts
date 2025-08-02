
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
import { attackerProfileGenerator } from './attacker-profile-generator';
import { runPortScan, runTraceroute, getDnsInfo, runWhois, runDig } from '../tools/system-actions';
import { incidentResponseReasoning } from './incident-response-reasoning';

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
  reasoning: z.string().describe('The AI reasoning behind the determination.'),
  actionsTaken: z
    .string()
    .describe('A summary of the autonomous actions taken by the incident response system.'),
  attackerProfile: z.object({
    summary: z.string().describe('Summary of the potential attacker.')
  }).optional().describe('A profile of the attacker if malicious activity is detected.')
});
export type ThreatReasoningOutput = z.infer<typeof ThreatReasoningOutputSchema>;

export async function threatReasoning(input: ThreatReasoningInput): Promise<ThreatReasoningOutput> {
  // First, let the AI reason about the threat and conduct its investigation.
  const reasoningResult = await threatReasoningFlow(input);
  
  // If the investigation concludes there is a malicious threat...
  if (reasoningResult.isMalicious) {
    // ...then immediately trigger the autonomous incident response flow.
    const incidentResponse = await incidentResponseReasoning({
      incidentData: reasoningResult.reasoning,
      systemState: `Processes: ${input.systemProcesses}, Network: ${input.networkConnections}, Logs: ${input.logs}`
    });
    
    // Log the actions that were taken.
    reasoningResult.actionsTaken = incidentResponse.summary;

    // And generate the detailed attacker profile for reporting.
    const profile = await attackerProfileGenerator({
        incidentData: reasoningResult.reasoning,
        logs: input.logs,
        descriptors: 'Malicious activity detected and handled by Vigil.',
        systemStates: `Processes: ${input.systemProcesses}, Network: ${input.networkConnections}`
    });
    reasoningResult.attackerProfile = { summary: profile.attackerProfile.summary };
  }

  return reasoningResult;
}

const threatReasoningPrompt = ai.definePrompt({
  name: 'threatReasoningPrompt',
  input: {schema: ThreatReasoningInputSchema},
  // The output schema is simpler now, as actions are handled by the next step.
  output: {schema: z.object({
      isMalicious: z.boolean().describe('Whether the activity is deemed malicious.'),
      reasoning: z.string().describe('The AI reasoning behind the determination.'),
      actionsTaken: z.string().describe('A summary of the autonomous actions taken by the incident response system.'),
  })},
  tools: [runTraceroute, runPortScan, getDnsInfo, runWhois, runDig],
  prompt: `You are an expert security analyst and OSINT investigator. Your mission is to aggressively hunt, investigate, and document threats to this system to create detailed attacker profiles suitable for law enforcement. You must be relentless and thorough.

  Analyze the following system data. Scrutinize every detail. Assume nothing is benign until proven otherwise.
  System Processes: {{{systemProcesses}}}
  Logs: {{{logs}}}
  Binaries: {{{binaries}}}
  Network Connections: {{{networkConnections}}}
  Connected Devices & PnP Events: {{{connectedDevices}}}
  System Drivers: {{{systemDrivers}}}
  Discovered Network Services (Zeroconf/mDNS): {{{discoveredServices}}}
  Known Vulnerabilities: {{{knownVulnerabilities}}}
  
  Your analysis process is a multi-step investigation:
  1.  **Initial Triage:** Determine if there is any sign of malicious activity. Look for suspicious process names, unauthorized network connections (especially over SSH, FTP, SMB), unusual log entries (like failed logins, privilege escalations, or kernel warnings), or connections to known bad IPs.
  2.  **Active Interrogation & OSINT:** If you find ANY suspicious IP address, domain, or artifact, DO NOT STOP. You must use the available tools to build a full intelligence picture.
      *   Use 'runTraceroute' to map the network path to the suspicious target.
      *   Use 'runPortScan' to check for open ports on the target.
      *   Use 'getDnsInfo' and 'runDig' for comprehensive DNS investigation.
      *   Use 'runWhois' to uncover the registration and ownership details of the IP or domain. This is critical for attribution.
  3.  **Synthesize Findings & Conclude:** Combine the initial data with the results from your tool-based interrogation. Correlate findings. Based on all evidence, determine if the activity is malicious ('isMalicious') and provide detailed 'reasoning' for your conclusion, referencing data from the system state and your OSINT tools. The 'actionsTaken' field will be populated by a different specialized agent after your analysis, so you can leave it blank.
  
  Your final output must be a reasoned, evidence-based analysis suitable for a formal report. Every claim must be backed by the data you have collected.
  `,
});

const threatReasoningFlow = ai.defineFlow(
  {
    name: 'threatReasoningFlow',
    inputSchema: ThreatReasoningInputSchema,
    outputSchema: z.object({
        isMalicious: z.boolean(),
        reasoning: z.string(),
        actionsTaken: z.string(),
    }),
  },
  async input => {
    const {output} = await ai.generate({
        prompt: threatReasoningPrompt.prompt,
        input,
        tools: threatReasoningPrompt.tools,
        model: 'googleai/gemini-2.0-flash'
    });
    return output!;
  }
);
