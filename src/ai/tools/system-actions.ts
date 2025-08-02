'use server';
/**
 * @fileOverview A set of tools for the AI to interact with the system via Electron.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// This function will be called from the renderer process (our Next.js app)
// but it will execute in the main Electron process, which has Node.js access.
async function executeCommand(command: string): Promise<string> {
  // window.electronAPI is exposed by the preload script
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return (window as any).electronAPI.executeCommand(command);
  }
  // Fallback for non-Electron environment (e.g. testing in browser)
  console.log(`[SIMULATION] Would execute: ${command}`);
  return `Simulated execution of: ${command}`;
}

export const blockIpAddress = ai.defineTool(
  {
    name: 'blockIpAddress',
    description: 'Blocks a given IP address in the system firewall. This requires admin privileges.',
    inputSchema: z.object({
      ip: z.string().describe('The IP address to block.'),
    }),
    outputSchema: z.string(),
  },
  async ({ ip }) => {
    let command;
    if (process.platform === 'win32') {
      // Command for Windows Firewall
      command = `netsh advfirewall firewall add rule name="Block ${ip}" dir=in action=block remoteip=${ip}`;
    } else {
      // Command for UFW (Uncomplicated Firewall) on Debian/Ubuntu-based systems.
      command = `sudo ufw insert 1 deny from ${ip} to any`;
    }
    return executeCommand(command);
  }
);

export const uninstallProgram = ai.defineTool(
  {
    name: 'uninstallProgram',
    description: 'Uninstalls a program or application from the system using its exact name.',
    inputSchema: z.object({
      programName: z.string().describe('The exact name of the program to uninstall.'),
    }),
    outputSchema: z.string(),
  },
  async ({ programName }) => {
    // This is a simplified example. Real-world uninstallation is much more complex
    // and platform-specific.
    let command;
     if (process.platform === 'win32') {
        command = `echo "This is a placeholder for uninstalling ${programName} on Windows. Manual action is likely required."`;
    } else {
        command = `echo "This is a placeholder for uninstalling ${programName} on Linux. Manual action is likely required."`;
    }
    return executeCommand(command);
  }
);

export const changeSystemSetting = ai.defineTool(
  {
    name: 'changeSystemSetting',
    description: 'Changes a system setting. This is a high-risk operation.',
    inputSchema: z.object({
      setting: z.string().describe('The name of the setting to change.'),
      value: z.string().describe('The new value for the setting.'),
    }),
    outputSchema: z.string(),
  },
  async ({ setting, value }) => {
    const command = `echo "Setting ${setting} to ${value}"`;
    return executeCommand(command);
  }
);
