const {Ocktokit} =  require("octokit")

const core = require('@actions/core')


async function  generate(){

    const token = core.getInput('token')
    
    try{
        // Authentication process
        try{
            const octokit = new Octokit({auth : token})
            const {
                data: { login },
              } = await octokit.rest.users.getAuthenticated();
              console.log("Hello, %s", login)
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