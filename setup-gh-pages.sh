#!/bin/bash

# Setup GitHub Pages using GitHub CLI
# Run this script locally where gh CLI is installed

set -e

echo "🚀 Setting up GitHub Pages for profoundhq/vsm"

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"

# Enable GitHub Pages
echo "📄 Enabling GitHub Pages..."

# Try to create/update Pages settings
gh api repos/profoundhq/vsm/pages \
  -X POST \
  -f build_type=workflow 2>/dev/null || \
gh api repos/profoundhq/vsm/pages \
  -X PUT \
  -f build_type=workflow

echo "✅ GitHub Pages enabled with GitHub Actions as source"
echo ""
echo "Your site will be available at:"
echo "https://profoundhq.github.io/vsm/"
echo ""
echo "To deploy, push to the main branch or run the workflow manually:"
echo "gh workflow run deploy.yml"
