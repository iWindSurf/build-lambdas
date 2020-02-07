import { runParallel, zipDirectory } from '..'
import * as fs from 'fs'
import { join } from 'path'
import * as rimraf from 'rimraf'
const TIMEOUT = 10000

test(
  'run Parallel with customFunction',
  async () => {
    const lambdaFolder01 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-c')
    rimraf.sync(join(lambdaFolder01, 'lambda_with-custom-zip-filename.zip'))

    async function customZip() {
      return zipDirectory(lambdaFolder01, join(lambdaFolder01, 'lambda_with-custom-zip-filename.zip'))
    }

    await runParallel([{ args: ['install', customZip], cwd: lambdaFolder01 }])
    expect(fs.existsSync(join(lambdaFolder01, 'node_modules', 'debug', 'package.json'))).toBe(true)
    expect(fs.existsSync(join(lambdaFolder01, 'lambda_with-custom-zip-filename.zip'))).toBe(true)
  },
  TIMEOUT
)
