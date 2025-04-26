const {execSync} = require('node:child_process')

execSync(`npm install @actions/core octokit @actions/github`)
log("Dependencies installation complete")
