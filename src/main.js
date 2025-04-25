const {Octokit} =  require("octokit")
const github  = require("@actions/github")
const core = require('@actions/core')


async function  generate(){

    const token = core.getInput('token')
    
    try{
        // Authentication process
        const octokit = new Octokit({auth : token})
        const context = github.context
        try{
            // const [owner, repo] = process.env.github.repository.split("/");

            const { data: repoData } = await octokit.rest.repos.get({
              owner : context.repo.owner,
              repo : context.repo.repo,
            });
        
            console.log(`Repo: ${repoData.repo}, Owner: ${repoData.owner}`);
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