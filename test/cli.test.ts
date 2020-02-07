import * as fs from 'fs'
import * as rimraf from 'rimraf'
const util = require('util')
const exec = util.promisify(require('child_process').exec)

test('cloud-blocks-cli open-api should show correct help message', async () => {
  rimraf.sync('test/fixtures/lambdas/lambda-with-lock-cli/test.zip')

  await exec(`
    build-lambdas run \
    -s install,run-build,zip \
    -l test/fixtures/lambdas/lambda-with-lock-cli/ \
    -o test/fixtures/lambdas/lambda-with-lock-cli/test.zip`)
  expect('1').toMatch('1')
  expect(fs.existsSync('test/fixtures/lambdas/lambda-with-lock-cli/test.zip')).toBe(true)
})
