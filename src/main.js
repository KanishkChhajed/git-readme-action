const core = require('@actions/core')

function generate(){

    const token = core.getInput('token')
    
    try{
        console.log(token)
        console.log("Getting token successfully")
    }
    catch {
        console.log("Error")
    }
}

generate();