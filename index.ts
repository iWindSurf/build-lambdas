const archiver = require('archiver')
import { debug as d } from 'debug'
import * as fs from 'fs-extra'
import * as path from 'path'
import { join } from 'path'
import * as childProcess from 'child_process'
import * as glob from 'glob'
import * as rimraf from 'rimraf'
import crypto from 'crypto'

type JobType = {
  args: any[]
  cwd: string
}

export async function runParallel(jobs: JobType[]) {
  await Promise.all(
    jobs.map(async job => {
      d('runParallel.nested-array => wait for individual steps')(job.args)
      for (const nestedJobArg of job.args) {
        let jobArg = typeof nestedJobArg === 'string' ? [nestedJobArg] : nestedJobArg
        d('runParallel.nested-array')(jobArg)
        await run({ args: jobArg, cwd: job.cwd })
        d('runParallel.nested-array-done')(jobArg)
      }
    })
  )
}

/**
 * Runs the correct function, based on the first argument in the job.args array.
 */
async function run(job: JobType) {
  d('run')(job.args)
  let arg: string = ''
  let fnc: Function = () => {} // init fnc
  d('run (typeof job.args)')(typeof job.args === 'function')
  if (typeof job.args === 'function') {
    fnc = <Function>job.args
    arg = 'function'
  } else {
    arg = job.args[0]
  }
  switch (arg) {
    case 'ci':
    case 'i':
    case 'install':
    case 'run':
      await npmRun(job.args, job.cwd)
      break
    case 'zip':
      await zip(job.cwd)
      break
    case 'function':
      await fnc()
      break
    default:
      console.log(`Nothing todo for ${arg}...`)
      return
  }
}

/**
 * Executes an npm command, supported:
 * ```
 * npm i
 * npm install
 * npm ci
 * npm run <script>
 * ```
 *
 * * node_modules folder is nuked before install
 * * only prod dependencies are installed
 */
export async function npmRun(npmArgs: string[], cwd: string) {
  d('npmInstall')('')
  const command = 'npm'
  let args = npmArgs.join(' ')
  if ((args === 'install' || args === 'i') && pkgLockExists(cwd)) {
    args = 'ci --only=production --quiet --no-progress'
  } else if (args === 'ci') {
    args = 'ci --only=production --quiet --no-progress'
  } else if (args === 'install' || args === 'i') {
    rimraf.sync(join(cwd, 'node_modules'))
    args = 'install --production --quiet --no-progress'
  }
  const options = { cwd: cwd }
  console.log(`Executing ${`${command} ${args}`} in ${cwd}...`)
  try {
    return await execute(command, options, args)
  } catch (e) {
    throw new Error(`${`${command} install`} failed: ` + e.message)
  }
}

/**
 * Returns true if package-lock.json exists.
 */
function pkgLockExists(lambdaFolder: string) {
  return fs.existsSync(join(lambdaFolder, 'package-lock.json'))
}

/**
 * Executes `command`. STDERR is emitted in real-time.
 *
 * If command exits with non-zero exit code, an exceprion is thrown and includes
 * the contents of STDOUT.
 *
 * @returns STDOUT (if successful).
 */
async function execute(cmd: string, opts: any, ...args: string[]) {
  const child = childProcess.spawn(cmd, args, {
    shell: true,
    stdio: ['ignore', 'pipe', 'inherit'],
    ...opts
  })
  let stdout = ''
  child.stdout.on('data', chunk => (stdout += chunk.toString()))
  return new Promise<string>((ok, fail) => {
    child.once('error', err => fail(err))
    child.once('exit', status => {
      if (status === 0) {
        return ok(stdout)
      } else {
        process.stderr.write(stdout)
        return fail(new Error(`${cmd} exited with status ${status}`))
      }
    })
  })
}

async function zip(lambdaFolder: string) {
  const zipName = join(process.cwd(), `${path.basename(lambdaFolder)}.zip`)
  await zipDirectory(lambdaFolder, zipName)
}

export async function zipDirectory(directory: string, outputFile: string): Promise<void> {
  return new Promise(async (ok, fail) => {
    console.log(`Zipping ${directory} => ${outputFile}...`)

    // The below options are needed to support following symlinks when building zip files:
    // - nodir: This will prevent symlinks themselves from being copied into the zip.
    // - follow: This will follow symlinks and copy the files within.
    const globOptions = {
      dot: true,
      nodir: true,
      follow: true,
      cwd: directory
    }
    const files = glob.sync('**', globOptions) // The output here is already sorted

    const output = fs.createWriteStream(outputFile)

    const archive = archiver('zip')
    archive.on('warning', fail)
    archive.on('error', fail)
    archive.pipe(output)

    // Append files serially to ensure file order
    for (const file of files) {
      const fullPath = path.join(directory, file)
      const [data, stat] = await Promise.all([fs.readFile(fullPath), fs.stat(fullPath)])
      stat.mode = parseInt('40755', 8)
      archive.append(data, {
        name: file,
        date: new Date('1980-01-01T00:00:00.000Z'), // reset dates to get the same hash for the same content
        mode: stat.mode
      })
    }

    archive.finalize()

    // archive has been finalized and the output file descriptor has closed, resolve promise
    output.once('close', () => ok())
  })
}

export function contentHash(data: string | Buffer | DataView) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}
