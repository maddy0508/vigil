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
                console.warn(`Exec command "${command}" produced stderr: ${stderr}`);
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


module.exports = {
    getSystemProcesses,
    getNetworkConnections,
};
