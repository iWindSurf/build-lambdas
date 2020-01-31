import { npmInstall } from '..'
import * as fs from 'fs'
import { join } from 'path'
import * as rimraf from 'rimraf'

test('test npm install', async () => {
  const lambdaFolder = join(__dirname, 'lambdas', 'lambda-no-lock')
  rimraf.sync(join(lambdaFolder, 'node_modules'))
  await npmInstall(lambdaFolder)
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'debug', 'package.json'))).toBe(
    true
  )
})
