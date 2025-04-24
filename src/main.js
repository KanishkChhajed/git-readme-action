const {Octokit} =  require("octokit")

const core = require('@actions/core')


async function  generate(){

    const token = core.getInput('token')
    
    try{
        // Authentication process
        const octokit = new Octokit({auth : token})
        try{
            const { data: repo } = await octokit.rest.repos.get({
                owner: token.split('/')[0],
                repo: token.split('/')[1],
            });
        
            console.log(`Repo: ${repo.full_name}`);
            console.log("Successfully fetched repos:", data.length);
        }catch (error){
            console.log("Authentication process failed...")
            console.log (error)
        }
        

        // console.log(token)
        console.log("Getting token successfully")
    }
    catch  (error){
        console.log(error)
    }
}

generate();