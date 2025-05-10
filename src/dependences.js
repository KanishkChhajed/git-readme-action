import {execSync} from 'node:child_process'

execSync(`npm install`)
execSync(`npm init -y`)
execSync(`npm install @actions/core octokit @actions/github`)
console.log("Dependencies installation complete")
