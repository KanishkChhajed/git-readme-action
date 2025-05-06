import {execSync} from 'node:child_process'

execSync(`npm install @actions/core octokit @actions/github toml child_process js-yaml xml2js`)
console.log("Dependencies installation complete")
