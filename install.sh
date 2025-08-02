#!/bin/bash
# Vigil Installer Script

echo "Starting Vigil installation..."

# Step 1: Install Node.js dependencies
echo "Installing project dependencies with npm..."
if npm install; then
    echo "Dependencies installed successfully."
else
    echo "Error: Failed to install npm dependencies." >&2
    exit 1
fi

# Step 2: Set permissions for the firewall command
# The AI needs sudo access to run the 'ufw' command to block IPs.
# This part is complex and requires manual user intervention for security.
echo ""
echo "----------------------------------------------------------------"
echo "IMPORTANT: Manual Action Required for Firewall Control"
echo "----------------------------------------------------------------"
echo "To allow Vigil to block IP addresses, you need to grant it permission to run the firewall command ('ufw') without a password."
echo "This requires editing the sudoers file, which should be done with extreme care."
echo ""
echo "1. Open a new terminal."
echo "2. Type 'sudo visudo' to safely edit the sudoers file."
echo "3. Add the following line at the end of the file, replacing 'YOUR_USERNAME' with your actual Linux username:"
echo ""
echo "   YOUR_USERNAME ALL=(ALL) NOPASSWD: /usr/sbin/ufw"
echo ""
echo "4. Save and exit the editor (Ctrl+X, then Y, then Enter if you are using nano)."
echo "This is a critical security step. Only proceed if you understand the implications."
echo "----------------------------------------------------------------"
echo ""


echo "Installation setup complete."
echo "You can now start the application by running: npm start"
