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

export const runTraceroute = ai.defineTool(
  {
    name: 'runTraceroute',
    description: 'Performs a traceroute to a given IP address or hostname to map the network path.',
    inputSchema: z.object({
      target: z.string().describe('The IP address or hostname to trace.'),
    }),
    outputSchema: z.string(),
  },
  async ({ target }) => {
    // Use `tracert` on Windows and `traceroute` on Linux/macOS
    const command = process.platform === 'win32' ? `tracert ${target}` : `traceroute ${target}`;
    return executeCommand(command);
  }
);

export const runPortScan = ai.defineTool(
  {
    name: 'runPortScan',
    description: "Runs a port scan against a target IP address to find open ports. Requires 'nmap' to be installed.",
    inputSchema: z.object({
      target: z.string().describe('The IP address to scan.'),
    }),
    outputSchema: z.string(),
  },
  async ({ target }) => {
    // nmap is a powerful network scanning tool. It needs to be installed on the system.
    const command = `nmap -F ${target}`; // -F for fast scan (common ports)
    return executeCommand(command).catch(error => {
      if (error.message.includes('command not found')) {
        return "Error: 'nmap' command not found. Please install 'nmap' to enable port scanning.";
      }
      throw error;
    });
  }
);

export const getDnsInfo = ai.defineTool(
  {
    name: 'getDnsInfo',
    description: 'Retrieves DNS information (e.g., A, MX, NS records) for a given domain using `nslookup`.',
    inputSchema: z.object({
      domain: z.string().describe('The domain to lookup.'),
    }),
    outputSchema: z.string(),
  },
  async ({ domain }) => {
    const command = `nslookup ${domain}`;
    return executeCommand(command);
  }
);

export const runWhois = ai.defineTool(
  {
    name: 'runWhois',
    description: 'Performs a WHOIS lookup for a domain or IP address to get registration and ownership information.',
    inputSchema: z.object({
      target: z.string().describe('The domain name or IP address.'),
    }),
    outputSchema: z.string(),
  },
  async ({ target }) => {
    const command = `whois ${target}`;
    return executeCommand(command).catch(error => {
      if (error.message.includes('command not found')) {
        return "Error: 'whois' command not found. Please install 'whois' on your system.";
      }
      throw error;
    });
  }
);

export const runDig = ai.defineTool(
  {
    name: 'runDig',
    description: 'Performs advanced DNS queries using the `dig` command. Can get various record types.',
    inputSchema: z.object({
      domain: z.string().describe('The domain to query.'),
      recordType: z.string().optional().describe('The DNS record type to query (e.g., A, MX, TXT, ANY). Defaults to A.'),
    }),
    outputSchema: z.string(),
  },
  async ({ domain, recordType }) => {
    const command = `dig ${domain} ${recordType || 'A'}`;
     return executeCommand(command).catch(error => {
      if (error.message.includes('command not found')) {
        return "Error: 'dig' command not found. Please install 'dnsutils' or an equivalent package on your system.";
      }
      throw error;
    });
  }
);
