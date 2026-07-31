import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('freezes and reconciles the complete promise-delivery baseline', () => {
  const freeze = JSON.parse(fs.readFileSync('program/promise-delivery/freeze.json', 'utf8'));
  const ledger = JSON.parse(fs.readFileSync('program/promise-delivery/ledger.json', 'utf8'));
  assert.equal(freeze.counts.staticHtmlRoutes, freeze.counts.publicRouteSurfaces);
  assert.equal(freeze.routes.length, freeze.counts.publicRouteSurfaces);
  assert.equal(freeze.counts.publicRouteSurfaces, freeze.counts.sitemapRoutes + 1);
  assert.equal(ledger.records.length, ledger.counts.promiseRecords);
  assert.equal(ledger.counts.unclassifiedRecords, 0);
  assert.equal(new Set(ledger.records.map((record) => record.id)).size, ledger.records.length);
  assert.ok(ledger.records.every((record) => record.occurrences.length && record.disposition && record.acceptanceCriteria));
});

test('keeps every audited interactive occurrence in the promise ledger', () => {
  const ledger = JSON.parse(fs.readFileSync('program/promise-delivery/ledger.json', 'utf8'));
  const actionOccurrences = ledger.records
    .filter((record) => record.category === 'public-action')
    .reduce((sum, record) => sum + record.occurrences.length, 0);
  assert.equal(actionOccurrences, ledger.counts.interactiveOccurrences);
});
