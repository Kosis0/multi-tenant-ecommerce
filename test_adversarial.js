/**
 * Root-level entry point for executing the Adversarial QA Test Suite
 */
require('dotenv').config();
process.env.NODE_ENV = 'test';

const { runAll } = require('./tests/adversarial_suite');

runAll().then((results) => {
  if (results.failed > 0) {
    console.error(`[TEST RUNNER] Adversarial test run completed with ${results.failed} failure(s).`);
    process.exit(1);
  } else {
    console.log('[TEST RUNNER] All adversarial tests passed cleanly!');
    process.exit(0);
  }
}).catch((err) => {
  console.error('[TEST RUNNER FATAL ERROR]', err);
  process.exit(1);
});
