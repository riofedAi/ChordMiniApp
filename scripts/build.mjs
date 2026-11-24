// Build wrapper: runs `next build` (Turbopack, the Next.js 16 default) with a
// raised V8 heap limit so the production build fits in memory-constrained
// hosts (~4 GB containers, e.g. Altare). The previous webpack build compiled
// the whole module graph in a single node process (> 3 GB RSS, OOM-killed);
// Turbopack compiles in Rust with a much smaller footprint.
// Works on any platform; set BUILD_MAX_OLD_SPACE_SIZE (in MB) to override.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const heapSizeMb = process.env.BUILD_MAX_OLD_SPACE_SIZE || '2816';

const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
if (!/(^|\s)--max-old-space-size=/.test(env.NODE_OPTIONS || '')) {
  env.NODE_OPTIONS = `${env.NODE_OPTIONS || ''} --max-old-space-size=${heapSizeMb}`.trim();
}

console.log(`> next build (turbopack) (NODE_OPTIONS=${env.NODE_OPTIONS})`);

const result = spawnSync('next', ['build'], {
  cwd: projectRoot,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

console.error(`[build.mjs] next exited: status=${result.status} signal=${result.signal} error=${result.error?.message ?? 'none'}`);
process.exit(result.status ?? 1);
