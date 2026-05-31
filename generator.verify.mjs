// Property-based verification of lib/generator.ts. The solver shuffles with
// Math.random(), so output isn't deterministic — but its invariants are. We run
// it many times and assert they hold on every run.
// Dependency-free: `node generator.verify.mjs` (Node 24+ strips TS types) or `npm test`.
import { generateTimetable } from './lib/generator.ts';

let fails = 0;
const ok = (cond, label) => {
  if (!cond) { fails++; console.log(`✗ FAIL  ${label}`); }
};

const cls = (id, o = {}) => ({ id, name: id, shortName: id, year: 1, semester: 1, group: null, departmentId: 'ACS', studentCount: 30, ...o });
const sub = (id, classId, category, hoursPerWeek, o = {}) => ({ id, classId, name: o.name ?? id, category, hoursPerWeek, isLab: false, labForSubjectId: null, ...o });
const men = (id, category, maxHoursPerWeek, o = {}) => ({ id, code: id, name: id, category, departmentId: 'ACS', maxHoursPerWeek, qualification: null, ...o });

// last-session-only detection mirrors generator.ts (function isn't exported)
const KW = ['mentor hour', 'pet', 'library hour', 'library'];
const isLastOnly = (n) => { const l = n.toLowerCase().trim(); return KW.some(k => l === k || l.includes(k)); };

const RUNS = 200;

// ── Scenario A: feasible load across two classes ──
{
  const classes = [cls('C1'), cls('C2')];
  const mentors = [men('CS1', 'CS', 20), men('CS2', 'CS', 20), men('ENG1', 'ENGLISH', 20), men('MGMT1', 'MANAGEMENT', 20), men('COM1', 'COMMERCE', 20)];
  const subjects = [];
  for (const c of ['C1', 'C2']) {
    subjects.push(
      sub(`${c}-csa`, c, 'CS', 5),
      sub(`${c}-csb`, c, 'CS', 4),
      sub(`${c}-eng`, c, 'ENGLISH', 3),
      sub(`${c}-mgmt`, c, 'MANAGEMENT', 3),
      sub(`${c}-pet`, c, 'NA', 2, { name: 'PET' }),
      sub(`${c}-lib`, c, 'NA', 1, { name: 'Library Hour' }),
    );
  }
  const subById = new Map(subjects.map(s => [s.id, s]));

  let dblBook = 0, overCap = 0, badRange = 0, lastSessionMisplaced = 0, naHadMentor = 0, dblWarn = 0;

  for (let r = 0; r < RUNS; r++) {
    const tt = generateTimetable(classes, subjects, mentors);

    // (1) no mentor double-booked at the same day-session
    const seen = new Set();
    for (const s of tt.slots) {
      if (!s.mentorId) continue;
      const key = `${s.mentorId}@${s.day}-${s.session}`;
      if (seen.has(key)) dblBook++;
      seen.add(key);
    }

    // (2) maxHoursPerWeek never exceeded
    const hours = new Map();
    for (const s of tt.slots) if (s.mentorId) hours.set(s.mentorId, (hours.get(s.mentorId) ?? 0) + 1);
    for (const m of mentors) if ((hours.get(m.id) ?? 0) > m.maxHoursPerWeek) overCap++;

    for (const s of tt.slots) {
      // (3) valid grid range
      if (s.day < 1 || s.day > 5 || s.session < 1 || s.session > 7) badRange++;
      const subj = subById.get(s.subjectId);
      // (4) last-session-only subjects pinned to session 7
      if (subj && isLastOnly(subj.name) && s.session !== 7) lastSessionMisplaced++;
      // (5) NA-category / last-session subjects carry no mentor
      if (subj && (subj.category === 'NA' || isLastOnly(subj.name)) && s.mentorId !== null) naHadMentor++;
    }

    if (tt.warnings.some(w => w.includes('Double-booking detected'))) dblWarn++;
  }

  ok(dblBook === 0, `no mentor double-booked across ${RUNS} runs (saw ${dblBook})`);
  ok(overCap === 0, `maxHoursPerWeek never exceeded (saw ${overCap})`);
  ok(badRange === 0, `all slots within day 1-5 / session 1-7 (saw ${badRange})`);
  ok(lastSessionMisplaced === 0, `PET/Library pinned to session 7 (saw ${lastSessionMisplaced})`);
  ok(naHadMentor === 0, `NA/last-session subjects have null mentor (saw ${naHadMentor})`);
  ok(dblWarn === 0, `no double-booking warning emitted (saw ${dblWarn})`);
  console.log(`✓ scenario A: ${RUNS} runs clean`);
}

// ── Scenario B: demand exceeds one mentor's capacity → cap respected, excess warned ──
{
  const classes = [cls('C1')];
  const mentors = [men('CS1', 'CS', 3)];           // only 3 hours available
  const subjects = [sub('C1-cs', 'C1', 'CS', 8)];  // but 8 CS hours demanded
  let everOver = false, hadUnassignedWarn = false;
  for (let r = 0; r < RUNS; r++) {
    const tt = generateTimetable(classes, subjects, mentors);
    const used = tt.slots.filter(s => s.mentorId === 'CS1').length;
    if (used > 3) everOver = true;
    if (tt.warnings.some(w => /unassigned/i.test(w))) hadUnassignedWarn = true;
  }
  ok(!everOver, 'over-subscribed mentor never exceeds capacity of 3');
  ok(hadUnassignedWarn, 'excess demand surfaces an "unassigned" warning');
  console.log('✓ scenario B: capacity ceiling holds, overflow reported');
}

console.log(fails === 0 ? '\n✅ ALL PASS' : `\n❌ ${fails} FAILED`);
process.exit(fails === 0 ? 0 : 1);
