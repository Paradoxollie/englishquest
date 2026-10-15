// Offline checks only: mocks never write scores or send e-mails.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
for (const script of [
  'scripts/test-game-backend.cjs',
  'scripts/tests/falling-games-regression.cjs',
  'scripts/tests/round-games-regression.cjs',
  'scripts/tests/score-plausibility-regression.cjs',
  'scripts/tests/quiz-interaction-regression.cjs',
  'scripts/tests/course-question-invariants.cjs',
  'scripts/tests/exercise-invariants.cjs',
  'scripts/tests/auth-pagination-regression.cjs',
  'scripts/tests/rewards-regression.cjs',
]) {
  const result = spawnSync(process.execPath, [script], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
