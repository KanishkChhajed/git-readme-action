const core = require('@actions/core')


const token = core.getInput('environment_variable')

try{
   console.log(token)
}
catch {
    console.log("Error")
}

run();