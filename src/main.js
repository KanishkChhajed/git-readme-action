const core = require('@actions/core')


const token = core.getInput('token')

try{
   console.log(token)
}
catch {
    console.log("Error")
}

run();