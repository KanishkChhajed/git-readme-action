const {execSync} = require('node:child_process')

execSync(`npm install @actions/core octokit @actions/github`)
console.log("Dependencies installation complete")
