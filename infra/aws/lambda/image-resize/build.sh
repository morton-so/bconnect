#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

rm -rf node_modules
npm install --os=linux --cpu=arm64
