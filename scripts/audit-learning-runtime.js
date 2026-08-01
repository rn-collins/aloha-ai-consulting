import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { validateUniversitySystem, UNIVERSITY_SCHEMA_VERSION } from '../lib/site/university-model.js';

const root = process.cwd();
const sourceFile = path.join(root, 'content/university/courses/build-courses.json');
const outputFile = path.join(root, 'api/learning-completeness-report.json');
const courses = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
const schemaErrors = validateUniversitySystem(courses);
const requiredTypes = ['course', 'module', 'lesson', 'assessment', 'source', 'project', 'rubric', 'credential', 'outcome'];

const courseReports = courses.map((resource) => {
  const records = resource.education?.records || [];
  const counts = Object.fromEntries(requiredTypes.map((type) => [type, records.filter((record) => record.type === type).length]));
  const courseRecord = records.find((record) => record.type === 'course');
  const blockers = [];
  if (!records.length) blockers.push('canonical-education-records-absent');
  if (!courseRecord) blockers.push('course-record-absent');
  for (const type of ['module', 'lesson', 'assessment', 'source', 'project', 'rubric', 'credential', 'outcome']) {
    if (!counts[type]) blockers.push(`${type}-records-absent`);
  }
  if (resource.delivery?.lessons !== 'available') blockers.push('substantive-lessons-unavailable');
  if (!resource.delivery?.enrollmentOpen) blockers.push('enrollment-closed');
  if (resource.delivery?.progressTracking !== 'available') blockers.push('account-synced-progress-unavailable');
  if (!['manual', 'verifiable'].includes(resource.delivery?.credential)) blockers.push('credential-issuance-unavailable');

  const openMaterialsComplete = Boolean(
    courseRecord && counts.module && counts.lesson && counts.assessment && counts.source &&
    counts.project && counts.rubric && counts.credential && counts.outcome &&
    resource.delivery?.lessons === 'available'
  );

  return {
    resourceId: resource.id,
    pathname: resource.pathname,
    title: resource.title,
    deliveryStatus: resource.delivery?.status || 'unspecified',
    recordCounts: counts,
    openMaterialsComplete,
    enrollmentAvailable: resource.delivery?.enrollmentOpen === true,
    accountSyncedProgressAvailable: resource.delivery?.progressTracking === 'available',
    credentialIssuanceAvailable: ['manual', 'verifiable'].includes(resource.delivery?.credential),
    blockers
  };
});

const report = {
  schema: 'aloha-ai-learning-completeness/1.0',
  generatedAt: new Date().toISOString(),
  frozenAuditEvidenceUnits: 325,
  universitySchemaVersion: UNIVERSITY_SCHEMA_VERSION,
  sourceFile: path.relative(root, sourceFile),
  courseCount: courseReports.length,
  openMaterialsCompleteCount: courseReports.filter((course) => course.openMaterialsComplete).length,
  incompleteCourseCount: courseReports.filter((course) => !course.openMaterialsComplete).length,
  schemaErrors,
  interpretation: {
    openMaterialsComplete: 'Substantive modules and lessons plus assessments, sources, project evidence, rubric, credential boundary, and outcomes exist in the canonical record.',
    enrollmentAvailable: 'A separate delivery-system claim; open materials do not imply enrollment.',
    accountSyncedProgressAvailable: 'A separate persistence claim; device-local self-records do not imply an account.',
    credentialIssuanceAvailable: 'A separate identity, grading, issuance, and verification claim.'
  },
  courses: courseReports
};

if (schemaErrors.length) {
  console.error(`Learning schema validation failed with ${schemaErrors.length} error(s).`);
  for (const error of schemaErrors) console.error(`- ${error}`);
  process.exit(1);
}

if (process.argv.includes('--check')) {
  if (!fs.existsSync(outputFile)) {
    console.error(`Missing ${path.relative(root, outputFile)}`);
    process.exit(1);
  }
  const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  const comparable = { ...report, generatedAt: existing.generatedAt };
  if (JSON.stringify(existing) !== JSON.stringify(comparable)) {
    console.error(`Out of date: ${path.relative(root, outputFile)}`);
    process.exit(1);
  }
  console.log(`Learning completeness ledger is current: ${report.openMaterialsCompleteCount}/${report.courseCount} open-material courses complete.`);
} else {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputFile)}: ${report.openMaterialsCompleteCount}/${report.courseCount} open-material courses complete; ${report.incompleteCourseCount} remain.`);
}
