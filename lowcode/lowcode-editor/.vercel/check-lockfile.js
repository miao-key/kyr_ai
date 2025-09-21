#!/usr/bin/env node

/**
 * Vercel Build Hook - Check for pnpm-lock.yaml
 * Ensures lockfile exists before build to prevent dependency issues
 */

const fs = require('fs');
const path = require('path');

const lockfilePath = path.join(process.cwd(), 'pnpm-lock.yaml');

if (!fs.existsSync(lockfilePath)) {
  console.error('❌ Error: pnpm-lock.yaml not found!');
  console.error('Please run "pnpm install" locally and commit the lockfile.');
  process.exit(1);
}

console.log('✅ pnpm-lock.yaml found - proceeding with build');
