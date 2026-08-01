import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const snapshotRoot = path.join(root, 'build-snapshots');
const outputs = [
  'content/governance/claim-review-decisions.json',
  'content/governance/release-registry.json',
  'content/governance/release-review-decisions.json',
  'api/resources.json',
  'api/release-manifest.json',
  'artifacts/interaction-audit/report.json',
  'program/promise-delivery/promise-release-registry.json',
  'search-index.json',
  'workspace/resource-registry.json'
];

for (const relative of outputs) {
  const snapshot = path.join(snapshotRoot, `${relative}.gz`);
  const destination = path.join(root, relative);
  if (!fs.existsSync(snapshot)) throw new Error(`Missing build snapshot: ${path.relative(root, snapshot)}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, zlib.gunzipSync(fs.readFileSync(snapshot)));
}

console.log(`Hydrated ${outputs.length} governed build snapshots.`);
