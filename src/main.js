const github  = require("@actions/github")
const  core  =  require('@actions/core')
const {Octokit} = require('octokit')

async function  generate(){

    const token = core.getInput('token')
    
    try{
        // Authentication process
        const octokit = new Octokit({auth : token})
        try{
            // Get repository {owner}/{repo} info
            const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
           
            // Create an API using {owner}/{repo}
            const {data : reposData} = await octokit.rest.repos.get({
                owner,
                repo,
            });

            // const ref = process.env.GITHUB_SHA

            const {data : commitData} =  await octokit.rest.repos.getCommit({
                owner,
                repo,
                ref: "main",
            });

            const {data: issueData} = await  octokit.rest.issues.listForRepo({
                owner,
                repo,
            })
            const last_commit_message = commitData.commit.message;
            const repo_language = reposData.languages_url;

            const {data : languages} = await octokit.request(`GET ${repo_language}`,{
                owner,
                repo,
            });
            
            console.log(`Repos Languages : ${JSON.stringify(languages)}`)
            console.log(`Issues : ${JSON.stringify(issueData)}`)
            console.log(`Commit Message : ${JSON.stringify(last_commit_message)}`)
            // console.log(`Languages: ${JSON.stringify(repo_language)}`);
            console.log(`Repo Data: ${JSON.stringify(reposData)}`);
            console.log(`Commit Data: ${JSON.stringify(commitData)}`);
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