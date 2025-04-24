const {Octokit} =  require("octokit")

const core = require('@actions/core')


async function  generate(){

    const token = core.getInput('token')
    
    try{
        // Authentication process
        const octokit = new Octokit({auth : token})
        try{
            const { data } = await octokit.rest.repos.listForAuthenticatedUser();
            console.log("Successfully fetched repos:", data.length);
        }catch (error){
            console.log("Authentication process failed...")
            console.log (error)
        }
        

        console.log(token)
        console.log("Getting token successfully")
    }
    catch {
        console.log("Error")
    }
}

generate();