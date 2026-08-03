import fs from 'node:fs';
const required=['source-record.json','claim-record.json','voice-record.json','audience-record.json','example-record.json','review-record.json'];
for(const f of required){JSON.parse(fs.readFileSync(new URL(f,import.meta.url),'utf8'));}
const claim=JSON.parse(fs.readFileSync(new URL('claim-record.json',import.meta.url)));
const source=JSON.parse(fs.readFileSync(new URL('source-record.json',import.meta.url)));
if(!claim.sourceIds.includes(source.sourceId)||claim.approval!=='approved') throw new Error('Claim provenance or approval failed');
console.log('Worked example: six records parse; claim provenance and approval pass.');
