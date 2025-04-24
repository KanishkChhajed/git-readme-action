import {Ocktokit} from "octokit"


const core = require('@actions/core')


function generate(){

    const token = core.getInput('token')
    
    try{
        // Authentication process
        try{
            const octokit = new Octokit({auth : token})
            console.log(octokit)
        }catch{
            console.log("Authentication process failed...")
        }
        

        console.log(token)
        console.log("Getting token successfully")
    }
    catch {
        console.log("Error")
    }
}

generate();