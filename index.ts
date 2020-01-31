import { debug as d } from 'debug'
import * as childProcess from 'child_process'

export async function npmInstall(cwd: string) {
  d('npmInstall')('')
  const command = 'npm'
  const options = { cwd: cwd }
  console.log(`Executing ${`${command} install`} in ${cwd}...`)
  try {
    await execute(command, options, 'install')
  } catch (e) {
    throw new Error(`${`${command} install`} failed: ` + e.message)
  }
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
