#!/bin/bash
set -e

VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "Usage: bun run release <version>  (e.g. bun run release 0.1.2)"
  echo "       npm run release -- <version>"
  exit 1
fi

# Validate semver format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must be in semver format (e.g. 0.1.2)"
  exit 1
fi

TAG="release-v${VERSION}"

# Ensure working tree is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree has uncommitted changes. Commit or stash them first."
  exit 1
fi

echo "Tagging $TAG at $(git rev-parse --short HEAD)..."
git tag "$TAG"

echo "Pushing tag to origin..."
git push origin "$TAG"

echo "Done. GitHub Actions will now build and deploy."
