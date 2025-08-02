#!/bin/bash
# Vigil Update and Setup Script

echo "Pulling latest changes from the repository..."
git pull

if [ $? -ne 0 ]; then
    echo "Error: 'git pull' failed. Please check your connection and git setup." >&2
    exit 1
fi

echo "Latest changes pulled successfully."
echo ""
echo "Starting the installation and setup process..."

npm run install:setup

if [ $? -ne 0 ]; then
    echo "Error: The setup script failed." >&2
    exit 1
fi

echo ""
echo "------------------------------------------------"
echo "Update and setup complete!"
echo "You can now start the application by running:"
echo "npm start"
echo "------------------------------------------------"
