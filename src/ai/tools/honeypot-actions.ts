'use server';
/**
 * @fileOverview A set of AI tools for deploying and managing dynamic honeypots.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// In-memory store to simulate active honeypots and their logs
const activeHoneypots: Record<string, any[]> = {};

function getSimulatedLog(honeypotId: string, port: string, service: string): any {
    const attackers = ['91.241.19.140', '103.77.108.212', '45.148.10.134'];
    const commands = ['ls -la', 'cat /etc/passwd', 'uname -a', 'whoami'];
    const actions = ['allow_and_log', 'divert_to_decoy', 'block'];
    
    const attacker_ip = attackers[Math.floor(Math.random() * attackers.length)];
    const interaction = commands[Math.floor(Math.random() * commands.length)];

    // Simple RL-like logic simulation
    let action_taken = actions[Math.floor(Math.random() * actions.length)];
    if (interaction.includes('passwd')) {
        action_taken = 'divert_to_decoy';
    }

    const logEntry = {
        honeypot_id: honeypotId,
        attacker_ip,
        interaction,
        action_taken,
        service,
        port,
        timestamp: new Date().toISOString(),
    };
    
    if (!activeHoneypots[honeypotId]) {
        activeHoneypots[honeypotId] = [];
    }
    activeHoneypots[honeypotId].push(logEntry);

    return logEntry;
}

export const deployHoneypot = ai.defineTool(
  {
    name: 'deployHoneypot',
    description: 'Deploys a dynamic, intelligent honeypot on a specific port to act as a decoy for attackers. Returns the ID of the deployed honeypot.',
    inputSchema: z.object({
      port: z.string().describe('The network port to listen on (e.g., "2222").'),
      service: z.string().describe('The service to mimic (e.g., "SSH", "HTTP", "FTP").'),
    }),
    outputSchema: z.object({
      honeypotId: z.string(),
      status: z.string(),
    }),
  },
  async ({ port, service }) => {
    const honeypotId = `honeypot-${service.toLowerCase()}-${port}-${Math.floor(Math.random() * 1000)}`;
    
    // Simulate initial logs
    getSimulatedLog(honeypotId, port, service);
    
    return {
      honeypotId,
      status: `Successfully deployed ${service} honeypot on port ${port}. ID: ${honeypotId}`,
    };
  }
);

export const checkHoneypotLogs = ai.defineTool(
  {
    name: 'checkHoneypotLogs',
    description: 'Checks for and returns the latest interaction logs from a deployed honeypot.',
    inputSchema: z.object({
      honeypotId: z.string().describe('The ID of the honeypot to check.'),
    }),
    outputSchema: z.object({
      logs: z.array(z.any()).describe("An array of log objects from the honeypot."),
    }),
  },
  async ({ honeypotId }) => {
    // Simulate new logs being generated since the last check
    const honeypot = activeHoneypots[honeypotId];
    if (honeypot && honeypot.length > 0) {
        const port = honeypot[0].port;
        const service = honeypot[0].service;
        getSimulatedLog(honeypotId, port, service);
    }
    
    const logs = activeHoneypots[honeypotId] || [];
    return { logs };
  }
);
