#!/bin/bash

# Publish a GitHub repository to the CDN
# Usage: ./scripts/publish.sh <user/repo> <type> [name]

set -euo pipefail

CDN_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ $# -lt 2 ]; then
    echo "Usage: $0 <user/repo> <type> [name]"
    exit 1
fi

REPO="$1"
TYPE="$2"
NAME="${3:-${REPO##*/}}"

# Check dependencies
if ! command -v gft &>/dev/null; then
    echo "Error: gft is not installed."
    exit 1
fi

# Get latest version from GitHub
VERSION=$(gft "$REPO" -q 2>/dev/null)
if [ -z "$VERSION" ]; then
    echo "Error: Could not fetch version for $REPO."
    exit 1
fi

echo "Found $NAME@$VERSION on GitHub."

# Check if version already exists in CDN
DEST="$CDN_DIR/$TYPE/$NAME/$VERSION"
if [ -d "$DEST" ]; then
    echo "Version $VERSION already exists in CDN at $TYPE/$NAME/$VERSION."
    exit 0
fi

# Clone repo into temporary directory
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "Cloning $REPO..."
git clone --depth 1 "https://github.com/$REPO.git" "$TMPDIR/repo" --quiet

# Build if package.json has a build script
if [ -f "$TMPDIR/repo/package.json" ] && grep -q '"build"' "$TMPDIR/repo/package.json"; then
    echo "Building $NAME..."
    (cd "$TMPDIR/repo" && npm install --quiet && npm run build --quiet)
fi

# Copy files
mkdir -p "$DEST"
rsync -a --exclude='.git' "$TMPDIR/repo/" "$DEST/"

# Summary
echo ""
echo "Published $NAME@$VERSION to $TYPE/$NAME/$VERSION"
echo "Files:"
find "$DEST" -type f -printf "  %P\n" | sort
