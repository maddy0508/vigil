const { exec } = require('child_process');

function executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error for command "${command}": ${error.message}`);
                // For many system commands, stderr can contain warnings or info, not just errors.
                // We resolve with stderr if stdout is empty, but reject on critical errors.
                if (stderr && !stdout) {
                    resolve(`Stderr: ${stderr}`);
                } else {
                     // Reject only on true errors, otherwise resolve with what we have.
                    reject(error);
                }
                return;
            }
            if (stderr) {
                // Don't log this as a warning for certain commands that always output to stderr
                if (!command.startsWith('avahi-browse')) {
                    console.warn(`Exec command "${command}" produced stderr: ${stderr}`);
                }
            }
            resolve(stdout);
        });
    });
}


function getSystemProcesses(): Promise<string> {
    const command = process.platform === 'win32' ? 'tasklist /v /fo csv' : 'ps aux';
    return executeCommand(command);
}

function getNetworkConnections(): Promise<string> {
    const command = process.platform === 'win32' ? 'netstat -an' : 'netstat -an';
    return executeCommand(command);
}

function getDiscoveredServices(): Promise<string> {
    if (process.platform === 'win32') {
        // Windows has built-in mDNS support, but listing devices programmatically is complex.
        // This is a placeholder for a more advanced implementation.
        return Promise.resolve("Service discovery (mDNS/Zeroconf) monitoring is less straightforward on Windows. No devices detected via this method.");
    } else {
        // Use avahi-browse for Linux. This requires the 'avahi-utils' package to be installed.
        // The command will run for 3 seconds and then timeout, listing all discovered services.
        return executeCommand('timeout 3 avahi-browse -a -r -t').catch(error => {
            if (error.message.includes('command not found')) {
                return "Warning: 'avahi-browse' command not found. Please install 'avahi-utils' for network service discovery.";
            }
            return `Error while scanning for network services: ${error.message}`;
        });
    }
}


module.exports = {
    getSystemProcesses,
    getNetworkConnections,
    getDiscoveredServices,
};
