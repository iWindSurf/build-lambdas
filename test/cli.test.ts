import * as fs from 'fs'
import * as rimraf from 'rimraf'
const util = require('util')
const exec = util.promisify(require('child_process').exec)

test('build-lambdas run with -l', async () => {
  rimraf.sync('test/fixtures/lambdas/lambda-with-lock-cli-01/test.zip')

  await exec(`
    build-lambdas run \
    -s install,run-build,zip \
    -l test/fixtures/lambdas/lambda-with-lock-cli-01/ \
    -o test/fixtures/lambdas/lambda-with-lock-cli-01/test.zip`)
  expect('1').toMatch('1')
  expect(fs.existsSync('test/fixtures/lambdas/lambda-with-lock-cli-01/test.zip')).toBe(true)
}, 10000)

test('build-lambdas run without, zip current working dir', async () => {
  rimraf.sync('test/fixtures/lambdas/lambda-with-lock-cli/test.zip')

  await exec(`
    cd test/fixtures/lambdas/lambda-with-lock-cli-02 && \
    build-lambdas run \
    -s install,run-build,zip \
    -o test.zip`)
  expect('1').toMatch('1')
  expect(fs.existsSync('test/fixtures/lambdas/lambda-with-lock-cli-02/test.zip')).toBe(true)
}, 10000)
