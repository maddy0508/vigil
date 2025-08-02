const { exec } = require('child_process');

function executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error for command "${command}": ${error.message}`);
                if (stderr && !stdout) {
                    resolve(`Stderr: ${stderr}`);
                } else {
                    reject(error);
                }
                return;
            }
            if (stderr) {
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
        return Promise.resolve("Service discovery (mDNS/Zeroconf) monitoring is not supported on Windows via this tool.");
    } else {
        return executeCommand('timeout 3 avahi-browse -a -r -t').catch(error => {
            if (error.message.includes('command not found')) {
                return "Warning: 'avahi-browse' command not found. Please install 'avahi-utils' for network service discovery.";
            }
            return `Error while scanning for network services: ${error.message}`;
        });
    }
}

function getSystemLogs(): Promise<string> {
    if (process.platform === 'win32') {
        // Get last 50 critical/error/warning events from System and Security logs.
        const command = `powershell -Command "Get-WinEvent -LogName System, Security -MaxEvents 50 | Where-Object { $_.LevelDisplayName -in 'Critical', 'Error', 'Warning' } | Format-Table -AutoSize -Wrap | Out-String -Width 4096"`;
        return executeCommand(command);
    } else {
        // Use journalctl for modern Linux systems. Get last 50 entries with priority error or higher.
        const command = `journalctl --priority=err -n 50 --no-pager`;
         return executeCommand(command).catch(error => {
            if (error.message.includes('command not found')) {
                // Fallback for older systems or if journalctl is not available
                return executeCommand('tail -n 100 /var/log/syslog');
            }
            return `Error reading system logs: ${error.message}`;
        });
    }
}

module.exports = {
    getSystemProcesses,
    getNetworkConnections,
    getDiscoveredServices,
    getSystemLogs,
};
