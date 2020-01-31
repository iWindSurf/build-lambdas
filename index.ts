import { debug as d } from 'debug'
import * as fs from 'fs'
import { join } from 'path'
import * as childProcess from 'child_process'

export async function npmRun(npmArgs: [string], cwd: string) {
  d('npmInstall')('')
  const command = 'npm'
  let args = npmArgs.join(' ')
  if ((args === 'install' || args === 'i') && pkgLockExists(cwd)) {
    args = 'ci'
  }
  const options = { cwd: cwd }
  console.log(`Executing ${`${command} ${args}`} in ${cwd}...`)
  try {
    await execute(command, options, args)
  } catch (e) {
    throw new Error(`${`${command} install`} failed: ` + e.message)
  }
}

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
