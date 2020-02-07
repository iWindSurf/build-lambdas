#! /usr/bin/env node
export {}
import { debug as d } from 'debug'
import yargs, { Argv } from 'yargs'
const buildLambdas = require('../.')

const args: Argv = yargs
  .scriptName('build-lambdas')
  .usage('$0 <cmd>', `Possible commands: run`)
  .command(`run [options]`, 'run build lambdas with options', (yargs: Argv) =>
    yargs
      .option('steps', {
        type: 'string',
        alias: 's',
        desc: 'Comma separeted list of steps to run, npm run scripts can be passed as run-build,run-test etc.',
        requiresArg: true
      })
      .option('lambdaFolder', {
        type: 'string',
        alias: 'l',
        desc: 'The folder containing your lambda code',
        requiresArg: true
      })
      .option('outputFile', {
        type: 'string',
        alias: 'o',
        desc: 'The name of the output (zip) file',
        requiresArg: true
      })
      .demandOption(['steps', 'outputFile'])
  )
  .demandCommand() // just print help
  .help()
  .alias('help', 'h')

const [cmd] = args.argv._

switch (cmd) {
  case 'run':
    let { steps, lambdaFolder, outputFile } = args.argv
    lambdaFolder = lambdaFolder || process.cwd()
    const stepsToRun = stepsFromOption(steps as string, lambdaFolder as string, outputFile as string)
    run(stepsToRun, lambdaFolder as string)
    break

  default:
    break
}

async function run(args: any[], cwd: string) {
  await buildLambdas.runParallel([{ args: args, cwd: cwd }])
}

function stepsFromOption(option: string, lambdaFolder: string, outputFile: string) {
  d('build-lambdas.stepsFromOption')({ option })
  let steps: any[] = []
  const options = option.split(',')

  for (const opt of options) {
    if (opt === 'zip') {
      // zip to the file specified
      let zip = async function() {
        return buildLambdas.zipDirectory(lambdaFolder, outputFile)
      }
      steps.push(zip)
    } else if (opt.substr(0, 4) === 'run-') {
      // split npm run script into array: run-build => ['run', 'build']
      let run = opt.split('-')
      d('build-lambdas.stepsFromOption-run')({ run })
      steps.push(run)
    } else {
      steps.push(opt)
    }
  }
  d('build-lambdas.stepsFromOption')({ steps })
  return steps
}
