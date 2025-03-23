#!/bin/bash
set -e

# Install dependencies
yarn install

# Build the application
yarn build

# Serve the built files using a simple HTTP server
npx serve -s dist -l $PORT 