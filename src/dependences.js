import {execSync} from 'node:child_process'

execSync(`npm ci`)
execSync(`npm init -y`)
execSync(`npm install @actions/core octokit @actions/github`)
console.log("Dependencies installation complete")
