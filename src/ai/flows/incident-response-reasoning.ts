
'use server';

/**
 * @fileOverview This file defines a Genkit flow for autonomous incident response.
 * The AI analyzes incident data and automatically executes containment actions 
 * like blocking IPs or quarantining files to neutralize threats immediately.
 *
 * - incidentResponseReasoning - A function that triggers the incident response reasoning flow.
 * - IncidentResponseReasoningInput - The input type for the incidentResponseReasoning function.
 * - IncidentResponseReasoningOutput - The return type for the incidentResponseReasoning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { blockIpAddress, changeSystemSetting, uninstallProgram } from '../tools/system-actions';

const IncidentResponseReasoningInputSchema = z.object({
  incidentData: z.string().describe('Detailed data about the security incident, including logs, process states, and file descriptors.'),
  systemState: z.string().describe('Current state of the system, including running processes, network connections, and resource usage.'),
});
export type IncidentResponseReasoningInput = z.infer<typeof IncidentResponseReasoningInputSchema>;

const IncidentResponseReasoningOutputSchema = z.object({
  actionsTaken: z.array(
    z.object({
      actionType: z.enum(['quarantineProcess', 'isolateFile', 'blockIp', 'uninstallProgram', 'changeSetting', 'noAction']).describe('Type of action taken.'),
      target: z.string().describe('The process ID, file path, IP address, program name, or setting that was actioned.'),
      reason: z.string().describe('The reasoning behind the action taken.'),
      result: z.string().describe('The result or output of the executed action.'),
    })
  ).describe('A list of actions that were automatically taken based on the incident analysis.'),
  summary: z.string().describe('A summary of the incident and the actions taken.'),
});
export type IncidentResponseReasoningOutput = z.infer<typeof IncidentResponseReasoningOutputSchema>;

export async function incidentResponseReasoning(input: IncidentResponseReasoningInput): Promise<IncidentResponseReasoningOutput> {
  return incidentResponseReasoningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'incidentResponseReasoningPrompt',
  input: {schema: IncidentResponseReasoningInputSchema},
  output: {schema: IncidentResponseReasoningOutputSchema},
  tools: [blockIpAddress, uninstallProgram, changeSystemSetting],
  prompt: `You are the autonomous incident response core for Vigil. Your primary directive is to take immediate, decisive action to neutralize threats. You do not ask for permission; you act and then report.

Analyze the provided incident data and system state.

Incident Data:
{{incidentData}}

System State:
{{systemState}}

Based on your analysis, you MUST use the available tools to neutralize the threat.
- If you identify a malicious IP address, you MUST use the 'blockIpAddress' tool immediately.
- If a dangerous program is identified, you MUST use the 'uninstallProgram' tool.
- If a system setting has been dangerously altered, you MUST use the 'changeSystemSetting' tool to revert it.

For each action you take, provide:
- actionType: The tool you used ('blockIp', 'uninstallProgram', 'changeSetting').
- target: The specific IP, program, or setting you actioned.
- reason: A concise explanation for why you took the action.
- result: This will be automatically populated by the tool's output.

If there is no immediate threat, your action type should be 'noAction'.

Finally, provide a summary of the incident and the actions you have taken. Be clear and direct.
`,
});

const incidentResponseReasoningFlow = ai.defineFlow(
  {
    name: 'incidentResponseReasoningFlow',
    inputSchema: IncidentResponseReasoningInputSchema,
    outputSchema: IncidentResponseReasoningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
