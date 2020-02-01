const archiver = require('archiver')
import { debug as d } from 'debug'
import * as fs from 'fs-extra'
import * as path from 'path'
import { join } from 'path'
import * as childProcess from 'child_process'
import * as glob from 'glob'
import * as rimraf from 'rimraf'
import * as crypto from 'crypto'
import 'array-flat-polyfill'

type JobType = {
  args: any[]
  cwd: string
}[]

export async function runParallel(jobs: JobType) {
  await asyncForEach(jobs, async (job: any) => {
    d('runParallel')({ job })
    // check if there are nested arrays
    if (job.args.length !== job.args.flat().length) {
      d('runParallel.nested-array => wait for individual steps')(job.args)
      job.args.forEach(async (nestedJobArg: any) => {
        let jobArg = typeof nestedJobArg === 'string' ? [nestedJobArg] : nestedJobArg
        d('runParallel.nested-array')(jobArg)
        await npmRun(jobArg, job.cwd)
      })
    } else {
      await npmRun(job.args, job.cwd)
    }
  })
}

/**
 * Executes an npm command, supported:
 * ```
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
    args = 'ci --only=production'
  } else if (args === 'install' || args === 'i') {
    rimraf.sync(join(cwd, 'node_modules'))
    args = 'install --production'
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

async function asyncForEach(array: any, cb: any) {
  for (let index = 0; index < array.length; index++) {
    await cb(array[index], index, array)
  }
}

export function zipDirectory(directory: string, outputFile: string): Promise<void> {
  return new Promise(async (ok, fail) => {
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
