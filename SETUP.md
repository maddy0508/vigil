# Vigil Setup

This document contains one-time manual setup steps that are required for Vigil to function correctly.

## Linux Firewall Configuration (Required for Linux)

To allow Vigil to block IP addresses using the system firewall, it needs permission to run the `ufw` command without a password. This requires editing the `sudoers` file, which should be done with extreme care.

**This is a critical security step. Only proceed if you understand the implications.**

1.  Open a new terminal.
2.  Type `sudo visudo` to safely edit the sudoers file. This will open the file in a terminal-based text editor like `nano` or `vim`.
3.  Add the following line at the very end of the file. **Replace `YOUR_USERNAME` with your actual Linux username.** You can find your username by typing `whoami` in the terminal.

    ```
    YOUR_USERNAME ALL=(ALL) NOPASSWD: /usr/sbin/ufw
    ```

4.  Save and exit the editor.
    *   If using `nano`: Press `Ctrl+X`, then `Y`, then `Enter`.
    *   If using `vim`: Type `:wq` and press `Enter`.
