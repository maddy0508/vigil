'use server';
/**
 * @fileOverview A set of tools for the AI to interact with the system.
 * These are simulations and will only log the action taken.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const blockIpAddress = ai.defineTool(
  {
    name: 'blockIpAddress',
    description: 'Blocks a given IP address in the system firewall.',
    inputSchema: z.object({
      ip: z.string().describe('The IP address to block.'),
    }),
    outputSchema: z.string(),
  },
  async ({ ip }) => {
    console.log(`SIMULATION: Blocking IP address ${ip}`);
    return `Successfully blocked IP address: ${ip}`;
  }
);

export const uninstallProgram = ai.defineTool(
  {
    name: 'uninstallProgram',
    description: 'Uninstalls a program or application from the system.',
    inputSchema: z.object({
      programName: z.string().describe('The name of the program to uninstall.'),
    }),
    outputSchema: z.string(),
  },
  async ({ programName }) => {
    console.log(`SIMULATION: Uninstalling program ${programName}`);
    return `Successfully uninstalled program: ${programName}`;
  }
);

export const changeSystemSetting = ai.defineTool(
  {
    name: 'changeSystemSetting',
    description: 'Changes a system setting.',
    inputSchema: z.object({
      setting: z.string().describe('The name of the setting to change.'),
      value: z.string().describe('The new value for the setting.'),
    }),
    outputSchema: z.string(),
  },
  async ({ setting, value }) => {
    console.log(`SIMULATION: Changing setting '${setting}' to '${value}'`);
    return `Successfully changed setting '${setting}' to '${value}'`;
  }
);
