const join = require('path').join
const buildLambdas = require('.')

const lambdaFolder01 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-01')
const lambdaFolder02 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-02')
const lambdaFolder03 = join('test', 'fixtures', 'lambdas', 'lambda-with-lock-03')

async function build() {
  await buildLambdas.runParallel([
    { args: ['install'], cwd: lambdaFolder01 },
    { args: ['install', ['run', 'build']], cwd: lambdaFolder02 },
    { args: ['install'], cwd: lambdaFolder03 }
  ])
}

async function zip() {
  await buildLambdas.zipDirectory(lambdaFolder01, 'lambda01.zip')
}

build()
zip()