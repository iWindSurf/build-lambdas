import { npmRun } from '..'
import * as fs from 'fs'
import { join } from 'path'
import * as rimraf from 'rimraf'

test('test npm install lambda-no-lock', async () => {
  const lambdaFolder = join(__dirname, 'lambdas', 'lambda-no-lock')
  rimraf.sync(join(lambdaFolder, 'node_modules'))
  await npmRun(['install'], lambdaFolder)
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'debug', 'package.json'))).toBe(
    true
  )
})

test('test npm install lambda-with-lock', async () => {
  const lambdaFolder = join(__dirname, 'lambdas', 'lambda-with-lock')
  rimraf.sync(join(lambdaFolder, 'node_modules'))
  await npmRun(['install'], lambdaFolder)
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'debug', 'package.json'))).toBe(
    true
  )
})

test('test npm ci', async () => {
  const lambdaFolder = join(__dirname, 'lambdas', 'lambda-with-lock')
  rimraf.sync(join(lambdaFolder, 'node_modules'))
  await npmRun(['ci'], lambdaFolder)
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'debug', 'package.json'))).toBe(
    true
  )
})

test('test npm build', async () => {
  const lambdaFolder = join(__dirname, 'lambdas', 'lambda-no-lock')
  rimraf.sync(join(lambdaFolder, 'node_modules'))
  const stdout = await npmRun(['run', 'build'], lambdaFolder)
  expect(stdout).toMatch('build succeeded')
})
