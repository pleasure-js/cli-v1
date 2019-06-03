import { spawn } from 'child_process'

const spawnDefaultOptions = {
  cwd: process.cwd()
}

const spawnRequiredOptions = {
  detached: true
}

/**
 * Daemonizer is a process manager that creates an instance to control multiple spawned processes to monitor.
 */

class Daemonizer {
  constructor () {
    this._runningProcesses = []
    /*
    todo: check if a main process is running, if so
      - check if option --force is present, if so, kill the found main process
      - exit with a message
     */
  }

  /**
   * Daemonizes something
   * Same arguments as in: [child_process.spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
   */
  start (command, args, options = {}) {
    const child = spawn(command, args, Object.assign({}, spawnDefaultOptions, options, spawnRequiredOptions))

    this._runningProcesses.push(child)
  }
}
