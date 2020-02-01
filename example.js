const path = require('path')
const join = path.join
const buildLambdas = require('.')

const lambdaFolder01 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-01')
const lambdaFolder02 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-02')
const lambdaFolder03 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-03')

async function buildAndZip() {
  await buildLambdas.runParallel([
    { args: ['install'], cwd: lambdaFolder01 },
    { args: ['install', ['run', 'build'], 'zip'], cwd: lambdaFolder02 },
    { args: ['install'], cwd: lambdaFolder03 }
  ])
}

async function zip(lambdaFolder) {
  const zipName = join(process.cwd(), `${path.basename(lambdaFolder)}.zip`)
  await buildLambdas.zipDirectory(lambdaFolder, zipName)
}

buildAndZip()
zip(lambdaFolder01)
zip(lambdaFolder02)
zip(lambdaFolder03)