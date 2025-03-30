# TaskBoard Extension Deployment Guide

This document outlines how to deploy the TaskBoard VS Code extension both locally and through GitHub Actions.

## Local Development and Deployment

### Prerequisites
- Node.js (v18 or later)
- VS Code
- Git

### Building and Testing Locally

1. **Clone and Install Dependencies**
   ```bash
   git clone https://github.com/siupangjau/taskboard_vsc_extension.git
   cd taskboard_vsc_extension
   npm install
   ```

2. **Build the Extension**
   ```bash
   npm run build
   ```
   This command will:
   - Clean up previous build artifacts
   - Install dependencies
   - Compile the extension
   - Package it into a `.vsix` file

3. **Install the Extension Locally**
   - Open VS Code
   - Press `Ctrl+Shift+X` to open the Extensions view
   - Click the "..." (More Actions) menu
   - Select "Install from VSIX..."
   - Choose the generated `taskboard-1.0.0.vsix` file

4. **Test the Extension**
   - Press `Ctrl+Shift+P` to open the Command Palette
   - Type "TaskBoard" to see available commands
   - Test the functionality:
     - Create a new board
     - Open an existing board
     - Show the current board

### Publishing Manually

1. **Get a Personal Access Token (PAT)**
   - Go to [Azure DevOps](https://dev.azure.com)
   - Create a new PAT with "Marketplace (publish)" scope
   - Save the token securely

2. **Publish to VS Code Marketplace**
   ```bash
   # Login to vsce (only needed once)
   npx @vscode/vsce login BenLe

   # Publish the extension
   npm run publish-extension
   ```

## GitHub Actions Automated Deployment

The repository includes automated deployment using GitHub Actions. The workflow is triggered when pushing version tags.

### How It Works

1. **Workflow Trigger**
   - The workflow (`publish.yml`) triggers on pushing tags that start with "v" (e.g., v1.0.0)

2. **Workflow Steps**
   - Checks out the code
   - Sets up Node.js environment
   - Installs dependencies
   - Builds and packages the extension
   - Uploads the VSIX as an artifact
   - Publishes to VS Code Marketplace (for version tags)

### Setting Up GitHub Actions

1. **Add Repository Secret**
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Add a new secret named `VSCE_PAT`
   - Paste your VS Code Marketplace PAT as the value

2. **Publishing a New Version**
   ```bash
   # Update version in package.json
   npm version patch  # or minor, or major
   
   # Push changes and tag
   git push
   git push --tags
   ```

   The GitHub Action will automatically:
   - Build the extension
   - Create a VSIX package
   - Upload it as an artifact
   - Publish to the VS Code Marketplace

### Monitoring Deployments

1. **Check Workflow Status**
   - Go to your GitHub repository
   - Click the "Actions" tab
   - Look for the latest "Publish Extension" workflow run

2. **Download Artifacts**
   - Go to the workflow run
   - Scroll to the "Artifacts" section
   - Download `taskboard-extension` to get the VSIX file

## Troubleshooting

### Common Issues

1. **Missing VSCE_PAT**
   - Ensure the PAT is correctly set in GitHub Secrets
   - Verify the PAT hasn't expired
   - Check that the PAT has the correct permissions

2. **Build Failures**
   - Check the build logs in GitHub Actions
   - Ensure all dependencies are correctly listed in `package.json`
   - Verify the build script paths match your project structure

3. **Publishing Failures**
   - Verify the version number hasn't been used before
   - Check that the publisher name matches your VS Code Marketplace account
   - Ensure the PAT is still valid

### Getting Help

If you encounter issues:
1. Check the GitHub Actions logs
2. Review the error messages in the build output
3. Open an issue in the GitHub repository with:
   - Description of the problem
   - Steps to reproduce
   - Error messages and logs 