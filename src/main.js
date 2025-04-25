const {Octokit} =  require("octokit")

const core = require('@actions/core')


async function  generate(){

    const token = core.getInput('token')
    
    try{
        // Authentication process
        const octokit = new Octokit({auth : token})
        try{
            const [owner, repo] = process.env.github.repository.split("/");

            const { data: repoData } = await octokit.rest.repos.get({
              owner,
              repo,
            });
        
            console.log(`Repo: ${repoData.full_name}`);
            console.log("Successfully authenticated and fetched repo.");
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