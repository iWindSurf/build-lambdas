import { npmRun, runParallel, zipDirectory } from '..'
import * as fs from 'fs'
import { join } from 'path'
import * as rimraf from 'rimraf'
const TIMEOUT = 1000000

test('npm install lambda-no-lock', async () => {
  const lambdaFolder = join(__dirname, 'fixtures', 'lambdas', 'lambda-no-lock')
  await npmRun(['install'], lambdaFolder)
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'debug', 'package.json'))).toBe(true)
  // devDependencies are not installed.
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'cpu-count', 'package.json'))).toBe(false)
})

test('npm install lambda-with-lock-a', async () => {
  const lambdaFolder = join(__dirname, 'fixtures', 'lambdas', 'lambda-with-lock-a')
  await npmRun(['install'], lambdaFolder)
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'debug', 'package.json'))).toBe(true)
  // devDependencies are not installed.
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'cpu-count', 'package.json'))).toBe(false)
})

test('npm ci lambda-with-lock-b', async () => {
  const lambdaFolder = join(__dirname, 'fixtures', 'lambdas', 'lambda-with-lock-b')
  await npmRun(['ci'], lambdaFolder)
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'debug', 'package.json'))).toBe(true)
  // devDependencies are not installed.
  expect(fs.existsSync(join(lambdaFolder, 'node_modules', 'cpu-count', 'package.json'))).toBe(false)
})

test('npm build', async () => {
  const lambdaFolder = join(__dirname, 'fixtures', 'lambdas', 'lambda-no-lock')
  const stdout = await npmRun(['run', 'build'], lambdaFolder)
  expect(stdout).toMatch('build succeeded')
})

test('run Parallel', async () => {
  const lambdaFolder01 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-01')
  const lambdaFolder02 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-02')
  const lambdaFolder03 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-03')
  rimraf.sync(join(lambdaFolder02, 'build-succeeded.txt'))

  await runParallel([
    { args: ['install'], cwd: lambdaFolder01 },
    { args: ['install', ['run', 'build']], cwd: lambdaFolder02 },
    { args: ['install'], cwd: lambdaFolder03 }
  ])
  expect(fs.existsSync(join(lambdaFolder01, 'node_modules', 'debug', 'package.json'))).toBe(true)
  expect(fs.existsSync(join(lambdaFolder02, 'node_modules', 'debug', 'package.json'))).toBe(true)
  expect(fs.existsSync(join(lambdaFolder02, 'build-succeeded.txt'))).toBe(true)
  expect(fs.existsSync(join(lambdaFolder03, 'node_modules', 'debug', 'package.json'))).toBe(true)
}, TIMEOUT)

// test fails on github :(
test('run Parallel with customFunction', async () => {
  expect.assertions(2)
  const lambdaFolder01 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-c')
  rimraf.sync(join(lambdaFolder01, 'lambda_with-custom-zip-filename.zip'))

  async function customZip() {
    return await zipDirectory(lambdaFolder01, join(lambdaFolder01, 'lambda_with-custom-zip-filename.zip'))
  }

  await runParallel([{ args: ['install', customZip], cwd: lambdaFolder01 }])
  expect(fs.existsSync(join(lambdaFolder01, 'node_modules', 'debug', 'package.json'))).toBe(true)
  expect(fs.existsSync(join(lambdaFolder01, 'lambda_with-custom-zip-filename.zip'))).toBe(true)
}, TIMEOUT)

