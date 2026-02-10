#!/bin/bash
set -e

DEPLOY_DIR="/tmp/templia-art-deploy"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Building Next.js static export..."
cd "$PROJECT_DIR"
npx next build

echo "Preparing deploy directory..."
if [ -d "$DEPLOY_DIR" ]; then
  cd "$DEPLOY_DIR"
  git pull origin main
else
  git clone https://github.com/templia/templia.art.git "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
fi

# Clean previous journey assets
rm -rf "$DEPLOY_DIR/_next"
rm -rf "$DEPLOY_DIR/journey"
rm -rf "$DEPLOY_DIR/glyphs"

# Copy new build
cp -r "$PROJECT_DIR/out/_next" "$DEPLOY_DIR/"
cp -r "$PROJECT_DIR/out/journey" "$DEPLOY_DIR/"
cp -r "$PROJECT_DIR/out/glyphs" "$DEPLOY_DIR/"

# Ensure clean URLs: copy .html files as index.html inside slug directories
for html_file in "$DEPLOY_DIR"/journey/*.html; do
  slug=$(basename "$html_file" .html)
  if [ -d "$DEPLOY_DIR/journey/$slug" ]; then
    cp "$html_file" "$DEPLOY_DIR/journey/$slug/index.html"
  fi
done

# Ensure .nojekyll exists (so GitHub Pages serves _next folder)
touch "$DEPLOY_DIR/.nojekyll"

echo ""
echo "Ready to deploy! Run these commands:"
echo ""
echo "  cd $DEPLOY_DIR"
echo "  git add -A"
echo "  git commit -m 'Update journey pages'"
echo "  git push origin main"
echo ""
