#!/usr/bin/env node
'use strict';
/**
 * Strategist structural tests. No network, no Claude call, no writes outside
 * a temp folder. Exit 0 = all good.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const strategist = require(path.join(ROOT, 'bin', 'strategist.js'));

let passed = 0;
let failed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log('ok   ' + name);
  } catch (e) {
    failed++;
    console.log('FAIL ' + name + ' :: ' + e.message);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

// Build a sandbox home so tests never touch a real install.
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'strategist-test-'));
for (const d of ['bin', 'config', 'prompts', 'notes', 'briefs']) {
  fs.mkdirSync(path.join(sandbox, d), { recursive: true });
}
for (const f of [
  ['config/council.json'],
  ['config/business.example.json'],
  ['prompts/council-brief-prompt.md'],
  ['prompts/focus-check-prompt.md'],
]) {
  fs.copyFileSync(path.join(ROOT, f[0]), path.join(sandbox, f[0]));
}

check('council.json has exactly 7 personas including mckeown', () => {
  const council = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'config', 'council.json'), 'utf8')
  );
  assert(Array.isArray(council) && council.length === 7, 'expected 7 personas');
  for (const p of council) {
    assert(p.id && p.name && p.lens, 'persona missing id/name/lens: ' + JSON.stringify(p));
  }
  assert(council.some((p) => p.id === 'mckeown'), 'mckeown persona missing');
});

check('focus prompt exists with its three placeholders', () => {
  const prompt = fs.readFileSync(
    path.join(ROOT, 'prompts', 'focus-check-prompt.md'),
    'utf8'
  );
  for (const placeholder of ['{{TODAY}}', '{{TODAYS_BRIEF}}', '{{CURRENT_ACTIVITY}}']) {
    assert(prompt.includes(placeholder), 'missing placeholder: ' + placeholder);
  }
});

check('council prompt has Follow-Through and multi-brief placeholder only', () => {
  const prompt = fs.readFileSync(
    path.join(ROOT, 'prompts', 'council-brief-prompt.md'),
    'utf8'
  );
  assert(prompt.includes('{{PREVIOUS_BRIEFS}}'), 'multi-brief placeholder missing');
  assert(prompt.includes('*Follow-Through*'), 'Follow-Through section missing');
  assert(!prompt.includes('{{PREVIOUS_BRIEF}}'), 'old singular placeholder remains');
});

check('business.example.json parses and has the required shape', () => {
  const cfg = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'config', 'business.example.json'), 'utf8')
  );
  assert(cfg.owner, 'owner missing');
  assert(cfg.business && cfg.business.name, 'business.name missing');
  assert(cfg.mission && cfg.mission.statement, 'mission.statement missing');
  assert(Array.isArray(cfg.goals) && cfg.goals.length > 0, 'goals missing');
  assert(Array.isArray(cfg.projects), 'projects missing');
});

check('validateConfig flags the untouched example config', () => {
  const cfg = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'config', 'business.example.json'), 'utf8')
  );
  const problems = strategist.validateConfig(cfg);
  assert(problems.length > 0, 'placeholder owner should be flagged');
});

check('validateConfig passes a filled-in config', () => {
  const problems = strategist.validateConfig({
    owner: 'Sam',
    business: { name: 'Sample Studio' },
    mission: { statement: 'Reach 10 clients' },
    goals: [{ goal: 'Close 2 clients', by: '2026-09-01' }],
    projects: [],
  });
  assert(problems.length === 0, 'unexpected problems: ' + problems.join('; '));
});

check('buildPrompt fills every placeholder', () => {
  process.env.STRATEGIST_HOME = sandbox;
  const prompt = strategist.buildPrompt({ root: sandbox, weekly: false });
  delete process.env.STRATEGIST_HOME;
  assert(!/\{\{[A-Z_]+\}\}/.test(prompt), 'unfilled placeholder remains');
  assert(prompt.includes('DAILY BRIEF'), 'mode not set');
  for (const name of ['Dalio', 'Hormozi', 'Dunford', 'Martin', 'McGrath', 'Munger']) {
    assert(prompt.includes(name), 'council persona missing from prompt: ' + name);
  }
  assert(prompt.includes('Top 3 Today'), 'output spec missing');
});

check('three recent briefs appear newest-first in the printed prompt', () => {
  fs.copyFileSync(
    path.join(ROOT, 'config', 'business.example.json'),
    path.join(sandbox, 'config', 'business.json')
  );
  for (const [date, text] of [
    ['2026-07-30', 'oldest brief'],
    ['2026-07-31', 'middle brief'],
    ['2026-08-01', 'newest brief'],
  ]) {
    fs.writeFileSync(path.join(sandbox, 'briefs', date + '.md'), text);
  }
  fs.writeFileSync(path.join(sandbox, 'briefs', '2026-08-02-prompt.md'), 'ignore me');
  execFileSync(
    process.execPath,
    [path.join(ROOT, 'bin', 'strategist.js'), 'brief', '--print-prompt'],
    {
      env: Object.assign({}, process.env, { STRATEGIST_HOME: sandbox }),
      encoding: 'utf8',
    }
  );
  const promptPath = path.join(sandbox, 'briefs', new Date().toISOString().slice(0, 10) + '-prompt.md');
  const prompt = fs.readFileSync(promptPath, 'utf8');
  const newest = prompt.indexOf('--- Brief from 2026-08-01 ---');
  const middle = prompt.indexOf('--- Brief from 2026-07-31 ---');
  const oldest = prompt.indexOf('--- Brief from 2026-07-30 ---');
  assert(newest !== -1 && middle !== -1 && oldest !== -1, 'not all brief headers found');
  assert(newest < middle && middle < oldest, 'briefs are not newest-first');
  assert(!prompt.includes('ignore me'), 'prompt file was included as a brief');
});

check('buildPrompt weekly mode and notes ingestion work', () => {
  fs.writeFileSync(
    path.join(sandbox, 'notes', 'monday.md'),
    'Signed one new client this week.'
  );
  const prompt = strategist.buildPrompt({ root: sandbox, weekly: true });
  assert(prompt.includes('WEEKLY REVIEW'), 'weekly mode not set');
  assert(prompt.includes('Signed one new client'), 'note content not included');
});

check('setup command creates config and folders in a fresh home', () => {
  const fresh = fs.mkdtempSync(path.join(os.tmpdir(), 'strategist-setup-'));
  for (const d of ['bin', 'config', 'prompts']) {
    fs.mkdirSync(path.join(fresh, d), { recursive: true });
  }
  fs.copyFileSync(
    path.join(ROOT, 'config', 'business.example.json'),
    path.join(fresh, 'config', 'business.example.json')
  );
  execFileSync(process.execPath, [path.join(ROOT, 'bin', 'strategist.js'), 'setup'], {
    env: Object.assign({}, process.env, { STRATEGIST_HOME: fresh }),
    encoding: 'utf8',
  });
  assert(fs.existsSync(path.join(fresh, 'config', 'business.json')), 'business.json not created');
  assert(fs.existsSync(path.join(fresh, 'notes')), 'notes folder not created');
  assert(fs.existsSync(path.join(fresh, 'briefs')), 'briefs folder not created');
  fs.rmSync(fresh, { recursive: true, force: true });
});

check('brief --print-prompt writes a prompt file without calling Claude', () => {
  fs.copyFileSync(
    path.join(ROOT, 'config', 'business.example.json'),
    path.join(sandbox, 'config', 'business.json')
  );
  execFileSync(
    process.execPath,
    [path.join(ROOT, 'bin', 'strategist.js'), 'brief', '--print-prompt'],
    {
      env: Object.assign({}, process.env, { STRATEGIST_HOME: sandbox }),
      encoding: 'utf8',
    }
  );
  const files = fs.readdirSync(path.join(sandbox, 'briefs'));
  assert(files.some((f) => f.endsWith('-prompt.md')), 'prompt file not written');
});

check('split home resolves shipped assets and degrades without Claude', () => {
  const splitHome = fs.mkdtempSync(path.join(os.tmpdir(), 'strategist-split-home-'));
  const emptyBin = fs.mkdtempSync(path.join(os.tmpdir(), 'strategist-empty-bin-'));
  for (const d of ['config', 'notes', 'briefs']) {
    fs.mkdirSync(path.join(splitHome, d), { recursive: true });
  }
  fs.copyFileSync(
    path.join(ROOT, 'config', 'business.example.json'),
    path.join(splitHome, 'config', 'business.json')
  );
  const env = Object.assign({}, process.env, {
    STRATEGIST_HOME: splitHome,
    PATH: emptyBin,
  });
  const brief = require('child_process').spawnSync(
    process.execPath,
    [path.join(ROOT, 'bin', 'strategist.js'), 'brief', '--print-prompt'],
    { env, encoding: 'utf8' }
  );
  assert(brief.status === 0, 'split-home brief failed: ' + brief.stderr);
  assert(!/ENOENT/.test(brief.stderr), 'split-home brief reported ENOENT');
  assert(
    fs.existsSync(path.join(splitHome, 'briefs', new Date().toISOString().slice(0, 10) + '-prompt.md')),
    'split-home brief prompt was not written'
  );
  const focus = require('child_process').spawnSync(
    process.execPath,
    [path.join(ROOT, 'bin', 'strategist.js'), 'focus', 'x'],
    { env, encoding: 'utf8' }
  );
  assert(focus.status === 1, 'split-home focus should use the degrade fallback');
  assert(!/ENOENT/.test(focus.stderr), 'split-home focus reported ENOENT');
  assert(
    fs.existsSync(path.join(splitHome, 'briefs', new Date().toISOString().slice(0, 10) + '-focus-prompt.md')),
    'split-home focus prompt was not written'
  );
  fs.rmSync(splitHome, { recursive: true, force: true });
  fs.rmSync(emptyBin, { recursive: true, force: true });
});

fs.rmSync(sandbox, { recursive: true, force: true });

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
