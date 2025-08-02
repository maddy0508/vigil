// threat-simulator.ts
'use server';
/**
 * @fileOverview An AI agent that simulates potential threats.
 *
 * - threatSimulator - A function that simulates a threat scenario.
 * - ThreatSimulatorOutput - The return type for the threatSimulator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ThreatReasoningInput } from './threat-reasoning';

const ThreatSimulatorOutputSchema = z.object({
  systemProcesses: z
    .string()
    .describe('A list of currently running system processes.'),
  logs: z.string().describe('System logs for analysis.'),
  binaries: z.string().describe('List of recently accessed or modified binaries.'),
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
export type ThreatSimulatorOutput = z.infer<typeof ThreatSimulatorOutputSchema>;

export async function threatSimulator(): Promise<ThreatSimulatorOutput> {
  return threatSimulatorFlow();
}

const threatSimulatorPrompt = ai.definePrompt({
    name: 'threatSimulatorPrompt',
    output: {schema: ThreatSimulatorOutputSchema},
    prompt: `You are a creative security threat simulator. Your task is to generate a realistic, yet simulated, security event scenario. This scenario will be used to test the Vigil AI's detection and reasoning capabilities.

Create a scenario that includes details for the following fields: systemProcesses, logs, and binaries. You can optionally include details for networkConnections, connectedDevices, systemDrivers, and discoveredServices.

Make the scenarios interesting and varied. Here are some ideas:
- A user downloading and running an unsigned binary from an untrusted source.
- A process attempting to connect to a known command-and-control (C2) server IP address.
- An SQL injection attempt being logged by a web server.
- A script trying to escalate privileges by modifying system files.
- A device connecting via Bluetooth and attempting to access sensitive data.
- A malicious driver being installed.
- A rouge service appearing on the network via mDNS.

Provide a concise but detailed output in JSON format that adheres to the specified schema. Do not include any explanatory text, only the JSON object.`,
});

const threatSimulatorFlow = ai.defineFlow(
  {
    name: 'threatSimulatorFlow',
    outputSchema: ThreatSimulatorOutputSchema,
  },
  async () => {
    const {output} = await threatSimulatorPrompt();
    return output!;
  }
);
