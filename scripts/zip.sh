#!/bin/bash
# Zip script for packaging the extension for distribution

# Get the version from manifest.json
VERSION=$(grep -Po '"version": "\K[^"]*' ../manifest.json)
EXTENSION_NAME="bookmark-os"

# Output directory
OUTPUT_DIR="../dist"
mkdir -p $OUTPUT_DIR

# ZIP filename
ZIP_FILE="$OUTPUT_DIR/${EXTENSION_NAME}-v${VERSION}.zip"

# Source directory
SRC_DIR=".."

# Files and directories to include
INCLUDE=(
  "assets/"
  "components/"
  "content-scripts/"
  "lib/"
  "popup/"
  "types/"
  "background.js"
  "manifest.json"
  "README.md"
  "CHANGELOG.md"
)

# Files and directories to exclude
EXCLUDE=(
  "*.git*"
  "*.DS_Store"
  "node_modules/"
  "dist/"
  "scripts/"
  "*.zip"
  "*placeholder*"
  "*.swp"
  "*~"
)

# Create exclude arguments
EXCLUDE_ARGS=""
for item in "${EXCLUDE[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$item"
done

# Change to source directory
cd $SRC_DIR

# Create the ZIP file
echo "Creating extension ZIP file: $ZIP_FILE"
zip -r $ZIP_FILE ${INCLUDE[@]} $EXCLUDE_ARGS

# Check if zip was successful
if [ $? -eq 0 ]; then
  echo "✅ Successfully created: $ZIP_FILE"
  echo "File size: $(du -h $ZIP_FILE | cut -f1)"
else
  echo "❌ Error creating ZIP file"
  exit 1
fi

echo "Done!" 